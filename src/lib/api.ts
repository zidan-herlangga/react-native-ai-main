import { fetch } from "expo/fetch";

import { extractPdfText } from "@/lib/extract-pdf-text";
import {
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_TEMPERATURE,
  PROVIDERS_CONFIG,
} from "@/lib/models";
import { getCachedSearch, setCachedSearch } from "@/lib/searchCache";
import type {
  AppSettings,
  ChatCompletionMessage,
  ContentPart,
  Message,
  Provider,
  WebSearchSource,
} from "@/lib/types";
import { ALL_TOOLS, executeTool, type ToolResult } from "@/lib/tools";

export { effectiveModel } from "@/lib/models";

// Minimum gap between actual search API calls. Repeated queries within this
// window reuse the local cache instead of hitting the provider again.
const SEARCH_COOLDOWN_MS = 5000;

const NO_TOOLS_PROMPT =
  "Anda TIDAK memiliki akses internet atau fitur pencarian web pada percakapan ini. Jangan mengaku telah mencari di web. Jika diminta informasi terkini yang membutuhkan akses internet, sampaikan jujur bahwa Anda tidak dapat mengakses internet.";

const WEB_SEARCH_PROMPT =
  'Anda memiliki akses ke pencarian web (tool "web_search"). Gunakan tool tersebut saat pertanyaan membutuhkan informasi terkini atau sumber yang dapat diverifikasi, lalu jawab berdasarkan hasil pencarian yang diberikan.';


function zenHeaders(apiKey: string): Record<string, string> {
  const rand = () => Math.random().toString(36).slice(2);
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "User-Agent": "opencode/latest/1.3.15/cli",
    "x-opencode-client": "cli",
    "x-opencode-session": rand(),
    "x-opencode-project": rand(),
    "x-opencode-request": rand(),
  };
}

function headersFor(
  provider: Provider,
  apiKey: string,
): Record<string, string> {
  const base = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (provider === "zen") {
    return { ...base, ...zenHeaders(apiKey) };
  }
  return base;
}

export function effectiveBaseUrl(
  settings: Pick<AppSettings, "provider" | "baseUrl">,
): string {
  const url =
    settings.baseUrl.trim() || PROVIDERS_CONFIG[settings.provider]?.baseUrl || "";
  if (!url) return url;
  return /\/chat\/completions\/?$/.test(url)
    ? url
    : url.replace(/\/+$/, "") + "/chat/completions";
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Wire-level message that may carry tool_calls (assistant) or a tool result
// (role 'tool'). buildApiMessages() output is assignable to this type.
type ApiToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

type ApiChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | ContentPart[] | null;
  tool_calls?: ApiToolCall[];
  tool_call_id?: string;
};

type ParsedToolCall = {
  id: string;
  name: string;
  query: string;
  rawArgs: Record<string, unknown>;
};

// Filter out empty messages and map to the wire format accepted by the API.
// User messages with attachments become content parts: images are sent as
// base64 data URLs (vision models); other files are mentioned by name since
// the chat-completions format has no generic document channel.
export function buildApiMessages(msgs: Message[]): ChatCompletionMessage[] {
  const result: ChatCompletionMessage[] = [];
  for (const m of msgs) {
    const text = m.content.trim();
    const attachments = m.attachments?.length ? m.attachments : undefined;
    if (!text && !attachments) continue;

    if (!attachments) {
      result.push({ role: m.role, content: m.content });
      continue;
    }

    const parts: ContentPart[] = [];
    if (text) parts.push({ type: "text", text: m.content });
    for (const a of attachments) {
      if (a.kind === "image" && a.base64) {
        parts.push({
          type: "image_url",
          image_url: {
            url: `data:${a.mimeType || "image/jpeg"};base64,${a.base64}`,
          },
        });
      } else if (a.base64) {
        // Try to extract text from PDF — send as text for maximum provider compatibility
        const isPdf =
          a.mimeType === "application/pdf" ||
          a.name.toLowerCase().endsWith(".pdf");
        if (isPdf) {
          const pdfText = extractPdfText(a.base64);
          if (pdfText) {
            parts.push({
              type: "text",
              text: `[Isi dokumen ${a.name}]:\n${pdfText}`,
            });
          } else {
            // Fallback: couldn't extract text, mention the file
            parts.push({
              type: "text",
              text: `[Lampiran: ${a.name} — tidak bisa diekstrak teksnya]`,
            });
          }
        } else {
          parts.push({
            type: "file",
            file: {
              filename: a.name,
              file_data: `data:${a.mimeType || "application/octet-stream"};base64,${a.base64}`,
            },
          });
        }
      } else {
        parts.push({ type: "text", text: `[Lampiran: ${a.name}]` });
      }
    }
    result.push({
      role: m.role,
      content:
        parts.length === 1 && parts[0].type === "text" ? parts[0].text : parts,
    });
  }
  return result;
}

