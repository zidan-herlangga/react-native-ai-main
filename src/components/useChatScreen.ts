import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  type FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { useChat } from "@/context/ChatContext";
import { useSettings } from "@/context/SettingsContext";
import { useStreaming } from "@/context/StreamingContext";
import {
  buildApiMessages,
  chat,
  effectiveBaseUrl,
  effectiveModel,
} from "@/lib/api";
import { stripMarkdown } from "@/lib/format";
import { DEFAULT_SYSTEM_PROMPT, displayModelName } from "@/lib/models";
import type { Attachment, Message } from "@/lib/types";
import { uid } from "@/lib/types";

/* ──────────────── Types ──────────────── */

const STICK_THRESHOLD = 120;

export type ChatError = {
  message: string;
  dismiss: () => void;
};

export type ChatScreenLogic = {
  // State
  messages: Message[];
  input: string;
  streaming: boolean;
  searching: boolean;
  error: ChatError | null;
  modelPickerVisible: boolean;
  toast: string | null;
  boundId: string | null;
  modelName: string;
  headerTitle: string;
  conversationTitle?: string;
  attachments: Attachment[];
  summarizing: boolean;
  editingMessageId: string | null;
  editingText: string;

  // Actions
  setInput: (text: string) => void;
  setModelPickerVisible: (visible: boolean) => void;
  setEditingText: (text: string) => void;
  sendText: (text: string) => Promise<void>;
  handleSend: () => void;
  handleStop: () => void;
  handleRegenerate: (assistantId: string) => Promise<void>;
  handleDelete: (id: string) => void;
  handleCopy: (text: string) => Promise<void>;
  handleNewChat: () => void;
  handleBookmark: (id: string) => void;
  handleStartEdit: (id: string, text: string) => void;
  handleCancelEdit: () => void;
  handleSaveEdit: () => void;
  handleSummarize: () => void;
  setModel: (id: string) => void;
  setCustomModel: (id: string) => void;
  scrollToEnd: () => void;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  handleContentSizeChange: () => void;
  handleLayout: () => void;
  listRef: React.RefObject<FlatList<Message> | null>;

  // Attachments
  addImageAttachments: (fromCamera: boolean) => Promise<void>;
  addDocumentAttachments: () => Promise<void>;
  removeAttachment: (id: string) => void;
};

/* ──────────────── Hook ──────────────── */

