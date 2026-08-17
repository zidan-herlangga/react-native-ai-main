// components/MessageBubble.tsx

/* eslint-disable react-hooks/immutability -- Shared values from
   react-native-reanimated are mutable by design. The lint rule
   does not understand Reanimated's mutable shared values. */
import { Ionicons } from "@expo/vector-icons";
import { memo, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { MarkdownText } from "@/components/Markdown";
import { TypingIndicator } from "@/components/TypingIndicator";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { softBreak } from "@/lib/markdown";
import type { Attachment, Message, WebSearchSource } from "@/lib/types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

type MessageBubbleProps = {
  message: Message;
  streaming?: boolean;
  searching?: boolean;
  speaking?: boolean;
  onCopy: (text: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, newText: string) => void;
  onBookmark?: (id: string) => void;
  onRegenerate?: (id: string) => void;
  onSpeak?: (message: Message) => void;
};

export const MessageBubble = memo(function MessageBubble({
  message,
  streaming,
  searching,
  speaking,
  onCopy,
  onDelete,
  onEdit,
  onBookmark,
  onRegenerate,
  onSpeak,
}: MessageBubbleProps) {
  const { colors } = useAppTheme();
  const isUser = message.role === "user";

  const actions = isUser ? (
    <View style={styles.actions}>
      <ActionButton
        icon="copy-outline"
        onPress={() => onCopy(message.content)}
        testID={`copy-${message.id}`}
      />
      {onEdit && (
        <ActionButton
          icon="create-outline"
          onPress={() => onEdit(message.id, message.content)}
          testID={`edit-${message.id}`}
        />
      )}
      {onBookmark && (
        <ActionButton
          icon={message.bookmarked ? "star" : "star-outline"}
          color={message.bookmarked ? "#F59E0B" : undefined}
          onPress={() => onBookmark(message.id)}
          testID={`bookmark-${message.id}`}
        />
      )}
      <ActionButton
        icon="trash-outline"
        onPress={() => onDelete(message.id)}
        testID={`delete-${message.id}`}
      />
    </View>
  ) : (
    <View style={styles.actions}>
      <ActionButton
        icon="copy-outline"
        onPress={() => onCopy(message.content)}
        testID={`copy-${message.id}`}
      />
      {onBookmark && (
        <ActionButton
          icon={message.bookmarked ? "star" : "star-outline"}
          color={message.bookmarked ? "#F59E0B" : undefined}
          onPress={() => onBookmark(message.id)}
          testID={`bookmark-${message.id}`}
        />
      )}
      {onRegenerate && (
        <ActionButton
          icon="refresh-outline"
          onPress={() => onRegenerate(message.id)}
          testID={`redo-${message.id}`}
        />
      )}
      {onSpeak && (
        <ActionButton
          icon={speaking ? "volume-high" : "volume-medium-outline"}
          color={speaking ? colors.accent : undefined}
          onPress={() => onSpeak(message)}
          testID={`speak-${message.id}`}
        />
      )}
      <ActionButton
        icon="trash-outline"
        onPress={() => onDelete(message.id)}
        testID={`delete-${message.id}`}
      />
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.containerRight : styles.containerLeft,
      ]}
    >
      {isUser ? (
        <View style={styles.userColumn}>
          <View
            style={[
              styles.userBubbleBox,
              {
                backgroundColor: colors.userBubble,
                borderColor: colors.border,
              },
            ]}
          >
            {message.attachments && message.attachments.length > 0 && (
              <AttachmentPreviewList attachments={message.attachments} />
            )}
            {message.content.length > 0 && (
              <Text style={[styles.userText, { color: colors.userBubbleText }]}>
                {softBreak(message.content)}
              </Text>
            )}
          </View>
          {message.bookmarked && (
            <View style={styles.bookmarkIndicator}>
              <Ionicons name="star" size={12} color="#F59E0B" />
            </View>
          )}
          {actions}
        </View>
      ) : (
        <View style={styles.assistantColumn}>
          {message.error ? (
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {message.content}
            </Text>
          ) : message.content.length > 0 ? (
            <>
              <MarkdownText streaming={streaming}>
                {message.content}
              </MarkdownText>
              {message.sources && message.sources.length > 0 && (
                <SourcesList sources={message.sources} />
              )}
            </>
          ) : streaming ? (
            searching ? (
              <SearchingIndicator />
            ) : (
              <TypingIndicator />
            )
          ) : null}
          {message.bookmarked && (
            <View style={styles.bookmarkIndicator}>
              <Ionicons name="star" size={12} color="#F59E0B" />
            </View>
          )}
          {actions}
        </View>
      )}
    </View>
  );
});

// ============================================================
// SUB-COMPONENTS
// ============================================================

function SearchingIndicator() {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.searchingWrap,
        {
          backgroundColor: colors.accentSoft,
          borderColor: colors.accentBorder,
        },
      ]}
    >
      <Ionicons name="globe-outline" size={15} color={colors.accent} />
      <Text style={[styles.searchingText, { color: colors.accentText }]}>
        Mencari di web…
      </Text>
    </View>
  );
}

