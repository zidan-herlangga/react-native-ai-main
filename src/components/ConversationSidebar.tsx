import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Radius, Spacing } from "@/constants/theme";
import { useChat } from "@/context/ChatContext";
import { useAppTheme } from "@/context/ThemeContext";
import { markdownToPlainText } from "@/lib/markdown";
import { timeAgo, type Conversation } from "@/lib/types";

async function exportConversation(conversation: Conversation) {
  const header = `# ${conversation.title || "Percakapan"}\n\n`;
  const body = conversation.messages
    .map((m) => {
      const role = m.role === "user" ? "**Kamu**" : "**AI**";
      return `${role}\n${m.content}`;
    })
    .join("\n\n---\n\n");

  const content = header + body;

  if (Platform.OS === "web") {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${conversation.title || "percakapan"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const { File, Paths } = await import("expo-file-system");
  const Sharing = await import("expo-sharing");
  const file = new File(
    Paths.cache,
    `${conversation.title || "percakapan"}.md`,
  );
  await file.write(content);
  await Sharing.shareAsync(file.uri);
}

async function shareConversationLink(conversation: Conversation) {
  const url = `kawanmodel://conversation/${conversation.id}`;
  const text = `💬 ${conversation.title || "Percakapan Kawan Model"}\n${url}`;
  if (Platform.OS === "web") {
    navigator.share?.({ title: text, url });
    return;
  }
  try {
    await Linking.openURL(url);
  } catch {
    const Clipboard = await import("expo-clipboard");
    await Clipboard.setStringAsync(url);
    const { Alert } = await import("react-native");
    Alert.alert(
      "Tautan disalin",
      "Tautan percakapan sudah disalin ke clipboard.",
    );
  }
}

type ConversationSidebarProps = {
  visible: boolean;
  activeId?: string;
  onClose: () => void;
  onSearch?: () => void;
};

export function ConversationSidebar({
  visible,
  activeId,
  onClose,
  onSearch,
}: ConversationSidebarProps) {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { conversations, deleteConversation, openConversation } = useChat();

  const translateX = useSharedValue(-360);

  useEffect(() => {
    if (visible) {
      translateX.value = -360;
      translateX.value = withTiming(0, { duration: 260 });
    }
  }, [visible, translateX]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleOpen = (id: string) => {
    onClose();
    if (id === activeId) return;
    openConversation(id);
    router.replace(`/conversation/${id}`);
  };

  const startNewChat = () => {
    onClose();
    router.replace("/conversation/new");
  };

  const handleDelete = (item: Conversation) => {
    Alert.alert(
      "Hapus percakapan?",
      `"${item.title || "Tanpa judul"}" akan dihapus permanen.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            deleteConversation(item.id);
            if (item.id === activeId) router.replace("/");
          },
        },
      ],
    );
  };

  const preview = (item: Conversation) =>
    markdownToPlainText(
      item.messages[item.messages.length - 1]?.content ?? "",
    ) || "Belum ada pesan";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          onPress={onClose}
          testID="sidebar-backdrop"
        />
        <Animated.View
          style={[
            styles.panel,
            { backgroundColor: colors.surface },
            panelStyle,
          ]}
        >
          <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
            <View style={styles.headerRow}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Riwayat
              </Text>
              {onSearch && (
                <Pressable
                  onPress={() => {
                    onClose();
                    onSearch();
                  }}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.iconButton,
                    { backgroundColor: colors.backgroundElement },
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="search"
                    size={16}
                    color={colors.textSecondary}
                  />
                </Pressable>
              )}
              <Pressable
                onPress={onClose}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.closeButton,
                  { backgroundColor: colors.backgroundElement },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Pressable
              onPress={startNewChat}
              style={({ pressed }) => [
                styles.newChatButton,
                { backgroundColor: colors.accent },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="create-outline"
                size={17}
                color={colors.onAccent}
              />
              <Text style={[styles.newChatText, { color: colors.onAccent }]}>
                Percakapan baru
              </Text>
            </Pressable>

            {conversations.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={34}
                  color={colors.textMuted}
                />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Belum ada riwayat
                </Text>
              </View>
            ) : (
              <FlatList
                data={conversations}
                keyExtractor={(c) => c.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isActive = item.id === activeId;
                  return (
                    <Pressable
                      onPress={() => handleOpen(item.id)}
                      style={({ pressed }) => [
                        styles.item,
                        {
                          backgroundColor: isActive
                            ? colors.accentSoft
                            : colors.backgroundElement,
                          borderColor: isActive
                            ? colors.accentBorder
                            : colors.border,
                        },
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.itemMain}>
                        <Text
                          style={[styles.itemTitle, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {item.title || "Percakapan baru"}
                        </Text>
                        <Text
                          style={[
                            styles.itemPreview,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {preview(item)}
                        </Text>
                      </View>
                      <View style={styles.itemRight}>
                        <Text
                          style={[styles.itemTime, { color: colors.textMuted }]}
                        >
                          {timeAgo(item.updatedAt)}
                        </Text>
                        <View style={styles.itemActions}>
                          <Pressable
                            onPress={() => shareConversationLink(item)}
                            hitSlop={8}
                            style={({ pressed }) => [
                              styles.deleteButton,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Ionicons
                              name="share-outline"
                              size={16}
                              color={colors.textMuted}
                            />
                          </Pressable>
                          <Pressable
                            onPress={() => exportConversation(item)}
                            hitSlop={8}
                            style={({ pressed }) => [
                              styles.deleteButton,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Ionicons
                              name="download-outline"
                              size={16}
                              color={colors.textMuted}
                            />
                          </Pressable>
                          <Pressable
                            onPress={() => handleDelete(item)}
                            hitSlop={8}
                            style={({ pressed }) => [
                              styles.deleteButton,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={16}
                              color={colors.textMuted}
                            />
                          </Pressable>
                        </View>
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  panel: {
    width: "84%",
    maxWidth: 340,
    height: "100%",
    borderTopRightRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    overflow: "hidden",
  },
  safe: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
  },
  newChatText: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  emptyText: {
    fontSize: 14,
  },
  list: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.two,
  },
  itemMain: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemPreview: {
    fontSize: 12,
  },
  itemRight: {
    alignItems: "flex-end",
    gap: Spacing.one,
  },
  itemActions: {
    flexDirection: "row",
    gap: Spacing.one,
  },
  itemTime: {
    fontSize: 10,
  },
  deleteButton: {
    padding: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
});
