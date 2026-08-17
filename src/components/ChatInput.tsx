import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import type { Attachment } from "@/lib/types";

type ChatInputProps = TextInputProps & {
  onSend: () => void;
  onStop: () => void;
  onMicPress: () => void;
  onAttachPress: () => void;
  onRemoveAttachment: (id: string) => void;
  onHeightChange?: (height: number) => void;
  attachments: Attachment[];
  streaming: boolean;
  listening: boolean;
};

export function ChatInput({
  value,
  onChangeText,
  onSend,
  onStop,
  onMicPress,
  onAttachPress,
  onRemoveAttachment,
  onHeightChange,
  attachments,
  streaming,
  listening,
  editable,
  placeholder,
}: ChatInputProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [focused, setFocused] = useState(false);
  const hasText = (value?.trim() ?? "").length > 0;
  const canSend = !streaming && (hasText || attachments.length > 0);

  // The keyboard is lifted by the animated pad in ChatScreen, so the input
  // keeps its normal safe-area bottom padding whether the keyboard is open
  // or closed (works with edge-to-edge on Android).
  const bottomPad = Math.max(insets.bottom, Spacing.two);
  const inputBorderColor = focused ? colors.accent : colors.border;
  const inputBg = focused ? colors.surface : colors.inputBg;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: 10 + bottomPad,
        },
      ]}
      onLayout={
        onHeightChange
          ? (e) => onHeightChange(e.nativeEvent.layout.height)
          : undefined
      }
    >
      {attachments.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.attachmentRow}
          contentContainerStyle={styles.attachmentRowContent}
          keyboardShouldPersistTaps="handled"
        >
          {attachments.map((a) =>
            a.kind === "image" ? (
              <View key={a.id} style={styles.attachmentThumb}>
                <Image
                  source={{ uri: a.uri }}
                  style={styles.attachmentImage}
                />
                <Pressable
                  testID={`remove-attachment-${a.id}`}
                  onPress={() => onRemoveAttachment(a.id)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.removeBadge,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="close" size={12} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : (
              <View
                key={a.id}
                style={[
                  styles.fileChip,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color={colors.accent}
                />
                <Text
                  style={[styles.fileChipText, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {a.name}
                </Text>
                <Pressable
                  testID={`remove-attachment-${a.id}`}
                  onPress={() => onRemoveAttachment(a.id)}
                  hitSlop={8}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <Ionicons
                    name="close"
                    size={14}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            ),
          )}
        </ScrollView>
      )}

      <View
        style={[
          styles.inputRow,
          { backgroundColor: inputBg, borderColor: inputBorderColor },
        ]}
      >
        <Pressable
          testID="attach-button"
          onPress={onAttachPress}
          disabled={streaming}
          style={({ pressed }) => [
            styles.sideButton,
            { backgroundColor: colors.backgroundElement },
            pressed && styles.pressed,
            streaming && { opacity: 0.4 },
          ]}
        >
          <Ionicons
            name="attach-outline"
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>
        <Pressable
          testID="mic-button"
          onPress={onMicPress}
          style={({ pressed }) => [
            styles.sideButton,
            { backgroundColor: colors.backgroundElement },
            pressed && styles.pressed,
            listening && { backgroundColor: colors.dangerSoft },
          ]}
        >
          <Ionicons
            name={listening ? "mic" : "mic-outline"}
            size={21}
            color={listening ? colors.danger : colors.textSecondary}
          />
        </Pressable>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? "Tulis pesan…"}
          placeholderTextColor={colors.textMuted}
          editable={editable}
          multiline
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, { color: colors.text }]}
          returnKeyType="send"
          onSubmitEditing={streaming ? undefined : onSend}
          blurOnSubmit={false}
        />
        {streaming ? (
          <Pressable
            testID="stop-button"
            onPress={onStop}
            style={({ pressed }) => [
              styles.stopButton,
              { backgroundColor: colors.danger },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="stop" size={20} color="#FFFFFF" />
          </Pressable>
        ) : (
          <Pressable
            testID="send-button"
            onPress={canSend ? onSend : undefined}
            disabled={!canSend}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <View
              style={[
                styles.sendButton,
                { backgroundColor: colors.accent },
                !canSend && { opacity: 0.45 },
              ]}
            >
              <Ionicons name="arrow-up" size={22} color={colors.onAccent} />
            </View>
          </Pressable>
        )}
      </View>
      {listening ? (
        <View style={styles.listeningHint}>
          <Ionicons name="pulse" size={12} color={colors.danger} />
          <Text style={[styles.listeningText, { color: colors.danger }]}>
            Mendengarkan…
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1.5,
    borderRadius: Radius.xxl,
    padding: Spacing.one,
    gap: Spacing.one,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    maxHeight: 120,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  sideButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  stopButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.97 }],
  },
  listeningHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  listeningText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Attachment previews
  attachmentRow: {
    flexGrow: 0,
    marginBottom: Spacing.two,
  },
  attachmentRowContent: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  attachmentThumb: {
    position: "relative",
  },
  attachmentImage: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
  },
  removeBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  fileChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 200,
  },
  fileChipText: {
    flexShrink: 1,
    fontSize: 13,
  },
});
