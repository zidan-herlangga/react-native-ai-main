import type {
  AppSettings,
  ModelInfo,
  Provider,
  ProviderDetail,
} from "@/lib/types";

export const DEFAULT_ZEN_MODEL = "big-pickle";
export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
export const DEFAULT_TEMPERATURE = 0.7;

export const DEFAULT_SYSTEM_PROMPT = [
  "Anda adalah AI assistant yang ramah dan membantu.",
  "Jika ditanya model atau identitas Anda, jawab bahwa Anda adalah AI assistant.",
  "Jangan membuat tautan atau sumber yang tidak Anda yakini benar.",
].join(" ");

// ============================================================================
// 1. DAFTAR BASE URL & ENDPOINT SETIAP PROVIDER
// ============================================================================

export const PROVIDERS_CONFIG: Record<Provider, ProviderDetail> = {
  // 1. OpenCode Zen
  zen: {
    id: "zen",
    name: "OpenCode Zen",
    category: "zen",
    baseUrl: "https://opencode.ai/zen/v1", // Sub-path khusus OpenCode
    defaultModel: "big-pickle",
    isOpenAICompatible: true,
  },

  // 2. Komersial Terkemuka
  openai: {
    id: "openai",
    name: "OpenAI",
    category: "commercial",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    isOpenAICompatible: true,
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic (Claude)",
    category: "commercial",
    baseUrl: "https://api.anthropic.com/v1", // Endpoint Native (/messages)
    defaultModel: "claude-sonnet-5",
    isOpenAICompatible: false,
    authHeader: "x-api-key",
  },
  google: {
    id: "google",
    name: "Google (Gemini)",
    category: "commercial",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", // Sub-path OpenAI Gemini
    defaultModel: "gemini-2.5-flash",
    isOpenAICompatible: true,
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    category: "commercial",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-v4-flash",
    isOpenAICompatible: true,
  },

  // 3. Model Alternatif & Berkembang
  kimi: {
    id: "kimi",
    name: "Moonshot Kimi",
    category: "alternative",
    baseUrl: "https://api.moonshot.cn/v1",
    defaultModel: "kimi-k3",
    isOpenAICompatible: true,
  },
  minimax: {
    id: "minimax",
    name: "MiniMax",
    category: "alternative",
    baseUrl: "https://api.minimax.chat/v1",
    defaultModel: "MiniMax-M3",
    isOpenAICompatible: true,
  },
  glm: {
    id: "glm",
    name: "Zhipu AI (GLM)",
    category: "alternative",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4", // Sub-path khusus Zhipu GLM
    defaultModel: "GLM-5.2",
    isOpenAICompatible: true,
  },

  // 4. Infrastruktur & Router
  groq: {
    id: "groq",
    name: "Groq (LPU Speed)",
    category: "infrastructure",
    baseUrl: "https://api.groq.com/openai/v1", // Sub-path khusus Groq
    defaultModel: "openai/gpt-oss-120b",
    isOpenAICompatible: true,
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    category: "infrastructure",
    baseUrl: "https://openrouter.ai/api/v1", // Sub-path OpenRouter
    defaultModel: "nvidia/nemotron-3-ultra-550b-a55b:free",
    isOpenAICompatible: true,
  },
  cerebras: {
    id: "cerebras",
    name: "Cerebras",
    category: "infrastructure",
    baseUrl: "https://api.cerebras.ai/v1",
    defaultModel: "gpt-oss-120b",
    isOpenAICompatible: true,
  },
  fireworks: {
    id: "fireworks",
    name: "Fireworks AI",
    category: "infrastructure",
    baseUrl: "https://api.fireworks.ai/inference/v1", // Sub-path Fireworks
    defaultModel: "accounts/fireworks/models/deepseek-v4-flash-0731",
    isOpenAICompatible: true,
  },
  deepinfra: {
    id: "deepinfra",
    name: "DeepInfra",
    category: "infrastructure",
    baseUrl: "https://api.deepinfra.com/v1/openai", // Sub-path DeepInfra
    defaultModel: "deepseek-ai/DeepSeek-V4-Flash-0731",
    isOpenAICompatible: true,
  },
  baseten: {
    id: "baseten",
    name: "Baseten",
    category: "infrastructure",
    baseUrl: "https://bridge.baseten.co/v1",
    defaultModel: "llama-3.3-70b-instruct",
    isOpenAICompatible: true,
  },
  "302ai": {
    id: "302ai",
    name: "302.AI",
    category: "infrastructure",
    baseUrl: "https://api.302.ai/v1",
    defaultModel: "gpt-4o-mini",
    isOpenAICompatible: true,
  },
  custom: {
    id: "custom",
    name: "Custom / Self-Hosted",
    category: "custom",
    baseUrl: "",
    defaultModel: "",
    isOpenAICompatible: true,
  },
};