// Human-readable, Indonesian error text for a failed request.
export function mapStreamError(err: unknown, provider: Provider): string {
  if (err instanceof ApiError) {
    switch (err.status) {
      case 401:
      case 403:
        return "API key tidak valid atau tidak berhak. Periksa kembali API key di Pengaturan.";
      case 404:
        return "Endpoint tidak ditemukan (HTTP 404). Periksa Server URL dan nama model di Pengaturan.";
      case 429:
        return `Batas permintaan ${PROVIDERS_CONFIG[provider]?.name || provider} tercapai (429). Tunggu beberapa saat atau periksa kuota akun Anda.`;
      case 500:
        return "Server AI sedang bermasalah/sibuk (HTTP 500). Coba lagi beberapa menit lagi.";
      default:
        return err.message;
    }
  }

  if (err instanceof Error) {
    return err.message || "Terjadi kesalahan tak terduga.";
  }

  return "Terjadi kesalahan tak terduga.";
}

type StreamChatOptions = {
  apiKey: string;
  model: string;
  provider: Provider;
  baseUrl: string;
  messages: ApiChatMessage[];
  systemPrompt?: string;
  temperature?: number;
  webSearchEnabled?: boolean;
  signal?: AbortSignal;
  onToken: (token: string) => void;
};

export async function streamChat({
  apiKey,
  model,
  provider,
  baseUrl,
  messages,
  systemPrompt,
  temperature,
  webSearchEnabled,
  signal,
  onToken,
}: StreamChatOptions): Promise<void> {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      ...headersFor(provider, apiKey),
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model,
      messages: withSystemPrompt(messages, systemPrompt, webSearchEnabled),
      stream: true,
      temperature: temperature ?? DEFAULT_TEMPERATURE,
    }),
    signal,
  });

  if (!response.ok) {
    throw await errorFrom(response);
  }

  if (!response.body) {
    throw new Error("Respons tidak memiliki body stream.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let sawDataLine = false;

  // Process a single SSE event (the block of "data: ..." lines) and return
  // true when the stream should stop ([DONE] or finish_reason).
  const processEvent = (event: string): boolean => {
    let stopped = false;
    for (const line of event.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      sawDataLine = true;
      const data = trimmed.slice(5).trim();
      if (!data) continue;
      if (data === "[DONE]") {
        stopped = true;
        continue;
      }
      try {
        const json = JSON.parse(data) as {
          choices?: {
            delta?: { content?: string };
            message?: { content?: string };
            finish_reason?: string | null;
          }[];
          error?: { message?: string; type?: string };
        };
        // Detect SSE error events (e.g. {"error":{"message":"...","type":"...","code":429}})
        if (json.error) {
          const errObj = json.error as {
            message?: string;
            type?: string;
            code?: number;
          };
          throw new ApiError(
            errObj.code ?? 500,
            errObj.message ?? JSON.stringify(errObj),
          );
        }
        const choice = json.choices?.[0];
        const delta = choice?.delta?.content ?? choice?.message?.content;
        if (typeof delta === "string" && delta.length > 0) {
          onToken(delta);
        }
        if (choice?.finish_reason) stopped = true;
      } catch {
        // abaikan chunk yang tidak valid
      }
    }
    return stopped;
  };

  // Append a raw chunk (normalizing CRLF) and process any complete events.
  const feed = (chunk: string): boolean => {
    buffer += chunk.replace(/\r\n/g, "\n");
    let boundary: number;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const event = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      if (processEvent(event)) return true;
    }
    return false;
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (feed(decoder.decode(value, { stream: true }))) return;
    }

    // Trailing data without a closing blank line (or a final JSON response
    // when the server ignores `stream: true` entirely).
    if (buffer.trim()) {
      if (sawDataLine) {
        processEvent(buffer);
      } else {
        try {
          const json = JSON.parse(buffer.trim()) as {
            choices?: { message?: { content?: string } }[];
          };
          const content = json.choices?.[0]?.message?.content;
          if (typeof content === "string" && content.length > 0) {
            onToken(content);
          }
        } catch {
          // sudah dicoba — buang sisa buffer yang tidak dapat diparse
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

type ChatOptions = {
  apiKey: string;
  model: string;
  provider: Provider;
  baseUrl: string;
  messages: ApiChatMessage[];
  systemPrompt?: string;
  temperature?: number;
  webSearchEnabled?: boolean;
  signal?: AbortSignal;
};

export async function chat({
  apiKey,
  model,
  provider,
  baseUrl,
  messages,
  systemPrompt,
  temperature,
  webSearchEnabled,
  signal,
}: ChatOptions): Promise<string> {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: headersFor(provider, apiKey),
    body: JSON.stringify({
      model,
      messages: withSystemPrompt(messages, systemPrompt, webSearchEnabled),
      stream: false,
      temperature: temperature ?? DEFAULT_TEMPERATURE,
    }),
    signal,
  });

  if (!response.ok) {
    throw await errorFrom(response);
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Format respons tidak dikenal.");
  }
  return content;
}

type ChatWithWebSearchOptions = {
  apiKey: string;
  model: string;
  provider: Provider;
  baseUrl: string;
  messages: ChatCompletionMessage[];
  systemPrompt?: string;
  temperature?: number;
  searchApiKey: string;
  webSearchEnabled?: boolean;
  signal?: AbortSignal;
  onToken: (token: string) => void;
};

export type ChatWithWebSearchResult = {
  content: string;
  sources: WebSearchSource[];
};

// Non-streaming probe that advertises all tools (web_search, calculator,
// execute_code, convert_unit). The model either answers directly or asks the
// app to run one or more tools first.
async function chatWithToolProbe(opts: {
  apiKey: string;
  model: string;
  provider: Provider;
  baseUrl: string;
  messages: ApiChatMessage[];
  systemPrompt?: string;
  temperature?: number;
  webSearchEnabled?: boolean;
  signal?: AbortSignal;
}): Promise<
  | { type: "content"; content: string }
  | {
      type: "tool_calls";
      assistantMessage: ApiChatMessage;
      toolCalls: ParsedToolCall[];
    }
> {
  const tools = opts.webSearchEnabled ? ALL_TOOLS : ALL_TOOLS.filter((t) => t.function.name !== "web_search");

  const response = await fetch(opts.baseUrl, {
    method: "POST",
    headers: headersFor(opts.provider, opts.apiKey),
    body: JSON.stringify({
      model: opts.model,
      messages: withSystemPrompt(
        opts.messages,
        opts.systemPrompt,
        opts.webSearchEnabled,
      ),
      stream: false,
      temperature: opts.temperature ?? DEFAULT_TEMPERATURE,
      tools,
      tool_choice: "auto",
    }),
    signal: opts.signal,
  });

  if (!response.ok) {
    throw await errorFrom(response);
  }

  const json = (await response.json()) as {
    choices?: {
      message?: {
        content?: string | null;
        tool_calls?: ApiToolCall[];
      };
    }[];
  };
  const message = json.choices?.[0]?.message;
  if (message?.tool_calls?.length) {
    const toolCalls: ParsedToolCall[] = [];
    for (const tc of message.tool_calls) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments) as Record<string, unknown>;
      } catch {
        // argumen tidak valid — pakai objek kosong
      }
      toolCalls.push({
        id: tc.id,
        name: tc.function.name,
        query: typeof args.query === "string" ? args.query.trim() : "",
        rawArgs: args,
      });
    }
    return {
      type: "tool_calls",
      assistantMessage: {
        role: "assistant",
        content: message.content ?? null,
        tool_calls: message.tool_calls,
      },
      toolCalls,
    };
  }
  return { type: "content", content: message?.content ?? "" };
}

