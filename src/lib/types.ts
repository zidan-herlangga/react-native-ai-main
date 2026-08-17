export type Role = 'user' | 'assistant';

export type Attachment = {
  id: string;
  kind: 'image' | 'file';
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

export type Provider = 'zen' | 'groq' | 'custom';

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
};

export type ModelInfo = {
  id: string;
  name: string;
  description: string;
  free: boolean;
};

export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }
  | { type: 'file'; file: { filename: string; file_data: string } };

export type ChatCompletionMessage = {
  role: Role | 'system';
  content: string | ContentPart[];
};

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'baru saja';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(timestamp).toLocaleDateString('id-ID');
}