// ============================================================================
// 2. DAFTAR MODEL PER KATEGORI & PROVIDER
// ============================================================================

export const ZEN_MODELS: ModelInfo[] = [
  // ── Gratis (7 model) ──
  {
    id: "big-pickle",
    name: "Big Pickle",
    description: "Model default OpenCode. Cepat dan gratis.",
    free: true,
  },
  {
    id: "deepseek-v4-flash-free",
    name: "DeepSeek V4 Flash Free",
    description: "Model cepat DeepSeek versi gratis.",
    free: true,
  },
  {
    id: "hy3-free",
    name: "Hy3 Free",
    description: "Model ringan gratis OpenCode.",
    free: true,
  },
  {
    id: "mimo-v2.5-free",
    name: "MiMo-V2.5 Free",
    description: "Model gratis Xiaomi.",
    free: true,
  },
  {
    id: "laguna-s-2.1-free",
    name: "Laguna S 2.1 Free",
    description: "Model coding agentic gratis.",
    free: true,
  },
  {
    id: "nemotron-3-ultra-free",
    name: "Nemotron 3 Ultra Free",
    description: "Model NVIDIA 550B MoE gratis.",
    free: true,
  },
  {
    id: "nemotron-3.5-lightning-free",
    name: "Nemotron 3.5 Lightning Free",
    description: "Model NVIDIA cepat dan ringan gratis.",
    free: true,
  },
  // ── Berbayar ──
  {
    id: "gpt-5.6-sol",
    name: "GPT 5.6 Sol",
    description: "Flagship OpenAI terbaru.",
    free: false,
  },
  {
    id: "gpt-5.4-mini",
    name: "GPT 5.4 Mini",
    description: "Model OpenAI hemat biaya.",
    free: false,
  },
  {
    id: "claude-sonnet-5",
    name: "Claude Sonnet 5",
    description: "Model Anthropic terbaru.",
    free: false,
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    description: "Model Google terbaru dan cepat.",
    free: false,
  },
  {
    id: "kimi-k3",
    name: "Kimi K3",
    description: "Flagship Moonshot 1M konteks.",
    free: false,
  },
  {
    id: "deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    description: "Flagship DeepSeek penalaran.",
    free: false,
  },
  {
    id: "grok-4.6",
    name: "Grok 4.6",
    description: "Model xAI terbaru.",
    free: false,
  },
];

export const GROQ_MODELS: ModelInfo[] = [
  {
    id: "openai/gpt-oss-120b",
    name: "GPT-OSS 120B",
    description: "OpenAI open-weight 120B. Cepat ~500 t/s.",
    free: false,
  },
  {
    id: "openai/gpt-oss-20b",
    name: "GPT-OSS 20B",
    description: "OpenAI open-weight 20B. Ultra-ringan ~1000 t/s.",
    free: false,
  },
  {
    id: "qwen/qwen3.6-27b",
    name: "Qwen 3.6 27B",
    description: "Model Qwen di Groq. Cepat ~500 t/s.",
    free: false,
  },
  {
    id: "groq/compound",
    name: "Groq Compound",
    description: "Agentic system dengan web search + code execution.",
    free: false,
  },
  {
    id: "groq/compound-mini",
    name: "Groq Compound Mini",
    description: "Agentic system ringan.",
    free: false,
  },
];

