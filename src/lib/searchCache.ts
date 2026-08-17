import AsyncStorage from "@react-native-async-storage/async-storage";

import type { WebSearchSource } from "@/lib/types";

const CACHE_KEY = "@orbitchat/search-cache";
const CACHE_TTL_MS = 3 * 60 * 60 * 1000;
const MAX_ENTRIES = 50;

export type CachedSearch = {
  content: string;
  sources: WebSearchSource[];
};

type CacheEntry = { ts: number; data: CachedSearch };

let memoryCache: Record<string, CacheEntry> | null = null;
let loadPromise: Promise<void> | null = null;

async function ensureLoaded(): Promise<void> {
  if (memoryCache) return;
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        memoryCache = raw ? (JSON.parse(raw) as Record<string, CacheEntry>) : {};
      } catch {
        memoryCache = {};
      }
    })();
  }
  await loadPromise;
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function getCachedSearch(
  query: string,
): Promise<CachedSearch | null> {
  await ensureLoaded();
  const entry = memoryCache?.[normalizeQuery(query)];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
  return entry.data;
}

export async function setCachedSearch(
  query: string,
  data: CachedSearch,
): Promise<void> {
  await ensureLoaded();
  if (!memoryCache) return;
  memoryCache[normalizeQuery(query)] = { ts: Date.now(), data };

  const entries = Object.entries(memoryCache);
  if (entries.length > MAX_ENTRIES) {
    entries.sort((a, b) => a[1].ts - b[1].ts);
    memoryCache = Object.fromEntries(entries.slice(-MAX_ENTRIES));
  }

  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
  } catch {
    // abaikan — cache hanya penyelaras, bukan sumber kebenaran
  }
}
