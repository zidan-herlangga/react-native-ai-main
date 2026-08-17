import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { stripMarkdown } from "@/lib/format";
import type { Conversation } from "@/lib/types";

type SearchResult = {
  conversationId: string;
  conversationTitle: string;
  messageId: string;
  snippet: string;
  role: string;
  createdAt: number;
};

type Props = {
  visible: boolean;
  conversations: Conversation[];
  onClose: () => void;
  onSelect: (conversationId: string) => void;
};

export function SearchModal({
  visible,
  conversations,
  onClose,
  onSelect,
}: Props) {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState("");

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const found: SearchResult[] = [];

    for (const conv of conversations) {
      for (const msg of conv.messages) {
        const plain = stripMarkdown(msg.content).toLowerCase();
        if (plain.includes(q)) {
          const snippet = generateSnippet(
            stripMarkdown(msg.content),
            query,
          );
          found.push({
            conversationId: conv.id,
            conversationTitle: conv.title,
            messageId: msg.id,
            snippet,
            role: msg.role,
            createdAt: msg.createdAt,
          });
        }
      }
    }
    return found;
  }, [query, conversations]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.header,
              { borderBottomColor: colors.border },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={colors.textSecondary}
            />
            <TextInput
              key={visible ? "active" : "inactive"}
              value={query}
              onChangeText={setQuery}
              placeholder="Cari pesan..."
              placeholderTextColor={colors.textMuted}
              autoFocus
              style={[styles.input, { color: colors.text }]}
            />
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={styles.closeBtn}
            >
              <Ionicons
                name="close"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          </View>

          <FlatList
            data={results}
            keyExtractor={(item) => item.messageId}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              query.trim() ? (
                <View style={styles.emptyState}>
                  <Text
                    style={[styles.emptyText, { color: colors.textMuted }]}
                  >
                    {"Tidak ada hasil untuk \""}
                    {query}
                    {"\""}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="search-outline"
                    size={32}
                    color={colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.emptyText,
                      { color: colors.textMuted, marginTop: 8 },
                    ]}
                  >
                    Ketik untuk mencari pesan
                  </Text>
                </View>
              )
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item.conversationId)}
                style={({ pressed }) => [
                  styles.resultItem,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.resultHeader}>
                  <View
                    style={[
                      styles.roleBadge,
                      {
                        backgroundColor:
                          item.role === "user"
                            ? colors.accentSoft
                            : colors.backgroundElement,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleText,
                        {
                          color:
                            item.role === "user"
                              ? colors.text
                              : colors.accent,
                        },
                      ]}
                    >
                      {item.role === "user" ? "Kamu" : "AI"}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.chatTitle,
                      { color: colors.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {item.conversationTitle || "Percakapan baru"}
                  </Text>
                </View>
                <Text
                  style={[styles.snippet, { color: colors.text }]}
                  numberOfLines={3}
                >
                  {item.snippet}
                </Text>
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

function generateSnippet(text: string, query: string): string {
  const maxLength = 150;
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(query.toLowerCase());

  if (index === -1)
    return (
      text.slice(0, maxLength) + (text.length > maxLength ? "..." : "")
    );

  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + query.length + 80);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet += "...";
  return snippet;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "80%",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    padding: 12,
    minHeight: 100,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
  },
  resultItem: {
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "700",
  },
  chatTitle: {
    fontSize: 12,
    flex: 1,
  },
  snippet: {
    fontSize: 13,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.7,
  },
});