export const OPENAI_MODELS: ModelInfo[] = [
  {
    id: "gpt-5.6-sol",
    name: "GPT 5.6 Sol",
    description: "Flagship terbaru. Konteks 1M+, 128K output.",
    free: false,
  },
  {
    id: "gpt-5.6-luna",
    name: "GPT 5.6 Luna",
    description: "Hemat biaya untuk volume tinggi.",
    free: false,
  },
  {
    id: "gpt-5.4-mini",
    name: "GPT 4o Mini",
    description: "Hemat biaya dan cepat.",
    free: false,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Flagship multimodal performa tinggi.",
    free: false,
  },
  {
    id: "o3",
    name: "o3",
    description: "Penalaran STEM dan coding tingkat lanjut.",
    free: false,
  },
  {
    id: "o4-mini",
    name: "o4 Mini",
    description: "Penalaran hemat biaya.",
    free: false,
  },
  {
    id: "o3-mini",
    name: "o3 Mini",
    description: "Penalaran cepat dan hemat.",
    free: false,
  },
];

export const ANTHROPIC_MODELS: ModelInfo[] = [
  {
    id: "claude-fable-5",
    name: "Claude Fable 5",
    description: "Model paling capable. Konteks 1M.",
    free: false,
  },
  {
    id: "claude-opus-5",
    name: "Claude Opus 5",
    description: "Agentic coding dan enterprise.",
    free: false,
  },
  {
    id: "claude-sonnet-5",
    name: "Claude Sonnet 5",
    description: "Keseimbangan terbaik speed & intelligence.",
    free: false,
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    description: "Tercepat dengan intelligence dekat frontier.",
    free: false,
  },
];

export const GOOGLE_MODELS: ModelInfo[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Best price/performance. Gratis harian.",
    free: true,
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Penalaran analitis tingkat lanjut.",
    free: true,
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    description: "Flash terbaru. Agentic workflows.",
    free: false,
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    description: "Paling ringan dan efisien.",
    free: true,
  },
];

export const DEEPSEEK_MODELS: ModelInfo[] = [
  {
    id: "deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    description: "Workhorse. Hemat, cepat, reasoning kuat.",
    free: false,
  },
  {
    id: "deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    description: "Flagship. Model besar untuk tugas kompleks.",
    free: false,
  },
];

export const KIMI_MODELS: ModelInfo[] = [
  {
    id: "kimi-k3",
    name: "Kimi K3",
    description: "Flagship. 2.8T params, 1M konteks.",
    free: false,
  },
  {
    id: "kimi-k2.7-code",
    name: "Kimi K2.7 Code",
    description: "Coding-focused. 256K konteks.",
    free: false,
  },
  {
    id: "kimi-k2.6",
    name: "Kimi K2.6",
    description: "General-purpose. Vision + tool calls.",
    free: false,
  },
];

export const MINIMAX_MODELS: ModelInfo[] = [
  {
    id: "MiniMax-M3",
    name: "MiniMax M3",
    description: "Flagship. Trillion-param MoE, 1M konteks.",
    free: false,
  },
  {
    id: "MiniMax-M2.7",
    name: "MiniMax M2.7",
    description: "High-performance reasoning.",
    free: false,
  },
  {
    id: "MiniMax-M2.5",
    name: "MiniMax M2.5",
    description: "Coding & tool call.",
    free: false,
  },
];

export const GLM_MODELS: ModelInfo[] = [
  {
    id: "GLM-5.3",
    name: "GLM 5.3",
    description: "Flagship. Coding SOTA, 1M konteks.",
    free: false,
  },
  {
    id: "GLM-5.2",
    name: "GLM 5.2",
    description: "All-rounder. 1M konteks.",
    free: false,
  },
  {
    id: "GLM-4.7-Flash",
    name: "GLM 4.7 Flash",
    description: "Gratis. 200K konteks.",
    free: true,
  },
];

export const OPENROUTER_MODELS: ModelInfo[] = [
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    name: "Nemotron 3 Ultra Free",
    description: "#1 free model. 550B MoE, 1M konteks.",
    free: true,
  },
  {
    id: "poolside/laguna-s-2.1:free",
    name: "Laguna S 2.1 Free",
    description: "Top free coding model. Agentic.",
    free: true,
  },
  {
    id: "cohere/north-mini-code:free",
    name: "North Mini Code Free",
    description: "Cohere coding model. 256K konteks.",
    free: true,
  },
  {
    id: "nvidia/nemotron-3.5-lightning:free",
    name: "Nemotron 3.5 Lightning Free",
    description: "Fastest free model. 1M konteks.",
    free: true,
  },
  {
    id: "deepseek/deepseek-v4-flash-0731",
    name: "DeepSeek V4 Flash",
    description: "#1 by usage. Frontier reasoning.",
    free: false,
  },
];