// Execute all requested tool calls with full args and return results
// ready to be appended as role:'tool' messages.
async function executeToolCallsFull(
  toolCalls: (ParsedToolCall & { rawArgs: Record<string, unknown> })[],
  searchApiKey: string,
  signal?: AbortSignal,
): Promise<ToolResult[]> {
  return Promise.all(
    toolCalls.map(async (tc) => {
      if (tc.name === "web_search") {
        const query = typeof tc.rawArgs.query === "string" ? tc.rawArgs.query : "informasi terkini";
        const result = await executeSearch(query, searchApiKey, signal);
        return { toolCallId: tc.id, name: tc.name, result: result.content };
      }
      const result = await executeTool(tc.name, tc.rawArgs);
      return { toolCallId: tc.id, name: tc.name, result };
    }),
  );
}

// Stream a completion and return the full accumulated text.
async function streamCollect(opts: {
  apiKey: string;
  model: string;
  provider: Provider;
  baseUrl: string;
  messages: ApiChatMessage[];
  systemPrompt?: string;
  temperature?: number;
  webSearchEnabled?: boolean;
  signal?: AbortSignal;
  onToken: (token: string) => void;
}): Promise<string> {
  let accumulated = "";
  await streamChat({
    ...opts,
    onToken: (token) => {
      accumulated += token;
      opts.onToken(token);
    },
  });
  return accumulated;
}

