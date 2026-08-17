import { markdownToPlainText } from "@/lib/markdown";
import type { Message } from "@/lib/types";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useState } from "react";

export type TTSState = {
  speakingId: string | null;
  speak: (message: Message, lang: string) => void;
  stop: () => void;
};

export function useTTS(enabled: boolean): TTSState {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (message: Message, lang: string) => {
      if (!enabled) return;

      if (speakingId === message.id) {
        stop();
        return;
      }

      stop();
      setSpeakingId(message.id);

      const text = markdownToPlainText(message.content);
      const truncated = text.length > 4000 ? text.slice(0, 4000) : text;
      Speech.speak(truncated, {
        language: lang,
        rate: 1,
        onDone: () => setSpeakingId(null),
        onStopped: () => setSpeakingId(null),
        onError: () => setSpeakingId(null),
      });
    },
    [enabled, speakingId, stop],
  );

  return { speakingId, speak, stop };
}