export const CEREBRAS_MODELS: ModelInfo[] = [
  {
    id: "gpt-oss-120b",
    name: "GPT-OSS 120B",
    description: "OpenAI open-weight. ~3000 t/s.",
    free: false,
  },
  {
    id: "gemma-4-31b",
    name: "Gemma 4 31B",
    description: "Google open-weight. ~1850 t/s.",
    free: false,
  },
];

export const FIREWORKS_MODELS: ModelInfo[] = [
  {
    id: "accounts/fireworks/models/deepseek-v4-flash-0731",
    name: "DeepSeek V4 Flash",
    description: "Hemat, cepat, reasoning kuat.",
    free: false,
  },
  {
    id: "accounts/fireworks/models/kimi-k3",
    name: "Kimi K3",
    description: "Flagship Moonshot. 1M konteks.",
    free: false,
  },
  {
    id: "accounts/fireworks/models/glm-5p2",
    name: "GLM 5.2",
    description: "Zhipu AI. 1M konteks.",
    free: false,
  },
  {
    id: "accounts/fireworks/models/minimax-m3",
    name: "MiniMax M3",
    description: "Flagship MiniMax. 512K konteks.",
    free: false,
  },
  {
    id: "accounts/fireworks/models/gpt-oss-120b",
    name: "GPT-OSS 120B",
    description: "OpenAI open-weight.",
    free: false,
  },
];

export const DEEPINFRA_MODELS: ModelInfo[] = [
  {
    id: "deepseek-ai/DeepSeek-V4-Flash-0731",
    name: "DeepSeek V4 Flash",
    description: "Hemat $0.08/$0.18 per M token.",
    free: false,
  },
  {
    id: "moonshotai/Kimi-K3",
    name: "Kimi K3",
    description: "Flagship Moonshot. 1M konteks.",
    free: false,
  },
  {
    id: "anthropic/claude-sonnet-5",
    name: "Claude Sonnet 5",
    description: "Anthropic via DeepInfra.",
    free: false,
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Google via DeepInfra.",
    free: false,
  },
];

export const BASETEN_MODELS: ModelInfo[] = [
  {
    id: "deepseek-ai/DeepSeek-V4-Flash-0731",
    name: "DeepSeek V4 Flash",
    description: "Enterprise bridge. $0.13/$0.26.",
    free: false,
  },
  {
    id: "moonshotai/Kimi-K3",
    name: "Kimi K3",
    description: "Flagship Moonshot. $3/$15.",
    free: false,
  },
  {
    id: "zai-org/GLM-5.2",
    name: "GLM 5.2",
    description: "Zhipu AI. $1.40/$4.40.",
    free: false,
  },
];

export const THREE_ZERO_TWO_MODELS: ModelInfo[] = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini (302)",
    description: "Pay-as-you-go tanpa langganan.",
    free: false,
  },
  {
    id: "glm-5.2",
    name: "GLM 5.2 (302)",
    description: "Akses Zhipu AI via 302.AI.",
    free: false,
  },
  {
    id: "MiniMax-M3",
    name: "MiniMax M3 (302)",
    description: "Akses MiniMax via 302.AI.",
    free: false,
  },
  {
    id: "claude-sonnet-5",
    name: "Claude Sonnet 5 (302)",
    description: "Akses Anthropic via 302.AI.",
    free: false,
  },
];

// ============================================================================
// 3. MAPPER & LOOKUPS
// ============================================================================

export const MODELS_BY_PROVIDER: Record<Provider, ModelInfo[]> = {
  zen: ZEN_MODELS,
  groq: GROQ_MODELS,
  openai: OPENAI_MODELS,
  anthropic: ANTHROPIC_MODELS,
  google: GOOGLE_MODELS,
  deepseek: DEEPSEEK_MODELS,
  kimi: KIMI_MODELS,
  minimax: MINIMAX_MODELS,
  glm: GLM_MODELS,
  openrouter: OPENROUTER_MODELS,
  cerebras: CEREBRAS_MODELS,
  fireworks: FIREWORKS_MODELS,
  deepinfra: DEEPINFRA_MODELS,
  baseten: BASETEN_MODELS,
  "302ai": THREE_ZERO_TWO_MODELS,
  custom: [],
};