// Cooldown + local cache guard around the real search call. Cache hits skip
// the API entirely; concurrent searches run one at a time spaced by the
// cooldown so a model asking for several searches at once cannot hammer the
// provider.
let lastSearchAt = 0;
let searchChain: Promise<unknown> | null = null;

async function executeSearch(
  query: string,
  searchApiKey: string,
  signal?: AbortSignal,
): Promise<{ content: string; sources: WebSearchSource[] }> {
  const cached = await getCachedSearch(query);
  if (cached) return cached;

  const prev = searchChain ?? Promise.resolve();
  const myChain = prev.then(run, run);
  searchChain = myChain;
  try {
    return (await myChain) as { content: string; sources: WebSearchSource[] };
  } finally {
    if (searchChain === myChain) searchChain = null;
  }

  async function run() {
    const again = await getCachedSearch(query);
    if (again) return again;

    const wait = lastSearchAt + SEARCH_COOLDOWN_MS - Date.now();
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

    lastSearchAt = Date.now();
    const result = await performSearch(query, searchApiKey, signal);
    await setCachedSearch(query, result);
    return result;
  }
}

// With a configured Tavily key Tavily is used; otherwise the app talks to
// Exa's hosted MCP server (the same search backend OpenCode uses — no API key
// required, rate-limited free plan), falling back to DuckDuckGo's Instant
// Answer API when Exa is unreachable or rate-limited.
async function performSearch(
  query: string,
  searchApiKey: string,
  signal?: AbortSignal,
): Promise<{ content: string; sources: WebSearchSource[] }> {
  const key = searchApiKey.trim();
  if (key) return searchTavily(query, key, signal);
  try {
    return await searchExaMCP(query, signal);
  } catch {
    return searchDuckDuckGo(query, signal);
  }
}

// ─── Exa MCP (same backend as OpenCode's built-in websearch) ───────────────
// Minimal streamable-HTTP MCP client: initialize once for a session id, then
// call the web_search_exa tool. The tool text is plain-formatted results.
const EXA_MCP_URL = "https://mcp.exa.ai/mcp?tools=web_search_exa";

