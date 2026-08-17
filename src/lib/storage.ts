import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_GROQ_MODEL,
  DEFAULT_TEMPERATURE,
  DEFAULT_ZEN_MODEL,
} from "@/lib/models";
import type { AppSettings, Conversation } from "@/lib/types";

const KEYS = {
  conversations: "@orbitchat/conversations",
  settings: "@orbitchat/settings",
};

export const DEFAULT_SETTINGS: AppSettings = {
  provider: "zen",
  apiKey: "",
  model: DEFAULT_ZEN_MODEL,
  customModel: DEFAULT_GROQ_MODEL,
  baseUrl: "",
  ttsEnabled: false,
  speechLang: "id-ID",
  systemPrompt: "",
  temperature: DEFAULT_TEMPERATURE,
  webSearchEnabled: false,
  searchApiKey: "",
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
