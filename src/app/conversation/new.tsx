import { useLocalSearchParams } from "expo-router";

import { ChatScreen } from '@/components/ChatScreen';

export default function NewConversationScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  return <ChatScreen showBack initialMessage={q} />;
}