async function mcpFetch(
  url: string,
  sessionId: string | null,
  body: unknown,
  signal?: AbortSignal,
): Promise<{ sessionId: string | null; json: unknown }> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      "Gagal terhubung ke layanan pencarian (Exa MCP).",
    );
  }

  const nextSession = response.headers.get("mcp-session-id") ?? sessionId;
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  if (contentType.includes("text/event-stream")) {
    const dataLine = text
      .split("\n")
      .find((line) => line.trim().startsWith("data:"));
    const data = dataLine ? dataLine.trim().slice(5).trim() : "";
    if (!data) return { sessionId: nextSession, json: null };
    return { sessionId: nextSession, json: JSON.parse(data) as unknown };
  }

  return {
    sessionId: nextSession,
    json: text ? (JSON.parse(text) as unknown) : null,
  };
}

type ExaMcpContent = { type?: string; text?: string };

async function searchExaMCP(
  query: string,
  signal?: AbortSignal,
): Promise<{ content: string; sources: WebSearchSource[] }> {
  const init = await mcpFetch(
    EXA_MCP_URL,
    null,
    {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "kawanmodel", version: "1.0.0" },
      },
    },
    signal,
  );

  const call = await mcpFetch(
    EXA_MCP_URL,
    init.sessionId,
    {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "web_search_exa",
        arguments: { query, numResults: 5 },
      },
    },
    signal,
  );

  const result = (
    call.json as {
      result?: { content?: ExaMcpContent[]; isError?: boolean };
    } | null
  )?.result;
  if (result?.isError) {
    throw new ApiError(0, "Pencarian Exa mengembalikan error.");
  }

  const text = result?.content?.[0]?.text ?? "";
  const blocks = text
    .split("\n---\n")
    .map((b) => b.trim())
    .filter(Boolean);

  const sources: WebSearchSource[] = [];
  const parts: string[] = [];

  for (const block of blocks) {
    const url = block.match(/URL:\s*(\S+)/)?.[1]?.trim() ?? "";
    if (!url) continue;
    const title = block.match(/Title:\s*(.+)/)?.[1]?.trim() ?? url;
    sources.push({ title, url });

    let snippet = "";
    const hlIndex = block.indexOf("Highlights:");
    if (hlIndex !== -1) {
      const lines = block
        .slice(hlIndex + "Highlights:".length)
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length) snippet = lines.join(" ");
    }
    if (!snippet) {
      snippet = block.match(/Text:\s*(.+)/)?.[1]?.trim() ?? "";
    }
    parts.push(snippet ? `${title}\n${url}\n${snippet}` : `${title}\n${url}`);
  }

  return {
    content: parts.length ? parts.join("\n\n") : "Tidak ada hasil pencarian.",
    sources,
  };
}

async function searchTavily(
  query: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<{ content: string; sources: WebSearchSource[] }> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: 5,
      search_depth: "basic",
      include_answer: false,
    }),
    signal,
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      "Gagal memanggil API pencarian (Tavily). Periksa API key di Pengaturan.",
    );
  }

  const json = (await response.json()) as {
    results?: { title?: string; url?: string; content?: string }[];
  };
  const results = (json.results ?? []).slice(0, 5);
  const sources: WebSearchSource[] = results
    .map((r) => ({
      title: r.title?.trim() || r.url || "Tanpa judul",
      url: r.url || "",
    }))
    .filter((s) => !!s.url);
  const content = results
    .map(
      (r, i) =>
        `${i + 1}. ${r.title ?? ""}\n${r.url ?? ""}\n${r.content ?? ""}`,
    )
    .join("\n\n");
  return { content: content || "Tidak ada hasil pencarian.", sources };
}

type DdgTopic = {
  Text?: string;
  FirstURL?: string;
  Topics?: DdgTopic[];
};

