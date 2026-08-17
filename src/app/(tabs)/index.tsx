import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Fonts, Radius, Spacing } from "@/constants/theme";
import { useChat } from "@/context/ChatContext";
import { useAppTheme } from "@/context/ThemeContext";
import { markdownToPlainText } from "@/lib/markdown";
import { getRandomSuggestions } from "@/lib/models";
import { timeAgo, type Conversation } from "@/lib/types";

export default function ChatHomeScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const {
    conversations,
    deleteConversation,
    renameConversation,
    clearConversation,
    openConversation,
  } = useChat();

  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [randomSuggestions] = useState(() => getRandomSuggestions(4));

  const handleOpen = (conversation: Conversation) => {
    openConversation(conversation.id);
    router.push(`/conversation/${conversation.id}`);
  };

  const handleDelete = (conversation: Conversation) => {
    Alert.alert(
      "Hapus percakapan?",
      `"${conversation.title || "Tanpa judul"}" akan dihapus permanen.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => deleteConversation(conversation.id),
        },
      ],
    );
  };

  const handleClear = (conversation: Conversation) => {
    Alert.alert(
      "Kosongkan pesan?",
      "Semua pesan di percakapan ini akan dihapus.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Kosongkan",
          style: "destructive",
          onPress: () => clearConversation(conversation.id),
        },
      ],
    );
  };

  const submitRename = () => {
    if (renameTarget) {
      renameConversation(renameTarget.id, renameValue.trim());
    }
    setRenameTarget(null);
  };

  const lastMessage = (conversation: Conversation) =>
    markdownToPlainText(
      conversation.messages[conversation.messages.length - 1]?.content ?? "",
    ) || "Belum ada pesan";

  const startSuggestion = (text: string) => {
    router.push({ pathname: "/conversation/new", params: { q: text } });
  };

  const suggestions = (
    <View style={styles.suggestionGrid}>
      {randomSuggestions.map((suggestion) => (
        <SuggestionCard
          key={suggestion}
          text={suggestion}
          onPress={() => startSuggestion(suggestion)}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.safeTop, { backgroundColor: colors.surface }]}
      >
        <View
          style={[
            styles.header,
            {
              borderBottomColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.logo,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              OrbitChat
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/conversation/new")}
            hitSlop={8}
            style={({ pressed }) => [
              styles.newChatButton,
              { backgroundColor: colors.accent },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="add" size={24} color={colors.onAccent} />
          </Pressable>
        </View>
      </SafeAreaView>

      {conversations.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.welcome}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.greeting, { color: colors.text }]}>
            Ada yang bisa kubantu?
          </Text>
          <Text
            style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}
          >
            Mulai percakapan dengan mengetik pertanyaan, atau pilih salah satu
            contoh di bawah ini.
          </Text>
          {suggestions}
          <Pressable
            onPress={() => router.push("/conversation/new")}
            style={({ pressed }) => [
              styles.welcomeButton,
              { backgroundColor: colors.accent },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="create-outline" size={18} color={colors.onAccent} />
            <Text
              style={[styles.welcomeButtonText, { color: colors.onAccent }]}
            >
              Mulai percakapan
            </Text>
          </Pressable>
        </ScrollView>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={[styles.greeting, { color: colors.text }]}>
                Ada yang bisa kubantu?
              </Text>
              {suggestions}
              <View style={styles.sectionRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Percakapan
                </Text>
                <Text
                  style={[styles.sectionCount, { color: colors.textMuted }]}
                >
                  {conversations.length}
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            return (
              <Pressable
                onPress={() => handleOpen(item)}
                onLongPress={() => handleClear(item)}
                style={({ pressed }) => [
                  styles.card,
                  { borderBottomColor: colors.border },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.cardMain}>
                  <View style={styles.cardTitleRow}>
                    <Text
                      style={[styles.cardTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {item.title || "Percakapan baru"}
                    </Text>
                    <Text
                      style={[styles.cardTime, { color: colors.textMuted }]}
                    >
                      {timeAgo(item.updatedAt)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.cardPreview,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {lastMessage(item)}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <ActionIcon
                    icon="pencil-outline"
                    onPress={() => {
                      setRenameTarget(item);
                      setRenameValue(item.title);
                    }}
                  />
                  <ActionIcon
                    icon="trash-outline"
                    onPress={() => handleDelete(item)}
                    danger
                  />
                </View>
              </Pressable>
            );
          }}
        />
      )}

      <Modal
        visible={!!renameTarget}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setRenameTarget(null)}
      >
        <SafeAreaView style={styles.modalSafe} edges={["top", "bottom"]}>
          <Pressable
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colors.overlay },
            ]}
            onPress={() => setRenameTarget(null)}
          />
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Ubah Judul
            </Text>
            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              autoFocus
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Judul percakapan"
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={submitRename}
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setRenameTarget(null)}
                style={({ pressed }) => [
                  styles.modalButton,
                  { backgroundColor: colors.backgroundElement },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Batal
                </Text>
              </Pressable>
              <Pressable
                onPress={submitRename}
                style={({ pressed }) => [
                  styles.modalButton,
                  { backgroundColor: colors.accent },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[styles.modalButtonText, { color: colors.onAccent }]}
                >
                  Simpan
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function SuggestionCard({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.suggestionCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[styles.suggestionText, { color: colors.textSecondary }]}
        numberOfLines={2}
      >
        {text}
      </Text>
      <View
        style={[styles.suggestionIcon, { backgroundColor: colors.accentSoft }]}
      >
        <Ionicons name="arrow-up" size={14} color={colors.accent} />
      </View>
    </Pressable>
  );
}

function ActionIcon({
  icon,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  danger?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.actionIcon, pressed && styles.pressed]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={danger ? colors.danger : colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeTop: {
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  newChatButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
  },
  welcome: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  greeting: {
    fontFamily: Fonts.serif,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "700",
  },
  welcomeSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 340,
    marginTop: -Spacing.one,
  },
  suggestionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  suggestionCard: {
    flexBasis: "48%",
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
    minHeight: 92,
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  suggestionIcon: {
    width: 26,
    height: 26,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  welcomeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    marginTop: Spacing.two,
  },
  welcomeButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  list: {
    paddingBottom: Spacing.four,
  },
  listHeader: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.one,
    gap: Spacing.two,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionCount: {
    fontSize: 13,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cardMain: {
    flex: 1,
    gap: Spacing.one,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  cardTime: {
    fontSize: 12,
  },
  cardPreview: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: "row",
    gap: Spacing.one,
  },
  actionIcon: {
    padding: Spacing.one,
  },
  modalSafe: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
  },
  modalCard: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.two,
  },
  modalButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
