const PROVIDERS_CONFIG = {
  zen: {
    id: "zen",
    name: "OpenCode Zen",
    category: "zen",
    baseUrl: "https://opencode.ai/zen/v1",
    defaultModel: "big-pickle",
    isOpenAICompatible: true,
  },
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
    baseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-sonnet-5",
    isOpenAICompatible: false,
  },
  google: {
    id: "google",
    name: "Google (Gemini)",
    category: "commercial",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
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
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    defaultModel: "GLM-5.2",
    isOpenAICompatible: true,
  },
  groq: {
    id: "groq",
    name: "Groq (LPU Speed)",
    category: "infrastructure",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "openai/gpt-oss-120b",
    isOpenAICompatible: true,
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    category: "infrastructure",
    baseUrl: "https://openrouter.ai/api/v1",
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
    baseUrl: "https://api.fireworks.ai/inference/v1",
    defaultModel: "accounts/fireworks/models/deepseek-v4-flash-0731",
    isOpenAICompatible: true,
  },
  deepinfra: {
    id: "deepinfra",
    name: "DeepInfra",
    category: "infrastructure",
    baseUrl: "https://api.deepinfra.com/v1/openai",
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
    baseUrl: "http://localhost:11434/v1",
    defaultModel: "custom-model",
    isOpenAICompatible: true,
  },
};