function SourcesList({ sources }: { sources: WebSearchSource[] }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.sourcesWrap}>
      <View style={styles.sourcesHeader}>
        <Ionicons name="link" size={13} color={colors.textSecondary} />
        <Text style={[styles.sourcesLabel, { color: colors.textSecondary }]}>
          Sumber
        </Text>
      </View>
      {sources.map((s, i) => (
        <Pressable
          key={`${s.url}-${i}`}
          onPress={() => Linking.openURL(s.url)}
          style={({ pressed }) => [
            styles.sourceRow,
            { borderColor: colors.border },
            pressed && styles.actionPressed,
          ]}
        >
          <Ionicons
            name="document-text-outline"
            size={13}
            color={colors.accent}
          />
          <Text
            style={[styles.sourceText, { color: colors.accentText }]}
            numberOfLines={2}
          >
            {s.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function ActionButton({
  icon,
  onPress,
  color,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  testID?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.actionButton,
        pressed && styles.actionPressed,
      ]}
    >
      <Ionicons name={icon} size={15} color={color ?? colors.textMuted} />
    </Pressable>
  );
}

function AttachmentPreviewList({ attachments }: { attachments: Attachment[] }) {
  const { colors } = useAppTheme();
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);

  const openLightbox = (uri: string) => {
    setLightboxUri(uri);
    setLightboxVisible(true);
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
    setLightboxUri(null);
  };

  return (
    <>
      <View style={styles.attachmentList}>
        {attachments.map((a) =>
          a.kind === "image" ? (
            <Pressable
              key={a.id}
              onPress={() => openLightbox(a.uri)}
              style={({ pressed }) => [
                styles.attachmentImageWrap,
                pressed && styles.imagePressed,
              ]}
            >
              <Image source={{ uri: a.uri }} style={styles.attachmentImage} />
              <View style={styles.imageOverlayHint}>
                <Ionicons name="expand-outline" size={16} color="#FFFFFF" />
              </View>
            </Pressable>
          ) : (
            <View
              key={a.id}
              style={[
                styles.attachmentFileChip,
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
                style={[styles.attachmentName, { color: colors.text }]}
                numberOfLines={1}
              >
                {a.name}
              </Text>
            </View>
          ),
        )}
      </View>

      <LightboxModal
        visible={lightboxVisible}
        uri={lightboxUri}
        onClose={closeLightbox}
      />
    </>
  );
}

function LightboxModal({
  visible,
  uri,
  onClose,
}: {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
}) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, Math.min(e.scale, 5));
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
      }
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const handleDoubleTap = () => {
    if (scale.value > 1) {
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    } else {
      scale.value = withSpring(2);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.lightboxContainer}>
        <Pressable style={styles.lightboxBackdrop} onPress={onClose} />
        <GestureDetector gesture={composed}>
          <Animated.View style={[styles.lightboxImageWrap, animatedStyle]}>
            <Pressable onPress={handleDoubleTap}>
              {uri && (
                <Image
                  source={{ uri }}
                  style={styles.lightboxImage}
                  resizeMode="contain"
                />
              )}
            </Pressable>
          </Animated.View>
        </GestureDetector>
        <Pressable
          style={styles.lightboxClose}
          onPress={onClose}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </Pressable>
        <View style={styles.lightboxHint}>
          <Text style={styles.lightboxHintText}>Pinch to zoom &bull; Double tap to zoom &bull; Tap outside to close</Text>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: Spacing.two,
    width: "100%",
    maxWidth: "100%",
  },
  containerLeft: {
    justifyContent: "flex-start",
  },
  containerRight: {
    justifyContent: "flex-end",
  },
  userColumn: {
    maxWidth: "82%",
    alignItems: "flex-end",
    flexShrink: 1,
  },
  assistantColumn: {
    flex: 1,
    maxWidth: "100%",
    width: "100%",
    alignItems: "stretch",
    overflow: "hidden",
  },
  userBubbleBox: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.xl,
    borderTopRightRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: "100%",
  },
  userText: {
    fontSize: 15,
    lineHeight: 21,
    flexWrap: "wrap",
  },
  attachmentList: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
    maxWidth: "100%",
  },
  attachmentImageWrap: {
    borderRadius: Radius.md,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.1)",
    maxWidth: "100%",
  },
  attachmentImage: {
    width: "100%",
    aspectRatio: 1.6,
  },
  attachmentFileChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    maxWidth: "100%",
  },
  attachmentName: {
    flexShrink: 1,
    fontSize: 13,
    maxWidth: "90%",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  searchingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    alignSelf: "flex-start",
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    maxWidth: "100%",
  },
  searchingText: {
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
  sourcesWrap: {
    marginTop: Spacing.two,
    gap: Spacing.one,
    maxWidth: "100%",
  },
  sourcesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  sourcesLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    maxWidth: "100%",
  },
  sourceText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 17,
    flexShrink: 1,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  actionButton: {
    padding: Spacing.one,
  },
  actionPressed: {
    opacity: 0.5,
  },
  bookmarkIndicator: {
    alignSelf: "flex-end",
    marginTop: 2,
    marginRight: 4,
  },
  imagePressed: {
    opacity: 0.8,
  },
  imageOverlayHint: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: Radius.full,
    padding: 4,
  },
  lightboxContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lightboxImageWrap: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  lightboxClose: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: Radius.full,
    padding: 8,
    zIndex: 10,
  },
  lightboxHint: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  lightboxHintText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
});
