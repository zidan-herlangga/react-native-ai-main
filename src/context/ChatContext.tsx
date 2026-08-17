import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { loadConversations, saveConversations } from '@/lib/storage';
import { uid, type Conversation } from '@/lib/types';

type ChatContextValue = {
  conversations: Conversation[];
  activeId: string | null;
  ready: boolean;
  openConversation: (id: string | null) => void;
  createConversation: (title?: string) => Conversation;
  updateConversation: (id: string, updater: (c: Conversation) => Conversation) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  clearConversation: (id: string) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    loadConversations().then((stored) => {
      if (!mounted) return;
      setConversations(stored);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveConversations(conversations);
    }, 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [conversations, ready]);

  const value = useMemo<ChatContextValue>(
    () => ({
      conversations,
      activeId,
      ready,
      openConversation: (id) => setActiveId(id),
      createConversation: (title = '') => {
        const now = Date.now();
        const conversation: Conversation = {
          id: uid(),
          title,
          model: '',
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        setConversations((prev) => [conversation, ...prev]);
        setActiveId(conversation.id);
        return conversation;
      },
      updateConversation: (id, updater) =>
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== id) return c;
            const next = updater(c);
            return { ...next, updatedAt: Date.now() };
          }),
        ),
      deleteConversation: (id) => {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        setActiveId((current) => (current === id ? null : current));
      },
      renameConversation: (id, title) =>
        setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c))),
      clearConversation: (id) =>
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: '', messages: [], updatedAt: Date.now() } : c)),
        ),
    }),
    [conversations, activeId, ready],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat harus dipakai di dalam ChatProvider');
  return ctx;
}
