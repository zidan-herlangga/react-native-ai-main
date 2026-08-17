import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useChat } from '@/context/ChatContext';
import { useSettings } from '@/context/SettingsContext';
import {
  buildApiMessages,
  chatWithWebSearch,
  effectiveBaseUrl,
  effectiveModel,
  mapStreamError,
  streamChat,
} from '@/lib/api';
import type { Message, WebSearchSource } from '@/lib/types';

// Throttle interval for flushing streamed tokens to the conversation. Tokens
// arrive much faster than the UI needs (and every flush re-parses Markdown),
// so updates are batched every ~40ms.
const STREAM_FLUSH_MS = 40;

const EMPTY_RESPONSE_MESSAGE =
  'Respons model kosong. Periksa model/provider di Pengaturan, atau coba lagi.';

export type ActiveStream = {
  conversationId: string;
  assistantMessageId: string;
  // 'searching' = web search enabled and the model may still be deciding to
  // call the search tool; 'streaming' = final answer tokens are flowing.
  phase: 'searching' | 'streaming';
} | null;

type StreamOptions = {
  conversationId: string;
  history: Message[];
  assistantMessage: Message;
};

type StreamingContextValue = {
  activeStream: ActiveStream;
  startStream: (options: StreamOptions) => void;
  stopStream: () => void;
};

const StreamingContext = createContext<StreamingContextValue | null>(null);

/**
 * Owns the chat completion stream at the app level. Streaming keeps running
 * even when the chat screen unmounts (e.g. the user navigates away mid-stream)
 * and only stops via stopStream() or when a new stream replaces it. Progress
 * is written straight into the conversation in ChatContext, so any mounted
 * screen — or a screen mounted later — reflects the live content.
 */
export function StreamingProvider({ children }: { children: ReactNode }) {
  const { updateConversation } = useChat();
  const { settings } = useSettings();

  const [activeStream, setActiveStream] = useState<ActiveStream>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Always-fresh refs so the async stream loop never reads stale closures.
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const updateConversationRef = useRef(updateConversation);
  updateConversationRef.current = updateConversation;

  // Patch the assistant placeholder inside the conversation. No-ops if the
  // placeholder is gone (conversation deleted/replaced by a newer stream),
  // so a stale stream can never clobber newer messages.
  const patchPlaceholder = useCallback(
    (
      conversationId: string,
      placeholderId: string,
      updater: (m: Message) => Message,
    ) => {
      updateConversationRef.current(conversationId, (c) => {
        if (!c.messages.some((m) => m.id === placeholderId)) return c;
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.id === placeholderId ? updater(m) : m,
          ),
        };
      });
    },
    [],
  );

  const startStream = useCallback(
    (options: StreamOptions) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setActiveStream({
        conversationId: options.conversationId,
        assistantMessageId: options.assistantMessage.id,
        phase: settingsRef.current.webSearchEnabled ? 'searching' : 'streaming',
      });

      const { conversationId, history, assistantMessage } = options;
      const placeholderId = assistantMessage.id;

      // Seed the conversation immediately so the list is correct even if the
      // screen unmounts or the user navigates back mid-stream.
      updateConversationRef.current(conversationId, (c) => ({
        ...c,
        messages: history,
      }));

      let accumulated = '';
      let lastFlush = 0;
      let flushTimer: ReturnType<typeof setTimeout> | null = null;

      const flush = () => {
        if (flushTimer) {
          clearTimeout(flushTimer);
          flushTimer = null;
        }
        lastFlush = Date.now();
        patchPlaceholder(conversationId, placeholderId, (m) => ({
          ...m,
          content: accumulated,
        }));
      };

      const scheduleFlush = () => {
        if (flushTimer) return;
        const remaining = STREAM_FLUSH_MS - (Date.now() - lastFlush);
        flushTimer = setTimeout(() => {
          flushTimer = null;
          lastFlush = Date.now();
          patchPlaceholder(conversationId, placeholderId, (m) => ({
            ...m,
            content: accumulated,
          }));
        }, Math.max(remaining, 0));
      };

      // Final write: content (plus model/title on first message). No-ops if
      // the placeholder is gone, so a stale stream cannot clobber newer data.
      const commitFinal = (
        content: string,
        asError: boolean,
        conv: { model?: string; title?: string; sources?: WebSearchSource[] },
      ) => {
        updateConversationRef.current(conversationId, (c) => {
          if (!c.messages.some((m) => m.id === placeholderId)) return c;
          const firstUser = history.find((m) => m.role === 'user');
          return {
            ...c,
            model: conv.model || c.model,
            title: c.title || (firstUser?.content ?? '').slice(0, 42),
            messages: c.messages.map((m) =>
              m.id === placeholderId
                ? {
                    ...m,
                    content,
                    error: asError,
                    sources: conv.sources ?? m.sources,
                  }
                : m,
            ),
          };
        });
      };

      (async () => {
        const s = settingsRef.current;
        const model = effectiveModel(s);
        const msgs = buildApiMessages(history);
        let sources: WebSearchSource[] | undefined;

        const handleToken = (token: string) => {
          setActiveStream((prev) =>
            prev && prev.phase === 'searching'
              ? { ...prev, phase: 'streaming' }
              : prev,
          );
          accumulated += token;
          scheduleFlush();
        };

        try {
          if (s.webSearchEnabled) {
            const result = await chatWithWebSearch({
              apiKey: s.apiKey,
              model,
              provider: s.provider,
              baseUrl: effectiveBaseUrl(s),
              messages: msgs,
              systemPrompt: s.systemPrompt,
              temperature: s.temperature,
              searchApiKey: s.searchApiKey,
              signal: controller.signal,
              onToken: handleToken,
            });
            sources = result.sources;
          } else {
            await streamChat({
              apiKey: s.apiKey,
              model,
              provider: s.provider,
              baseUrl: effectiveBaseUrl(s),
              messages: msgs,
              systemPrompt: s.systemPrompt,
              temperature: s.temperature,
              signal: controller.signal,
              onToken: handleToken,
            });
          }

          flush();
          const empty = !accumulated.trim();
          commitFinal(
            empty ? EMPTY_RESPONSE_MESSAGE : accumulated,
            empty,
            { model, sources },
          );
        } catch (err) {
          flush();
          if (controller.signal.aborted) {
            // Stop ditekan oleh pengguna: jangan tampilkan teks error. Simpan
            // jawaban parsial bila sudah ada; jika belum ada token sama sekali,
            // hapus placeholder agar tidak ada gelembung kosong.
            if (!accumulated.trim()) {
              updateConversationRef.current(conversationId, (c) => ({
                ...c,
                messages: c.messages.filter((m) => m.id !== placeholderId),
              }));
            } else {
              commitFinal(accumulated, false, { model, sources });
            }
          } else {
            commitFinal(
              accumulated || mapStreamError(err, s.provider),
              true,
              { model, sources },
            );
          }
        } finally {
          if (abortRef.current === controller) {
            abortRef.current = null;
            setActiveStream(null);
          }
        }
      })();
    },
    [patchPlaceholder],
  );

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const value = useMemo<StreamingContextValue>(
    () => ({ activeStream, startStream, stopStream }),
    [activeStream, startStream, stopStream],
  );

  return (
    <StreamingContext.Provider value={value}>
      {children}
    </StreamingContext.Provider>
  );
}

export function useStreaming(): StreamingContextValue {
  const ctx = useContext(StreamingContext);
  if (!ctx) throw new Error('useStreaming harus dipakai di dalam StreamingProvider');
  return ctx;
}
