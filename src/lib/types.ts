export type Role = "user" | "assistant";

export type Attachment = {
  id: string;
  kind: "image" | "file";
  name: string;
  mimeType: string;
  uri: string;
  base64?: string;
  size?: number;
};

export type WebSearchSource = {
  title: string;
  url: string;
};

export type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  error?: boolean;
  attachments?: Attachment[];
  sources?: WebSearchSource[];
  bookmarked?: boolean;
};

export type Conversation = {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

export type ProviderCategory =
  | "zen"
  | "commercial"
  | "alternative"
  | "infrastructure"
  | "custom";

export type Provider =
  // 1. OpenCode Zen
  | "zen"
  // 2. Komersial Terkemuka
  | "openai"
  | "anthropic"
  | "google"
  | "deepseek"
  // 3. Alternatif & Berkembang
  | "kimi"
  | "minimax"
  | "glm"
  // 4. Infrastruktur & Router
  | "groq"
  | "openrouter"
  | "cerebras"
  | "fireworks"
  | "deepinfra"
  | "baseten"
  | "302ai"
  // 5. Custom Self-Hosted / Reverse Proxy
  | "custom";

export type ProviderDetail = {
  id: Provider;
  name: string;
  category: ProviderCategory;
  baseUrl: string;
  defaultModel: string;
  isOpenAICompatible: boolean;
  authHeader?: string; // 'Authorization' (default) atau 'x-api-key' (Anthropic)
};

export type ThemeMode = "system" | "light" | "dark";

export type AppSettings = {
  provider: Provider;
  apiKey: string;
  model: string;
  customModel: string;
  baseUrl: string;
  ttsEnabled: boolean;
  speechLang: string;
  systemPrompt: string;
  temperature: number;
  webSearchEnabled: boolean;
  searchApiKey: string;
  toolsEnabled: boolean;
  notificationSound: boolean;
  themeMode: ThemeMode;
};

export type ModelInfo = {
  id: string;
  name: string;
  description: string;
  free: boolean;
};

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "file"; file: { filename: string; file_data: string } };

export type ChatCompletionMessage = {
  role: Role | "system";
  content: string | ContentPart[];
};

export type AppStats = {
  totalConversations: number;
  totalMessages: number;
  estimatedTokens: number;
  firstChatAt: number | null;
  lastChatAt: number | null;
  favoriteModel: string;
};

export type CrashLog = {
  id: string;
  message: string;
  stack?: string;
  timestamp: number;
  platform: string;
  osVersion: string;
  appVersion: string;
};

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(timestamp).toLocaleDateString("id-ID");
}
