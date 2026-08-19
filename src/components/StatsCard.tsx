import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import type { AppStats } from "@/lib/types";

type StatItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}rb`;
  return n.toLocaleString("id-ID");
}

function formatDuration(firstAt: number | null, lastAt: number | null): string {
  if (!firstAt || !lastAt) return "—";
  const ms = lastAt - firstAt;
  const days = Math.floor(ms / 86_400_000);
  if (days > 30) return `${Math.floor(days / 30)} bln`;
  if (days > 0) return `${days} hari`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours > 0) return `${hours} jam`;
  const mins = Math.floor(ms / 60_000);
  return `${mins} mnt`;
}

function shortModel(model: string): string {
  if (!model) return "—";
  const parts = model.split("/");
  return parts[parts.length - 1] || model;
}

export function StatsCard({ stats }: { stats: AppStats }) {
  const { colors } = useAppTheme();

  const items: StatItem[] = [
    {
      icon: "chatbubbles-outline",
      label: "Percakapan",
      value: formatNumber(stats.totalConversations),
      color: colors.accent,
    },
    {
      icon: "document-text-outline",
      label: "Pesan",
      value: formatNumber(stats.totalMessages),
      color: colors.orange,
    },
    {
      icon: "flash-outline",
      label: "Est. Token",
      value: formatNumber(stats.estimatedTokens),
      color: colors.navy,
    },
    {
      icon: "calendar-outline",
      label: "Pertama Chat",
      value: stats.firstChatAt
        ? new Date(stats.firstChatAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })
        : "—",
      color: colors.accentBright,
    },
    {
      icon: "time-outline",
      label: "Durasi Total",
      value: formatDuration(stats.firstChatAt, stats.lastChatAt),
      color: colors.danger,
    },
    {
      icon: "sparkles",
      label: "Model Favorit",
      value: shortModel(stats.favoriteModel),
      color: colors.cyan,
    },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.label} style={[styles.cell, { backgroundColor: colors.backgroundElement }]}>
            <View style={[styles.iconWrap, { backgroundColor: item.color + "15" }]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <Text style={[styles.cellValue, { color: colors.text }]} numberOfLines={1}>
              {item.value}
            </Text>
            <Text style={[styles.cellLabel, { color: colors.textMuted }]} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  cell: {
    width: "47.5%",
    borderRadius: Radius.md,
    padding: Spacing.two + Spacing.one,
    alignItems: "center",
    gap: Spacing.one,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cellValue: {
    fontSize: 17,
    fontWeight: "700",
  },
  cellLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
});
