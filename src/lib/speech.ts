type SpeechRecognitionApi = {
  ExpoSpeechRecognitionModule: {
    getMicrophonePermissionsAsync: () => Promise<{ granted: boolean; canAskAgain: boolean }>;
    requestMicrophonePermissionsAsync: () => Promise<{ granted: boolean; canAskAgain: boolean }>;
    isRecognitionAvailable: () => boolean;
    start: (options: Record<string, unknown>) => void;
    stop: () => void;
  };
  useSpeechRecognitionEvent: (
    event: string,
    handler: (event: { results?: { transcript?: string }[]; error?: string }) => void,
  ) => void;
};

let api: SpeechRecognitionApi | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  api = require('expo-speech-recognition') as SpeechRecognitionApi;
} catch {
  api = null;
}

export const ExpoSpeechRecognition = api?.ExpoSpeechRecognitionModule ?? null;

export const useSpeechRecognitionEvent: SpeechRecognitionApi['useSpeechRecognitionEvent'] = (event, handler) => {
  if (api) {
    api.useSpeechRecognitionEvent(event, handler);
  }
};