async function searchDuckDuckGo(
  query: string,
  signal?: AbortSignal,
): Promise<{ content: string; sources: WebSearchSource[] }> {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new ApiError(response.status, "Gagal memanggil layanan pencarian.");
  }

  const json = (await response.json()) as {
    AbstractText?: string;
    Heading?: string;
    AbstractURL?: string;
    RelatedTopics?: DdgTopic[];
  };

  const sources: WebSearchSource[] = [];
  const parts: string[] = [];

  if (json.AbstractText) {
    sources.push({
      title: json.Heading || "Ringkasan",
      url: json.AbstractURL || "",
    });
    parts.push(json.AbstractText);
  }

  const walk = (items?: DdgTopic[]) => {
    if (!items) return;
    for (const item of items) {
      if (item.Topics) {
        walk(item.Topics);
        continue;
      }
      if (item.Text && item.FirstURL) {
        sources.push({ title: item.Text.slice(0, 80), url: item.FirstURL });
        parts.push(item.Text);
      }
    }
  };
  walk(json.RelatedTopics);

  return {
    content: parts.length ? parts.join("\n\n") : "Tidak ada hasil pencarian.",
    sources: sources.slice(0, 6),
  };
}

/**
 * Tool-aware completion. The model may decide to call any registered tool
 * (web_search, calculator, execute_code, convert_unit); the app then runs
 * the requested tools and streams the final answer with results in context.
 */
export async function chatWithWebSearch({
  apiKey,
  model,
  provider,
  baseUrl,
  messages,
  systemPrompt,
  temperature,
  searchApiKey,
  webSearchEnabled = true,
  signal,
  onToken,
}: ChatWithWebSearchOptions): Promise<ChatWithWebSearchResult> {
  const probe = await chatWithToolProbe({
    apiKey,
    model,
    provider,
    baseUrl,
    messages,
    systemPrompt,
    temperature,
    webSearchEnabled,
    signal,
  });

  // The model answered directly — stream it for a consistent UI.
  if (probe.type === "content") {
    const content = await streamCollect({
      apiKey,
      model,
      provider,
      baseUrl,
      messages,
      systemPrompt,
      temperature,
      webSearchEnabled,
      signal,
      onToken,
    });
    return { content, sources: [] };
  }

  // Execute every requested tool, then stream the final answer with results.
  const toolResults = await executeToolCallsFull(probe.toolCalls, searchApiKey, signal);

  const nextMessages: ApiChatMessage[] = [
    ...messages,
    probe.assistantMessage,
    ...toolResults.map((t) => ({
      role: "tool" as const,
      tool_call_id: t.toolCallId,
      content: t.result,
    })),
  ];

  const content = await streamCollect({
    apiKey,
    model,
    provider,
    baseUrl,
    messages: nextMessages,
    systemPrompt,
    temperature,
    webSearchEnabled,
    signal,
    onToken,
  });

  // Collect sources only from web_search results
  const sources: WebSearchSource[] = [];
  for (const t of toolResults) {
    if (t.name === "web_search") {
      const cached = await getCachedSearch(t.result.slice(0, 100));
      if (cached) sources.push(...cached.sources);
    }
  }

  return { content, sources };
}

function withSystemPrompt(
  messages: ApiChatMessage[],
  systemPrompt?: string,
  webSearchEnabled = false,
): ApiChatMessage[] {
  const parts = [DEFAULT_SYSTEM_PROMPT];
  parts.push(webSearchEnabled ? WEB_SEARCH_PROMPT : NO_TOOLS_PROMPT);
  const custom = systemPrompt?.trim();
  if (custom) parts.push(custom);
  return [{ role: "system", content: parts.join("\n\n") }, ...messages];
}

async function errorFrom(response: Response): Promise<ApiError> {
  let message = `Terjadi kesalahan (HTTP ${response.status})`;
  try {
    const text = await response.text();
    try {
      const json = JSON.parse(text) as {
        error?: { message?: string };
        message?: string;
      };
      message = json.error?.message ?? json.message ?? text;
    } catch {
      message = text || message;
    }
  } catch {
    // biarkan pesan default
  }
  return new ApiError(response.status, message);
}
