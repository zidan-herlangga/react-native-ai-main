import { ExpoSpeechRecognition, useSpeechRecognitionEvent } from "@/lib/speech";
import { useCallback, useEffect, useState } from "react";

export type SpeechState = {
  listening: boolean;
  error: string | null;
  clearError: () => void;
  startListening: (lang: string) => Promise<void>;
  stopListening: () => void;
  isAvailable: boolean;
};

export function useSpeech(onTranscript: (text: string) => void): SpeechState {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript ?? "";
    if (transcript) onTranscript(transcript);
  });

  useSpeechRecognitionEvent("end", () => setListening(false));

  useSpeechRecognitionEvent("error", (event) => {
    setListening(false);
    if (event.error !== "aborted") {
      setError("Pengenalan suara gagal. Coba lagi.");
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (listening) {
        try {
          ExpoSpeechRecognition?.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [listening]);

  const isAvailable = ExpoSpeechRecognition?.isRecognitionAvailable() ?? false;

  const clearError = useCallback(() => setError(null), []);

  const startListening = useCallback(
    async (lang: string) => {
      if (!ExpoSpeechRecognition) {
        setError(
          "Fitur voice input hanya tersedia di APK/development build, tidak di Expo Go.",
        );
        return;
      }

      try {
        let permission =
          await ExpoSpeechRecognition.getMicrophonePermissionsAsync();
        if (!permission.granted && permission.canAskAgain) {
          permission =
            await ExpoSpeechRecognition.requestMicrophonePermissionsAsync();
        }
        if (!permission.granted) {
          setError("Izin mikrofon ditolak. Aktifkan di pengaturan perangkat.");
          return;
        }
        if (!isAvailable) {
          setError("Pengenalan suara tidak tersedia di perangkat ini.");
          return;
        }

        setError(null);
        ExpoSpeechRecognition.start({
          lang,
          interimResults: true,
          continuous: false,
          maxAlternatives: 1,
        });
        setListening(true);
      } catch {
        setError("Gagal memulai pengenalan suara.");
      }
    },
    [isAvailable],
  );

  const stopListening = useCallback(() => {
    if (ExpoSpeechRecognition) {
      ExpoSpeechRecognition.stop();
    }
    setListening(false);
  }, []);

  return {
    listening,
    error,
    clearError,
    startListening,
    stopListening,
    isAvailable,
  };
}