export function useChatScreenLogic(
  conversationId?: string,
  showBack?: boolean,
  initialMessage?: string,
): ChatScreenLogic {
  const router = useRouter();
  const { settings, setModel, setCustomModel } = useSettings();
  const { activeStream, startStream, stopStream } = useStreaming();
  const {
    conversations,
    ready,
    openConversation,
    createConversation,
    updateConversation,
  } = useChat();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialMessage ?? "");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const clearAttachments = useCallback(() => setAttachments([]), []);
  const [rawError, setRawError] = useState<string | null>(null);
  const [modelPickerVisible, setModelPickerVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [boundId, setBoundId] = useState<string | null>(conversationId ?? null);
  const [summarizing, setSummarizing] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const listRef = useRef<FlatList<Message> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Whether the list should keep following new content (true while the user
  // is at/near the bottom). Paused when the user scrolls up mid-stream.
  const stickRef = useRef(true);

  /* ── Derived state ── */
  const conversation = useMemo(() => {
    const id = conversationId ?? boundId;
    if (!id) return undefined;
    return conversations.find((c) => c.id === id);
  }, [conversations, conversationId, boundId]);

  // A stream is "active" for this screen only when it belongs to the bound
  // conversation — a stream running on another conversation keeps running in
  // the background without locking this screen.
  const myConvId = conversationId ?? boundId;
  const streaming = !!activeStream && activeStream.conversationId === myConvId;
  // Web search enabled and the model hasn't started answering yet.
  const searching =
    streaming && activeStream?.phase === "searching";

  const modelName = useMemo(() => displayModelName(settings), [settings]);

  const headerTitle = useMemo(() => {
    if (showBack) return conversation?.title || "Percakapan";
    return "OrbitChat";
  }, [showBack, conversation?.title]);

  const error: ChatError | null = useMemo(
    () =>
      rawError ? { message: rawError, dismiss: () => setRawError(null) } : null,
    [rawError],
  );

  /* ── Effects ── */

  // Load conversation messages when boundId changes
  useEffect(() => {
    if (!ready) return;

    if (boundId) {
      const conv = conversations.find((c) => c.id === boundId);
      if (conv) {
        setMessages(conv.messages);
        openConversation(boundId);
      }
    } else {
      setMessages([]);
    }
  }, [boundId, ready, openConversation, conversations]);

  /* ── Helpers ── */

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd?.({ animated: true });
    });
  }, []);

  // Track whether the user is near the bottom. While false, new tokens
  // won't yank the list down behind the user's back. We only "unstick" on an
  // actual upward drag (offset decreasing) — programmatic scroll-to-end and
  // viewport changes (keyboard opening/closing) must NOT silently unstick it.
  const lastOffsetRef = useRef(0);
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const offset = contentOffset.y;
    const distanceFromBottom =
      contentSize.height - (offset + layoutMeasurement.height);
    const scrolledUp = offset < lastOffsetRef.current - 2;
    lastOffsetRef.current = offset;
    if (distanceFromBottom < STICK_THRESHOLD) {
      stickRef.current = true;
    } else if (scrolledUp) {
      stickRef.current = false;
    }
  }, []);

  // Only auto-follow content growth while the user is at/near the bottom.
  const handleContentSizeChange = useCallback(() => {
    if (!stickRef.current) return;
    scrollToEnd();
  }, [scrollToEnd]);

  // Re-follow when the list frame resizes (e.g. keyboard opens/closes) so the
  // latest message stays visible above the input.
  const handleLayout = useCallback(() => {
    if (!stickRef.current) return;
    scrollToEnd();
  }, [scrollToEnd]);

  // Scroll to the very end once streaming finishes so the action buttons
  // below the last message are not hidden below the fold — unless the user
  // scrolled away to read earlier content.
  const wasStreamingRef = useRef(false);
  useEffect(() => {
    if (wasStreamingRef.current && !streaming) {
      wasStreamingRef.current = false;
      if (!stickRef.current) return;
      const timer = setTimeout(scrollToEnd, 80);
      return () => clearTimeout(timer);
    }
    if (streaming) wasStreamingRef.current = true;
  }, [streaming, scrollToEnd]);

  const commitConversation = useCallback(
    (convId: string, msgs: Message[]) => {
      const firstUser = msgs.find((m) => m.role === "user");
      updateConversation(convId, (c) => ({
        ...c,
        model: effectiveModel(settings) || c.model,
        title: c.title || (firstUser?.content ?? "").slice(0, 42),
        messages: msgs,
      }));
    },
    [settings, updateConversation],
  );

  /* ── Actions ── */

  const sendText = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if ((!text && attachments.length === 0) || streaming) return;
      Keyboard.dismiss();

      if (!settings.apiKey.trim() && settings.provider !== "custom") {
        setRawError("Masukkan API Key di Pengaturan terlebih dahulu.");
        router.push("/settings");
        return;
      }

      let conv = conversation;
      if (!conv) {
        conv = createConversation(text.slice(0, 42) || "Pesan baru");
        setBoundId(conv.id);
      }

      const userMsg: Message = {
        id: uid(),
        role: "user",
        content: text,
        createdAt: Date.now(),
        attachments: attachments.length ? attachments : undefined,
      };
      const assistantMsg: Message = {
        id: uid(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      const nextMessages = [...messages, userMsg, assistantMsg];
      stickRef.current = true;
      setMessages(nextMessages);
      setInput("");
      setRawError(null);
      clearAttachments();

      // Streaming is owned by the app-level StreamingProvider, so it keeps
      // running even if this screen unmounts. startStream seeds the
      // conversation immediately and streams into it in the background.
      startStream({
        conversationId: conv.id,
        history: nextMessages,
        assistantMessage: assistantMsg,
      });
    },
    [
      streaming,
      attachments,
      settings.apiKey,
      settings.provider,
      conversation,
      messages,
      createConversation,
      startStream,
      clearAttachments,
      router,
    ],
  );

  const handleSend = useCallback(() => {
    sendText(input);
  }, [input, sendText]);

  const handleStop = useCallback(() => {
    stopStream();
  }, [stopStream]);

  const handleRegenerate = useCallback(
    async (assistantId: string) => {
      if (streaming) return;

      const idx = messages.findIndex((m) => m.id === assistantId);
      if (idx <= 0 || !boundId) return;

      let userIdx = -1;
      for (let i = idx - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          userIdx = i;
          break;
        }
      }
      if (userIdx === -1) return;

      const base = messages.slice(0, idx);
      const assistantMsg: Message = {
        id: uid(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };
      const next = [...base, assistantMsg];
      stickRef.current = true;
      setMessages(next);
      setRawError(null);
      startStream({
        conversationId: boundId,
        history: next,
        assistantMessage: assistantMsg,
      });
    },
    [streaming, messages, boundId, startStream],
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (streaming) return;
      const next = messages.filter((m) => m.id !== id);
      setMessages(next);
      if (boundId) commitConversation(boundId, next);
    },
    [streaming, messages, boundId, commitConversation],
  );

  const handleCopy = useCallback(
    async (text: string) => {
      try {
        const { setStringAsync } = await import("expo-clipboard");
        await setStringAsync(stripMarkdown(text));
        showToast("Teks disalin ke clipboard");
      } catch {
        showToast("Gagal menyalin teks");
      }
    },
    [showToast],
  );

  /* ── Attachments ── */

  const addImageAttachments = useCallback(async (fromCamera: boolean) => {
    const pickOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      base64: true,
      quality: 0.6,
      allowsMultipleSelection: !fromCamera,
      selectionLimit: fromCamera ? 1 : 0,
    };

    let result: ImagePicker.ImagePickerResult;
    if (fromCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Izin kamera ditolak",
          "Izinkan akses kamera di pengaturan perangkat untuk mengambil foto.",
        );
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        ...pickOptions,
        allowsMultipleSelection: false,
        selectionLimit: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync(pickOptions);
    }

    if (result.canceled) return;
    const picked: Attachment[] = result.assets
      .filter((a) => !!a.base64)
      .map((a) => ({
        id: uid(),
        kind: "image" as const,
        name: a.fileName || "gambar.jpg",
        mimeType: a.mimeType || "image/jpeg",
        uri: a.uri,
        base64: a.base64 ?? undefined,
        size: a.fileSize,
      }));
    if (picked.length) setAttachments((prev) => [...prev, ...picked]);
  }, []);

  const addDocumentAttachments = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const picked: Attachment[] = [];
    for (const a of result.assets) {
      let base64: string | undefined;
      try {
        const file = new File(a.uri);
        const bytes = await file.bytes();
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        base64 = btoa(binary);
      } catch {
        // file too large or unreadable — attach without base64
      }
      picked.push({
        id: uid(),
        kind: "file" as const,
        name: a.name,
        mimeType: a.mimeType || "application/octet-stream",
        uri: a.uri,
        base64,
        size: a.size,
      });
    }
    if (picked.length) setAttachments((prev) => [...prev, ...picked]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleNewChat = useCallback(() => {
    if (streaming) stopStream();
    stickRef.current = true;
    setBoundId(null);
    setMessages([]);
    setRawError(null);
    setAttachments([]);
    openConversation(null);
  }, [streaming, stopStream, openConversation]);

  const handleSetModel = useCallback(
    (id: string) => {
      if (settings.provider === "zen") {
        if (settings.model !== id) setModel(id);
      } else {
        if (settings.customModel !== id) setCustomModel(id);
      }
    },
    [
      settings.provider,
      settings.model,
      settings.customModel,
      setModel,
      setCustomModel,
    ],
  );

  /* ── Bookmark ── */

  const handleBookmark = useCallback(
    (id: string) => {
      const next = messages.map((m) =>
        m.id === id ? { ...m, bookmarked: !m.bookmarked } : m,
      );
      setMessages(next);
      if (boundId) commitConversation(boundId, next);
    },
    [messages, boundId, commitConversation],
  );

  /* ── Edit ── */

  const handleStartEdit = useCallback(
    (id: string, text: string) => {
      setEditingMessageId(id);
      setEditingText(text);
    },
    [],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditingText("");
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingMessageId || !editingText.trim()) return;

    const editedIdx = messages.findIndex((m) => m.id === editingMessageId);
    if (editedIdx === -1) return;

    // Remove the edited message and all subsequent messages
    const next = messages.slice(0, editedIdx);
    setEditingMessageId(null);
    setEditingText("");
    setRawError(null);

    if (boundId) commitConversation(boundId, next);

    // Re-send the edited text
    setTimeout(() => {
      sendText(editingText.trim());
    }, 100);
  }, [editingMessageId, editingText, messages, boundId, commitConversation, sendText]);

  /* ── Summarize ── */

  const handleSummarize = useCallback(async () => {
    if (streaming || summarizing || messages.length < 2) return;
    if (!settings.apiKey.trim() && settings.provider !== "custom") {
      setRawError("Masukkan API Key di Pengaturan terlebih dahulu.");
      router.push("/settings");
      return;
    }

    let conv = conversation;
    if (!conv) {
      conv = createConversation("Ringkasan");
      setBoundId(conv.id);
    }

    setSummarizing(true);
    setRawError(null);

    const summaryPrompt =
      "Ringkas percakapan ini dalam 3-5 kalimat yang padat dan jelas. Fokus pada poin-poin utama yang dibahas.";

    const summaryUserMsg: Message = {
      id: uid(),
      role: "user",
      content: summaryPrompt,
      createdAt: Date.now(),
    };
    const summaryAssistantMsg: Message = {
      id: uid(),
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    };

    const summaryMessages = [...messages, summaryUserMsg, summaryAssistantMsg];
    setMessages(summaryMessages);
    stickRef.current = true;

    try {
      const model = effectiveModel(settings);
      const allMsgs = buildApiMessages(summaryMessages);
      const systemParts = [DEFAULT_SYSTEM_PROMPT];
      const customPrompt = settings.systemPrompt?.trim();
      if (customPrompt) systemParts.push(customPrompt);

      const result = await chat({
        apiKey: settings.apiKey,
        model,
        provider: settings.provider,
        baseUrl: effectiveBaseUrl(settings),
        messages: [
          { role: "system", content: systemParts.join("\n\n") },
          ...allMsgs,
        ],
        temperature: settings.temperature,
      });

      const finalAssistant: Message = {
        ...summaryAssistantMsg,
        content: result || "Tidak dapat membuat ringkasan.",
      };
      const finalMessages = [...messages, summaryUserMsg, finalAssistant];
      setMessages(finalMessages);
      commitConversation(conv.id, finalMessages);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal membuat ringkasan.";
      const errorAssistant: Message = {
        ...summaryAssistantMsg,
        content: errorMsg,
        error: true,
      };
      const finalMessages = [...messages, summaryUserMsg, errorAssistant];
      setMessages(finalMessages);
      commitConversation(conv.id, finalMessages);
    } finally {
      setSummarizing(false);
    }
  }, [
    streaming,
    summarizing,
    messages,
    settings,
    conversation,
    createConversation,
    commitConversation,
    router,
  ]);

  return {
    messages,
    input,
    streaming,
    searching,
    error,
    modelPickerVisible,
    toast,
    boundId,
    modelName,
    headerTitle,
    conversationTitle: conversation?.title,
    attachments,
    summarizing,
    editingMessageId,
    editingText,

    setInput,
    setModelPickerVisible,
    setEditingText,
    sendText,
    handleSend,
    handleStop,
    handleRegenerate,
    handleDelete,
    handleCopy,
    handleNewChat,
    handleBookmark,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleSummarize,
    setModel: handleSetModel,
    setCustomModel: handleSetModel,
    scrollToEnd,
    handleScroll,
    handleContentSizeChange,
    handleLayout,
    listRef,

    addImageAttachments,
    addDocumentAttachments,
    removeAttachment,
  };
}
