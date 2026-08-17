import type { AppSettings, ModelInfo, Provider } from "@/lib/types";

export const DEFAULT_ZEN_MODEL = "orbit-chat";
export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
export const DEFAULT_TEMPERATURE = 0.7;

export const DEFAULT_SYSTEM_PROMPT = [
  "Anda adalah AI assistant yang ramah dan membantu.",
  "Jika ditanya model atau identitas Anda, jawab bahwa Anda adalah AI assistant.",
  "Jangan membuat tautan atau sumber yang tidak Anda yakini benar.",
].join(" ");

export const MODELS: ModelInfo[] = [
  {
    id: "big-pickle",
    name: "Big Pickle",
    description: "Model default. Gratis, serba guna, dan cepat.",
    free: true,
  },
  {
    id: "deepseek-v4-flash-free",
    name: "DeepSeek V4 Flash Free",
    description: "Model cepat dari DeepSeek. Gratis untuk waktu terbatas.",
    free: true,
  },
  {
    id: "hy3-free",
    name: "Hy3 Free",
    description: "Model ringan gratis dari OpenCode.",
    free: true,
  },
  {
    id: "mimo-v2.5-free",
    name: "MiMo-V2.5 Free",
    description: "Model gratis dari Xiaomi untuk percakapan umum.",
    free: true,
  },
  {
    id: "laguna-s-2.1-free",
    name: "Laguna S 2.1 Free",
    description: "Model gratis dengan performa yang baik.",
    free: true,
  },
  {
    id: "glm-5.1",
    name: "GLM 5.1",
    description: "Model kuat dari Zhipu AI. Berbayar per token.",
    free: false,
  },
  {
    id: "gpt-5.4-nano",
    name: "GPT 5.4 Nano",
    description: "Model ringan OpenAI, hemat biaya.",
    free: false,
  },
  {
    id: "grok-4.5",
    name: "Grok 4.5",
    description: "Model dari xAI dengan kepribadian khas.",
    free: false,
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    description: "Model ringan Google, cepat dan ekonomis.",
    free: false,
  },
  {
    id: "qwen3.5-plus",
    name: "Qwen3.5 Plus",
    description: "Model dari Alibaba, kuat untuk berbagai tugas.",
    free: false,
  },
];

export const MODEL_BY_ID = Object.fromEntries(
  MODELS.map((m) => [m.id, m]),
) as Record<string, ModelInfo>;

export const GROQ_MODELS: ModelInfo[] = [
  {
    id: "openai/gpt-oss-120b",
    name: "GPT-OSS 120B",
    description:
      "Model open-source OpenAI, kualitas tinggi. Gratis di free tier.",
    free: true,
  },
  {
    id: "openai/gpt-oss-20b",
    name: "GPT-OSS 20B",
    description: "Versi ringan dan sangat cepat dari GPT-OSS.",
    free: true,
  },
  {
    id: "qwen/qwen3.6-27b",
    name: "Qwen3.6 27B",
    description: "Model Alibaba yang seimbang antara kualitas dan kecepatan.",
    free: true,
  },
  {
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    name: "Llama 4 Scout",
    description: "Model MoE Meta yang kuat untuk percakapan umum.",
    free: true,
  },
  {
    id: "groq/compound",
    name: "Groq Compound",
    description: "Model multi-langkah Groq untuk tugas yang lebih kompleks.",
    free: true,
  },
];

export const GROQ_MODEL_BY_ID = Object.fromEntries(
  GROQ_MODELS.map((m) => [m.id, m]),
) as Record<string, ModelInfo>;

export function modelsForProvider(provider: Provider): ModelInfo[] {
  return provider === "groq" ? GROQ_MODELS : MODELS;
}

export function effectiveModel(
  settings: Pick<AppSettings, "provider" | "model" | "customModel">,
): string {
  if (settings.provider === "zen") {
    return settings.model.trim() || DEFAULT_ZEN_MODEL;
  }
  return settings.customModel.trim() || DEFAULT_GROQ_MODEL;
}

export function displayModelName(settings: {
  provider: Provider;
  model: string;
  customModel: string;
}): string {
  const effective = effectiveModel(settings);
  if (settings.provider === "zen") {
    return MODEL_BY_ID[effective]?.name ?? effective;
  }
  return GROQ_MODEL_BY_ID[effective]?.name ?? effective;
}

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