const ZEN_MODELS = [
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
  {
    id: "gpt-5.6-sol",
    name: "GPT 5.6 Sol",
    description: "Flagship OpenAI terbaru.",
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
];

const GROQ_MODELS = [
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
];

const OPENAI_MODELS = [
  {
    id: "gpt-5.6-sol",
    name: "GPT 5.6 Sol",
    description: "Flagship terbaru. Konteks 1M+, 128K output.",
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
];

const ANTHROPIC_MODELS = [
  {
    id: "claude-fable-5",
    name: "Claude Fable 5",
    description: "Model paling capable. Konteks 1M.",
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

const GOOGLE_MODELS = [
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
];

const MODELS_BY_PROVIDER = {
  zen: ZEN_MODELS,
  groq: GROQ_MODELS,
  openai: OPENAI_MODELS,
  anthropic: ANTHROPIC_MODELS,
  google: GOOGLE_MODELS,
  deepseek: [
    {
      id: "deepseek-v4-flash",
      name: "DeepSeek V4 Flash",
      description: "Workhorse hemat dan cepat.",
      free: false,
    },
    {
      id: "deepseek-v4-pro",
      name: "DeepSeek V4 Pro",
      description: "Flagship penalaran mendalam.",
      free: false,
    },
  ],
  kimi: [
    {
      id: "kimi-k3",
      name: "Kimi K3",
      description: "Flagship 2.8T params 1M konteks.",
      free: false,
    },
  ],
  minimax: [
    {
      id: "MiniMax-M3",
      name: "MiniMax M3",
      description: "Trillion-param MoE 1M konteks.",
      free: false,
    },
  ],
  glm: [
    {
      id: "GLM-5.3",
      name: "GLM 5.3",
      description: "Flagship Coding SOTA.",
      free: false,
    },
    {
      id: "GLM-4.7-Flash",
      name: "GLM 4.7 Flash",
      description: "Gratis 200K konteks.",
      free: true,
    },
  ],
  openrouter: [
    {
      id: "nvidia/nemotron-3-ultra-550b-a55b:free",
      name: "Nemotron 3 Ultra Free",
      description: "550B MoE 1M konteks.",
      free: true,
    },
  ],
  cerebras: [
    {
      id: "gpt-oss-120b",
      name: "GPT-OSS 120B",
      description: "Inference ~3000 tok/s.",
      free: false,
    },
  ],
  fireworks: [
    {
      id: "accounts/fireworks/models/deepseek-v4-flash-0731",
      name: "DeepSeek V4 Flash",
      description: "Fireworks LPU.",
      free: false,
    },
  ],
  deepinfra: [
    {
      id: "deepseek-ai/DeepSeek-V4-Flash-0731",
      name: "DeepSeek V4 Flash",
      description: "DeepInfra host.",
      free: false,
    },
  ],
  baseten: [
    {
      id: "deepseek-ai/DeepSeek-V4-Flash-0731",
      name: "DeepSeek V4 Flash",
      description: "Baseten bridge.",
      free: false,
    },
  ],
  "302ai": [
    {
      id: "gpt-4o-mini",
      name: "GPT-4o Mini",
      description: "Pay-as-you-go.",
      free: false,
    },
  ],
  custom: [
    {
      id: "custom-local",
      name: "Localhost LLM",
      description: "Endpoint Ollama / LM Studio.",
      free: true,
    },
  ],
};

const SUGGESTIONS = [
  "Apa yang bisa kamu bantu hari ini?",
  "Jelaskan perbedaan arsitektur dense vs MoE",
  "Hitung variansi dari data [12, 15, 18, 20, 25]",
  "Buatkan kode Python untuk web scraping",
  "Rangkum artikel dari link URL berikut",
  "Konversi 100 mil ke kilometer",
];

const LOGO_MAP = {
  openai: "assets/openai.svg",
  anthropic: "assets/anthropic.svg",
  deepseek: "assets/deepseek.svg",
  groq: "assets/groq.svg",
  openrouter: "assets/openrouter.svg",
  glm: "assets/zhipu.svg",
  kimi: "assets/moonshot.svg",
  minimax: "assets/minimaxsvg.svg",
  cerebras: "assets/cerebras.svg",
  fireworks: "assets/fireworks.svg",
  deepinfra: "assets/deepinfra.svg",
  baseten: "assets/baseten.svg",
  "302ai": "assets/ai302.svg",
  zen: "assets/opencode.svg",
  google: "assets/gemini.svg",
  custom: "assets/opencode.svg",
};
const INVERT_LOGOS = new Set(["openai", "groq"]);

// Render Catalog
function renderProvidersCatalog(filterCat = "all") {
  const grid = document.getElementById("providers-catalog-grid");
  grid.innerHTML = "";

  Object.entries(PROVIDERS_CONFIG).forEach(([key, prov]) => {
    if (filterCat !== "all" && prov.category !== filterCat) return;

    const models = MODELS_BY_PROVIDER[key] || [];
    const logoSrc = LOGO_MAP[key] || "./assets/opencode.svg";
    const invertClass = INVERT_LOGOS.has(key) ? " invert-logo" : "";
    const card = document.createElement("div");
    card.className =
      "provider-card p-5 rounded-2xl bg-app-surface border border-app-surface-border space-y-4 hover:border-app-accent hover:shadow-card-hover transition-all flex flex-col justify-between";

    let listHtml = models
      .slice(0, 3)
      .map(
        (m) => `
            <div class="flex items-center justify-between text-xs py-1 border-b border-app-border">
              <span class="font-mono ${m.free ? "text-green-600 dark:text-green-400 font-bold" : "text-app-text"}">${m.name}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded font-mono ${m.free ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 font-bold" : "bg-app-bg-el text-app-text-muted"}">${m.free ? "GRATIS" : "BYOK"}</span>
            </div>
          `,
      )
      .join("");

    card.innerHTML = `
            <div class="space-y-2.5">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-app-border shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img src="${logoSrc}" alt="${prov.name}" class="prov-card-icon${invertClass}" loading="lazy" />
                  </div>
                  <div>
                    <span class="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-app-navy-soft text-app-navy dark:text-app-accent-bright">${prov.category}</span>
                    <h3 class="text-base font-bold text-app-text mt-1">${prov.name}</h3>
                  </div>
                </div>
                <span class="text-[9px] font-mono bg-app-bg-el px-2 py-1 rounded text-app-text-sec border border-app-border">${prov.isOpenAICompatible ? "OpenAI-Comp" : "Native API"}</span>
              </div>
              <div class="text-[11px] text-app-text-muted font-mono bg-app-bg-el p-2 rounded truncate select-all">
                ${prov.baseUrl || "http://localhost:11434"}
              </div>
              <div class="space-y-1">
                <div class="text-[10px] font-bold text-app-text-sec">Model (${models.length}):</div>
                ${listHtml}
              </div>
            </div>
            <div class="pt-3 border-t border-app-border flex items-center justify-between text-xs">
              <span class="text-app-text-muted text-[11px]">Default: <strong>${prov.defaultModel}</strong></span>
              <button onclick="selectProviderInMockup('${key}')" class="text-app-accent font-bold hover:underline">Pilih di Mockup →</button>
            </div>
          `;
    grid.appendChild(card);
  });
  lucide.createIcons();
}

function filterProviders(cat) {
  document.querySelectorAll(".prov-filter-btn").forEach((btn) => {
    if (btn.dataset.cat === cat) {
      btn.className =
        "prov-filter-btn px-4 py-1.5 rounded-lg text-xs font-bold bg-app-navy text-white transition-colors";
    } else {
      btn.className =
        "prov-filter-btn px-4 py-1.5 rounded-lg text-xs font-bold bg-app-bg-el text-app-text hover:border-app-accent border border-app-border transition-colors";
    }
  });
  renderProvidersCatalog(cat);
}

// Mockup Controller
function onMockupProviderChange(provKey) {
  const select = document.getElementById("mockup-model-select");
  const models = MODELS_BY_PROVIDER[provKey] || [];
  select.innerHTML = "";
  models.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.name + (m.free ? " (Free)" : "");
    select.appendChild(opt);
  });

  const prov = PROVIDERS_CONFIG[provKey];
  if (prov && prov.defaultModel) select.value = prov.defaultModel;

  document.getElementById("mockup-header-title").textContent = prov.name;
  document.getElementById("mockup-provider-badge").textContent =
    prov.category.toUpperCase();

  const listContainer = document.getElementById("mockup-models-list");
  listContainer.innerHTML = "";
  models.forEach((m) => {
    const item = document.createElement("div");
    item.className =
      "p-1.5 rounded bg-app-surface border border-app-border flex justify-between items-center text-[9px]";
    item.innerHTML = `<div><div class="font-bold">${m.name}</div><div class="text-[8px] text-app-text-muted font-mono">${m.id}</div></div><span class="font-bold text-[8px] px-1 py-0.5 rounded ${m.free ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-app-bg-el text-app-text-muted"}">${m.free ? "GRATIS" : "BYOK"}</span>`;
    listContainer.appendChild(item);
  });
}

function onMockupModelChange(modelId) {
  document.getElementById("mockup-res-tag").textContent = modelId + " Output";
}

function selectProviderInMockup(provKey) {
  document.getElementById("mockup-provider-select").value = provKey;
  onMockupProviderChange(provKey);
  document.getElementById("mockup").scrollIntoView({ behavior: "smooth" });
}

function switchMockupTab(tab) {
  ["screen-chat", "screen-models", "screen-tentang", "screen-kontak"].forEach(
    (id) => {
      document.getElementById(id).classList.add("hidden");
    },
  );
  [
    "tab-btn-chat",
    "tab-btn-models",
    "tab-btn-tentang",
    "tab-btn-kontak",
  ].forEach((id) => {
    document.getElementById(id).className =
      "flex-1 py-1 text-center rounded hover:text-app-text";
  });

  document.getElementById("screen-" + tab).classList.remove("hidden");
  document.getElementById("tab-btn-" + tab).className =
    "flex-1 py-1 text-center rounded bg-app-surface text-app-text shadow-sm font-bold";
}

function handleMockupSend() {
  const input = document.getElementById("mockup-input-field");
  if (!input.value.trim()) return;
  alert("Prompt dikirim ke model: " + input.value);
}

function initMockupChips() {
  const container = document.getElementById("mockup-chips-container");
  container.innerHTML = "";
  SUGGESTIONS.slice(0, 3).forEach((text) => {
    const btn = document.createElement("button");
    btn.className =
      "px-2 py-0.5 rounded bg-app-bg-el border border-app-border text-[8.5px] whitespace-nowrap hover:border-app-accent";
    btn.textContent = text;
    btn.onclick = () => {
      document.getElementById("mockup-input-field").value = text;
    };
    container.appendChild(btn);
  });
}

// Helper untuk memicu file download di browser
function executeDownload(filePath, fileName) {
  const link = document.createElement("a");
  link.href = filePath;
  link.download = fileName || filePath.split("/").pop();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download Modal Logic
function triggerApkDownload(filePath, fileName) {
  const link = document.createElement("a");
  link.href = filePath;
  // Menentukan nama file saat tersimpan di perangkat
  link.download = fileName || filePath.split("/").pop();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download Modal Logic
// Fungsi untuk memicu unduhan APK
function downloadApk() {
  const apkPath = "downloads/KawanModel_v1.0.0.apk";
  const link = document.createElement("a");
  link.href = apkPath;
  link.download = "KawanModel_v1.0.0.apk";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Fungsi untuk memicu unduhan APK
function downloadApk() {
  const apkPath = "downloads/KawanModel_v1.0.0.apk";
  const link = document.createElement("a");
  link.href = apkPath;
  link.download = "KawanModel_v1.0.0.apk";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download Modal Logic
function triggerDownload() {
  const modal = document.getElementById("download-modal");
  const bar = document.getElementById("dl-bar");
  const pct = document.getElementById("dl-pct");
  const bytes = document.getElementById("dl-bytes");
  const status = document.getElementById("dl-status-text");
  const btn = document.getElementById("dl-done-btn");

  const totalSize = 109; // Ukuran disesuaikan ke 109 MB

  modal.classList.remove("hidden");
  btn.classList.add("hidden");
  bar.style.width = "0%";
  pct.textContent = "0%";
  bytes.textContent = `0 MB / ${totalSize} MB`;
  status.textContent = "Mengunduh APK...";

  let p = 0;
  const timer = setInterval(() => {
    p += Math.floor(Math.random() * 20) + 10;
    if (p > 100) p = 100;

    bar.style.width = p + "%";
    pct.textContent = p + "%";
    bytes.textContent = `${((p / 100) * totalSize).toFixed(1)} MB / ${totalSize} MB`;

    if (p >= 100) {
      clearInterval(timer);
      status.textContent = "Unduhan Selesai!";

      // Fallback tombol jika browser memblokir auto-download
      btn.classList.remove("hidden");
      btn.onclick = downloadApk;

      // Pemicu unduhan otomatis
      downloadApk();
    }
  }, 180);
}
function closeDownloadModal() {
  document.getElementById("download-modal").classList.add("hidden");
}
function openQrModal() {
  document.getElementById("qr-modal").classList.remove("hidden");
}
function closeQrModal() {
  document.getElementById("qr-modal").classList.add("hidden");
}
function openBugModal() {
  document.getElementById("bug-modal").classList.remove("hidden");
}
function closeBugModal() {
  document.getElementById("bug-modal").classList.add("hidden");
}

function toggleFaq(btn) {
  const ans = btn.nextElementSibling;
  const icon = btn.querySelector("i");
  const isHidden = ans.classList.contains("hidden");
  document
    .querySelectorAll(".faq-ans")
    .forEach((a) => a.classList.add("hidden"));
  document
    .querySelectorAll(".faq-btn i")
    .forEach((i) => i.classList.remove("rotate-180"));
  if (isHidden) {
    ans.classList.remove("hidden");
    icon.classList.add("rotate-180");
  }
}

// Theme toggle
const themeBtn = document.getElementById("theme-toggle");
themeBtn.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  lucide.createIcons();
});

// Mobile Menu
document.getElementById("mobile-menu-btn").addEventListener("click", () => {
  document.getElementById("mobile-menu").classList.toggle("hidden");
});

// Startup
window.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  renderProvidersCatalog("all");
  onMockupProviderChange("zen");
  initMockupChips();

  // Scroll fade-in animation
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.08 },
  );
  document
    .querySelectorAll(".fade-in-up")
    .forEach((el) => observer.observe(el));
  document
    .querySelectorAll(".provider-card")
    .forEach((el) => observer.observe(el));

  // Stagger provider card animations
  document.querySelectorAll(".provider-card").forEach((card, i) => {
    card.style.transitionDelay = i * 60 + "ms";
    card.classList.add("fade-in-up");
  });
});
