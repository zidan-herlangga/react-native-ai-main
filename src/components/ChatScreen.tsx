// components/ChatScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardEvent,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type StyleProps,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatInput } from "@/components/ChatInput";
import { MessageBubble } from "@/components/MessageBubble";
import { ModelPicker } from "@/components/ModelPicker";
import { Radius, Spacing } from "@/constants/theme";
import { useChat } from "@/context/ChatContext";
import { useSettings } from "@/context/SettingsContext";
import { useAppTheme } from "@/context/ThemeContext";
import { modelsForProvider } from "@/lib/models";
import type { Message } from "@/lib/types";

import { AttachmentMenu } from "@/components/AttachmentMenu";
import { EmptyState } from "@/components/EmptyState";
import { SearchModal } from "@/components/SearchModal";
import { useChatScreenLogic } from "./useChatScreen";
import { useSpeech } from "./useSpeech";
import { useTTS } from "./useTTS";

/* ──────────────── Types ──────────────── */

interface ChatScreenProps {
  conversationId?: string;
  showBack?: boolean;
  initialMessage?: string;
}

/* ──────────────── Sub-Components ──────────────── */

function Header({
  showBack,
  title,
  modelName,
  onBack,
  onSearch,
  onNewChat,
  onModelPress,
  onSummarize,
  summarizing,
  canSummarize,
}: {
  showBack?: boolean;
  title: string;
  modelName: string;
  onBack: () => void;
  onSearch: () => void;
  onNewChat: () => void;
  onModelPress: () => void;
  onSummarize?: () => void;
  summarizing?: boolean;
  canSummarize?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
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
        {showBack ? (
          <Pressable onPress={onBack} hitSlop={8} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
        ) : (
          <Pressable onPress={onSearch} hitSlop={8} style={styles.headerButton}>
            <Ionicons name="search" size={22} color={colors.text} />
          </Pressable>
        )}

        <View style={styles.headerCenter}>
          <View style={styles.titleRow}>
            {!showBack && (
              <Ionicons name="sparkles" size={17} color={colors.accent} />
            )}
            <Text
              style={[styles.headerTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
          <Pressable
            onPress={onModelPress}
            style={({ pressed }) => [
              styles.modelChip,
              {
                backgroundColor: colors.accentSoft,
                borderColor: colors.accentBorder,
              },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="sparkles" size={12} color={colors.accent} />
            <Text
              style={[styles.modelChipText, { color: colors.accentText }]}
              numberOfLines={1}
            >
              {modelName}
            </Text>
            <Ionicons name="chevron-down" size={12} color={colors.accent} />
          </Pressable>
        </View>

        {!showBack ? (
          <View style={styles.headerActions}>
            {canSummarize && onSummarize && (
              <Pressable
                onPress={onSummarize}
                disabled={summarizing}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.pressed,
                  summarizing && { opacity: 0.5 },
                ]}
              >
                <Ionicons
                  name={summarizing ? "hourglass" : "document-text-outline"}
                  size={22}
                  color={colors.text}
                />
              </Pressable>
            )}
            <Pressable
              onPress={onNewChat}
              hitSlop={8}
              style={styles.headerButton}
            >
              <Ionicons name="create-outline" size={22} color={colors.text} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={onSearch} hitSlop={8} style={styles.headerButton}>
            <Ionicons name="search" size={22} color={colors.text} />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onDismiss}
      style={[
        styles.errorBanner,
        {
          backgroundColor: colors.dangerSoft,
          borderColor: colors.border,
        },
      ]}
    >
      <Ionicons name="alert-circle" size={16} color={colors.danger} />
      <Text
        style={[styles.errorText, { color: colors.danger }]}
        numberOfLines={2}
      >
        {message}
      </Text>
    </Pressable>
  );
}

function Toast({ message, style }: { message: string; style?: StyleProps }) {
  const { colors } = useAppTheme();

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
      pointerEvents="none"
    >
      <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
      <Text style={[styles.toastText, { color: colors.text }]}>{message}</Text>
    </Animated.View>
  );
}

/* ──────────────── Main Component ──────────────── */

function useKeyboardHeight() {
  const height = useSharedValue(0);

  useEffect(() => {
    const onShow = (e: KeyboardEvent) => {
      height.value = withTiming(e.endCoordinates.height, { duration: 250 });
    };
    const onHide = () => {
      height.value = withTiming(0, { duration: 250 });
    };
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [height]);

  return height;
}

export function ChatScreen({
  conversationId,
  showBack,
  initialMessage,
}: ChatScreenProps) {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { settings } = useSettings();
  const { conversations } = useChat();

  const chat = useChatScreenLogic(conversationId, showBack, initialMessage);
  const speech = useSpeech(chat.setInput);
  const tts = useTTS(settings.ttsEnabled);

  const [inputHeight, setInputHeight] = useState(0);
  const handleInputHeight = useCallback((height: number) => {
    setInputHeight(height);
  }, []);

  const { speak } = tts;
  const handleSpeak = useCallback(
    (msg: Message) => speak(msg, settings.speechLang),
    [speak, settings.speechLang],
  );

  const activeError = chat.error?.message ?? speech.error ?? null;
  const dismissError = () => {
    chat.error?.dismiss();
    speech.clearError();
  };

  const handleMicPress = () => {
    if (speech.listening) {
      speech.stopListening();
    } else {
      speech.startListening(settings.speechLang);
    }
  };

  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  const isLastAssistant = (index: number) =>
    index === chat.messages.length - 1 &&
    chat.messages[index]?.role === "assistant";

  const keyboardHeight = useKeyboardHeight();
  const keyboardPadStyle = useAnimatedStyle(
    () => ({ height: keyboardHeight.value }),
    [],
  );
  const toastStyle = useAnimatedStyle(
    () => ({
      bottom:
        (inputHeight > 0 ? inputHeight + TOAST_GAP : TOAST_BOTTOM_OFFSET) +
        keyboardHeight.value,
    }),
    [inputHeight],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack={showBack}
        title={chat.headerTitle}
        modelName={chat.modelName}
        onBack={() => router.back()}
        onSearch={() => setSearchVisible(true)}
        onNewChat={chat.handleNewChat}
        onModelPress={() => chat.setModelPickerVisible(true)}
        onSummarize={chat.handleSummarize}
        summarizing={chat.summarizing}
        canSummarize={chat.messages.length >= 2}
      />

      <View style={styles.flex}>
        {chat.messages.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            ref={chat.listRef}
            style={styles.flex}
            data={chat.messages}
            keyExtractor={(m) => m.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => (
              <View style={styles.messageWrapper}>
                <MessageBubble
                  message={item}
                  streaming={chat.streaming && isLastAssistant(index)}
                  searching={chat.searching && isLastAssistant(index)}
                  speaking={tts.speakingId === item.id}
                  onCopy={chat.handleCopy}
                  onDelete={chat.handleDelete}
                  onEdit={
                    item.role === "user" ? chat.handleStartEdit : undefined
                  }
                  onBookmark={chat.handleBookmark}
                  onRegenerate={
                    item.role === "assistant"
                      ? chat.handleRegenerate
                      : undefined
                  }
                  onSpeak={
                    settings.ttsEnabled && item.role === "assistant"
                      ? handleSpeak
                      : undefined
                  }
                />
              </View>
            )}
            onScroll={chat.handleScroll}
            onContentSizeChange={chat.handleContentSizeChange}
            onLayout={chat.handleLayout}
            scrollEventThrottle={16}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: Spacing.two },
            ]}
            showsVerticalScrollIndicator={false}
          />
        )}

        {activeError && (
          <ErrorBanner message={activeError} onDismiss={dismissError} />
        )}

        <ChatInput
          value={chat.input}
          onChangeText={chat.setInput}
          onSend={chat.handleSend}
          onStop={chat.handleStop}
          onMicPress={handleMicPress}
          onAttachPress={() => setAttachmentMenuVisible(true)}
          onRemoveAttachment={chat.removeAttachment}
          onHeightChange={handleInputHeight}
          attachments={chat.attachments}
          streaming={chat.streaming}
          listening={speech.listening}
        />

        <Animated.View style={keyboardPadStyle} />
      </View>

      <ModelPicker
        visible={chat.modelPickerVisible}
        selected={
          settings.provider === "zen" ? settings.model : settings.customModel
        }
        models={modelsForProvider(settings.provider)}
        subtitle={
          settings.provider === "zen"
            ? "Ditenagai oleh OpenCode Zen"
            : "Model gratis di Groq free tier"
        }
        onClose={() => chat.setModelPickerVisible(false)}
        onSelect={(id) => {
          chat.setModel(id);
          chat.setModelPickerVisible(false);
        }}
      />

      <AttachmentMenu
        visible={attachmentMenuVisible}
        onClose={() => setAttachmentMenuVisible(false)}
        onTakePhoto={() => chat.addImageAttachments(true)}
        onPickImages={() => chat.addImageAttachments(false)}
        onPickDocuments={chat.addDocumentAttachments}
      />

      <SearchModal
        visible={searchVisible}
        conversations={conversations}
        onClose={() => setSearchVisible(false)}
        onSelect={(id) => {
          setSearchVisible(false);
          router.push(`/conversation/${id}`);
        }}
      />

      {chat.toast && <Toast message={chat.toast} style={toastStyle} />}

      {/* Edit Message Modal */}
      <Modal
        visible={chat.editingMessageId !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={chat.handleCancelEdit}
      >
        <View style={styles.editModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={chat.handleCancelEdit}
          />
          <View
            style={[
              styles.editModalCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.editModalTitle, { color: colors.text }]}>
              Edit Pesan
            </Text>
            <TextInput
              value={chat.editingText}
              onChangeText={chat.setEditingText}
              multiline
              autoFocus
              style={[
                styles.editModalInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.editModalActions}>
              <Pressable
                onPress={chat.handleCancelEdit}
                style={({ pressed }) => [
                  styles.editModalButton,
                  { backgroundColor: colors.backgroundElement },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[styles.editModalButtonText, { color: colors.text }]}
                >
                  Batal
                </Text>
              </Pressable>
              <Pressable
                onPress={chat.handleSaveEdit}
                disabled={!chat.editingText.trim()}
                style={({ pressed }) => [
                  styles.editModalButton,
                  { backgroundColor: colors.accent },
                  pressed && styles.pressed,
                  !chat.editingText.trim() && { opacity: 0.5 },
                ]}
              >
                <Text
                  style={[
                    styles.editModalButtonText,
                    { color: colors.onAccent },
                  ]}
                >
                  Simpan & Kirim Ulang
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Summarizing indicator */}
      {chat.summarizing && (
        <View
          style={[
            styles.summarizingOverlay,
            { backgroundColor: colors.surface },
          ]}
        >
          <View
            style={[
              styles.summarizingCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="hourglass-outline"
              size={20}
              color={colors.accent}
            />
            <Text style={[styles.summarizingText, { color: colors.text }]}>
              Meringkas percakapan…
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

/* ──────────────── Layout constants ──────────────── */
const TOAST_BOTTOM_OFFSET = 108;
const TOAST_GAP = 12;

/* ──────────────── Styles ──────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  safeTop: {
    backgroundColor: "transparent",
  },
  messageWrapper: {
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.one,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    gap: Spacing.one,
  },
  headerTitle: {
    flexShrink: 1,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  modelChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    maxWidth: "90%",
  },
  modelChipText: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  toast: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    bottom: TOAST_BOTTOM_OFFSET,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  toastText: {
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  editModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: Spacing.four,
  },
  editModalCard: {
    width: "100%",
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  editModalTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  editModalInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
    lineHeight: 21,
    minHeight: 100,
    textAlignVertical: "top",
  },
  editModalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.two,
  },
  editModalButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
  editModalButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  summarizingOverlay: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 20,
  },
  summarizingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  summarizingText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
