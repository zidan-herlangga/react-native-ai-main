import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { OfflineBanner } from '@/components/OfflineBanner';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { StreamingProvider } from '@/context/StreamingContext';
import { AppThemeProvider, useAppTheme } from '@/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <AppThemeProvider>
          <ChatProvider>
            <StreamingProvider>
              <RootNavigator />
            </StreamingProvider>
          </ChatProvider>
        </AppThemeProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { colors, scheme } = useAppTheme();
  const router = useRouter();
  const { ready: settingsReady } = useSettings();
  const { ready: chatReady } = useChat();

  useEffect(() => {
    if (settingsReady && chatReady) {
      SplashScreen.hideAsync();
    }
  }, [settingsReady, chatReady]);

  // Handle deep link URLs when app is opened from a link
  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const url = event.url;
      const match = url.match(/orbitchat:\/\/conversation\/(.+)/);
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

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="conversation/new" />
        <Stack.Screen name="conversation/[id]" />
      </Stack>
    </View>
  );
}
