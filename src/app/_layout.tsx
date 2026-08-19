import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { StreamingProvider } from '@/context/StreamingContext';
import { AppThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { loadOnboardingDone } from '@/lib/storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SettingsProvider>
          <AppThemeProvider>
            <ChatProvider>
              <StreamingProvider>
                <RootNavigator />
              </StreamingProvider>
            </ChatProvider>
          </AppThemeProvider>
        </SettingsProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { colors, scheme } = useAppTheme();
  const router = useRouter();
  const { ready: settingsReady } = useSettings();
  const { ready: chatReady } = useChat();
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    if (settingsReady && chatReady) {
      loadOnboardingDone().then((done) => {
        if (!done) {
          router.replace('/onboarding');
        }
        setOnboardingChecked(true);
        SplashScreen.hideAsync();
      });
    }
  }, [settingsReady, chatReady, router]);

  // Handle deep link URLs when app is opened from a link
  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const url = event.url;
      const match = url.match(/kawanmodel:\/\/conversation\/(.+)/);
      if (match) {
        const id = match[1];
        if (id && id !== 'new') {
          router.push(`/conversation/${id}`);
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    const sub = Linking.addEventListener('url', handleUrl);
    return () => sub.remove();
  }, [router]);

  if (!onboardingChecked) return null;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="conversation/new" />
        <Stack.Screen name="conversation/[id]" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </View>
  );
}