// Kompatibilitas mundur dengan kode lama
export const MODELS = ZEN_MODELS;
export const MODEL_BY_ID = Object.fromEntries(
  ZEN_MODELS.map((m) => [m.id, m]),
) as Record<string, ModelInfo>;

export const GROQ_MODEL_BY_ID = Object.fromEntries(
  GROQ_MODELS.map((m) => [m.id, m]),
) as Record<string, ModelInfo>;

// Seluruh model gabungan untuk lookup instan
export const ALL_MODELS = Object.values(MODELS_BY_PROVIDER).flat();
export const ALL_MODELS_BY_ID = Object.fromEntries(
  ALL_MODELS.map((m) => [m.id, m]),
) as Record<string, ModelInfo>;

// ============================================================================
// 4. HELPER FUNCTIONS
// ============================================================================

export function modelsForProvider(provider: Provider): ModelInfo[] {
  return MODELS_BY_PROVIDER[provider] ?? ZEN_MODELS;
}

export function effectiveModel(
  settings: Pick<AppSettings, "provider" | "model" | "customModel">,
): string {
  // 1. Jika provider custom atau ada customModel yang diinput manual
  if (
    settings.provider === "custom" ||
    (settings.customModel && settings.customModel.trim())
  ) {
    return settings.customModel.trim();
  }

  // 2. Jika model dipilih dari dropdown
  if (settings.model && settings.model.trim()) {
    return settings.model.trim();
  }

  // 3. Fallback default sesuai konfigurasi provider
  return PROVIDERS_CONFIG[settings.provider]?.defaultModel || DEFAULT_ZEN_MODEL;
}

export function displayModelName(settings: {
  provider: Provider;
  model: string;
  customModel: string;
}): string {
  const effective = effectiveModel(settings);
  return ALL_MODELS_BY_ID[effective]?.name ?? effective;
}

/**
 * Mengambil Base URL valid sesuai provider atau konfigurasi kustom
 */
export function getProviderBaseUrl(
  settings: Pick<AppSettings, "provider" | "baseUrl">,
): string {
  if (settings.provider === "custom") {
    return settings.baseUrl.trim();
  }
  return (
    PROVIDERS_CONFIG[settings.provider]?.baseUrl || PROVIDERS_CONFIG.zen.baseUrl
  );
}

// ============================================================================
// 5. SUGGESTIONS
// ============================================================================

export const SUGGESTIONS = [
  "Apa yang bisa kamu bantu hari ini?",
  "Jelaskan suatu topik dengan bahasa sederhana",
  "Bantu saya membuat jadwal belajar yang efektif",
  "Berikan ide bisnis yang bisa dimulai dengan modal kecil",
  "Buatkan roadmap belajar menjadi Web Developer",
  "Bagaimana cara meningkatkan produktivitas sehari-hari?",
  "Tolong rangkum artikel atau teks yang saya kirim",
  "Apa rekomendasi laptop terbaik untuk mahasiswa?",
  "Buatkan CV yang profesional dan menarik",
  "Tolong perbaiki kode yang mengalami error",
  "Jelaskan perbedaan React, Vue, dan Angular",
  "Berikan ide proyek coding untuk portfolio",
  "Bagaimana cara mempersiapkan interview kerja?",
  "Buatkan rencana keuangan bulanan yang sederhana",
  "Jelaskan konsep AI dan Machine Learning untuk pemula",
  "Bantu saya menulis email yang profesional",
  "Apa skill yang paling dibutuhkan di tahun ini?",
  "Berikan rekomendasi buku yang wajib dibaca",
  "Buatkan konten untuk Instagram atau TikTok",
  "Tolong terjemahkan teks ke bahasa Inggris",
  "Bagaimana cara memulai belajar pemrograman dari nol?",
  "Buatkan checklist untuk mencapai tujuan saya",
  "Apa tren teknologi yang sedang berkembang?",
  "Bantu saya menyelesaikan tugas atau pekerjaan",
];

export function getRandomSuggestions(count = 4): string[] {
  const pool = [...SUGGESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}
