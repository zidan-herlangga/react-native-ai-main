import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_GROQ_MODEL,
  DEFAULT_TEMPERATURE,
  DEFAULT_ZEN_MODEL,
} from "@/lib/models";
import type {
  AppSettings,
  AppStats,
  Conversation,
  CrashLog,
} from "@/lib/types";

const KEYS = {
  conversations: "@kawanmodel/conversations",
  settings: "@kawanmodel/settings",
  onboardingDone: "@kawanmodel/onboarding_done",
  crashLogs: "@kawanmodel/crash_logs",
};

export const DEFAULT_SETTINGS: AppSettings = {
  provider: "zen",
  apiKey: "sk-lZNbmzjUem12ObIWxUXwitkimJgcuBcBOVsP6DF9ztPjD4MJmhrLRILZyLPJLP2P",
  model: DEFAULT_ZEN_MODEL,
  customModel: DEFAULT_GROQ_MODEL,
  baseUrl: "",
  ttsEnabled: false,
  speechLang: "id-ID",
  systemPrompt: "",
  temperature: DEFAULT_TEMPERATURE,
  webSearchEnabled: false,
  searchApiKey: "",
  toolsEnabled: false,
  notificationSound: true,
  themeMode: "system",
};

export async function loadConversations(): Promise<Conversation[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.conversations);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

export async function saveConversations(items: Conversation[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.conversations, JSON.stringify(items));
  } catch {
    // abaikan
  }
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.settings);
    if (!raw) return DEFAULT_SETTINGS;
    return {
      ...DEFAULT_SETTINGS,
      ...(JSON.parse(raw) as Partial<AppSettings>),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
  } catch {
    // abaikan
  }
}

/* ── Onboarding ── */

export async function loadOnboardingDone(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.onboardingDone);
    return raw === "true";
  } catch {
    return false;
  }
}

export async function saveOnboardingDone(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.onboardingDone, "true");
  } catch {
    // abaikan
  }
}

/* ── Stats ── */

export function computeStats(conversations: Conversation[]): AppStats {
  let totalMessages = 0;
  let estimatedTokens = 0;
  let firstChatAt: number | null = null;
  let lastChatAt: number | null = null;
  const modelCounts: Record<string, number> = {};

  for (const conv of conversations) {
    totalMessages += conv.messages.length;
    for (const msg of conv.messages) {
      estimatedTokens += Math.ceil(msg.content.length / 4);
    }

    if (conv.model) {
      modelCounts[conv.model] = (modelCounts[conv.model] || 0) + 1;
    }

    if (!firstChatAt || conv.createdAt < firstChatAt) {
      firstChatAt = conv.createdAt;
    }
    if (!lastChatAt || conv.updatedAt > lastChatAt) {
      lastChatAt = conv.updatedAt;
    }
  }

  let favoriteModel = "";
  let maxCount = 0;
  for (const [model, count] of Object.entries(modelCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteModel = model;
    }
  }

  return {
    totalConversations: conversations.length,
    totalMessages,
    estimatedTokens,
    firstChatAt,
    lastChatAt,
    favoriteModel,
  };
}

/* ── Crash Logs ── */

export async function loadCrashLogs(): Promise<CrashLog[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.crashLogs);
    return raw ? (JSON.parse(raw) as CrashLog[]) : [];
  } catch {
    return [];
  }
}

export async function saveCrashLog(log: CrashLog): Promise<void> {
  try {
    const existing = await loadCrashLogs();
    const updated = [log, ...existing].slice(0, 50); // keep last 50
    await AsyncStorage.setItem(KEYS.crashLogs, JSON.stringify(updated));
  } catch {
    // abaikan
  }
}

export async function clearCrashLogs(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.crashLogs);
  } catch {
    // abaikan
  }
}
