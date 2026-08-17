import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '@/lib/storage';
import type { AppSettings, Provider } from '@/lib/types';

type SettingsContextValue = {
  settings: AppSettings;
  ready: boolean;
  setProvider: (provider: Provider) => void;
  setApiKey: (apiKey: string) => void;
  setModel: (model: string) => void;
  setCustomModel: (model: string) => void;
  setBaseUrl: (baseUrl: string) => void;
  setTtsEnabled: (enabled: boolean) => void;
  setSpeechLang: (lang: string) => void;
  setSystemPrompt: (prompt: string) => void;
  setTemperature: (temperature: number) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  setSearchApiKey: (key: string) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadSettings().then((stored) => {
      if (!mounted) return;
      setSettings(stored);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (ready) {
      saveSettings(settings);
    }
  }, [settings, ready]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      ready,
      setProvider: (provider) => setSettings((s) => ({ ...s, provider })),
      setApiKey: (apiKey) => setSettings((s) => ({ ...s, apiKey })),
      setModel: (model) => setSettings((s) => ({ ...s, model })),
      setCustomModel: (customModel) => setSettings((s) => ({ ...s, customModel })),
      setBaseUrl: (baseUrl) => setSettings((s) => ({ ...s, baseUrl })),
      setTtsEnabled: (ttsEnabled) => setSettings((s) => ({ ...s, ttsEnabled })),
      setSpeechLang: (speechLang) => setSettings((s) => ({ ...s, speechLang })),
      setSystemPrompt: (systemPrompt) => setSettings((s) => ({ ...s, systemPrompt })),
      setTemperature: (temperature) => setSettings((s) => ({ ...s, temperature })),
      setWebSearchEnabled: (webSearchEnabled) => setSettings((s) => ({ ...s, webSearchEnabled })),
      setSearchApiKey: (searchApiKey) => setSettings((s) => ({ ...s, searchApiKey })),
    }),
    [settings, ready],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings harus dipakai di dalam SettingsProvider');
  return ctx;
}
