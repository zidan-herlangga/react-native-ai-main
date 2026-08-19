import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { clearCrashLogs, loadCrashLogs } from "@/lib/storage";
import type { CrashLog } from "@/lib/types";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const DEVELOPER_EMAIL = "zidanherlangga24@gmail.com";

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CrashReportModal({ visible, onClose }: Props) {
  const { colors } = useAppTheme();
  const [logs, setLogs] = useState<CrashLog[]>([]);

  useEffect(() => {
    if (visible) {
      loadCrashLogs().then(setLogs);
    }
  }, [visible]);

  const handleSendReport = (log: CrashLog) => {
    const subject = encodeURIComponent(`Kawan Model Crash Report - ${log.id}`);
    const body = encodeURIComponent(
      [
        `Crash Report - Kawan Model v${log.appVersion}`,
        `Waktu: ${formatTimestamp(log.timestamp)}`,
        `Platform: ${log.platform} ${log.osVersion}`,
        "",
        `Error:`,
        log.message,
        "",
        `Stack Trace:`,
        log.stack || "(tidak tersedia)",
      ].join("\n"),
    );
    Linking.openURL(`mailto:${DEVELOPER_EMAIL}?subject=${subject}&body=${body}`);
  };

  const handleClearAll = () => {
    Alert.alert(
      "Hapus Semua Log?",
      "Semua laporan crash akan dihapus permanen.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => clearCrashLogs().then(() => setLogs([])),
        },
      ],
    );
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
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Ionicons name="bug-outline" size={22} color={colors.danger} />
              <Text style={[styles.title, { color: colors.text }]}>
                Laporan Crash
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          {logs.length > 0 && (
            <Pressable
              onPress={handleClearAll}
              hitSlop={8}
              style={styles.clearButton}
            >
              <Text style={[styles.clearText, { color: colors.danger }]}>
                Hapus Semua
              </Text>
            </Pressable>
          )}

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {logs.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={40}
                  color={colors.accent}
                />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Tidak Ada Crash
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Aplikasi berjalan dengan stabil.
                </Text>
              </View>
            ) : (
              logs.map((log) => (
                <View
                  key={log.id}
                  style={[
                    styles.logCard,
                    { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.logHeader}>
                    <Text style={[styles.logTime, { color: colors.textMuted }]}>
                      {formatTimestamp(log.timestamp)}
                    </Text>
                    <Text style={[styles.logPlatform, { color: colors.textSecondary }]}>
                      {log.platform} {log.osVersion}
                    </Text>
                  </View>
                  <Text
                    style={[styles.logMessage, { color: colors.text }]}
                    numberOfLines={3}
                  >
                    {log.message}
                  </Text>
                  <Pressable
                    onPress={() => handleSendReport(log)}
                    style={({ pressed }) => [
                      styles.sendButton,
                      { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons name="mail-outline" size={16} color={colors.accent} />
                    <Text style={[styles.sendText, { color: colors.accentText }]}>
                      Kirim Laporan
                    </Text>
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: colors.backgroundElement },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.closeText, { color: colors.text }]}>Tutup</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: Spacing.four,
  },
  card: {
    width: "100%",
    maxHeight: "80%",
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  clearButton: {
    alignSelf: "flex-end",
  },
  clearText: {
    fontSize: 13,
    fontWeight: "600",
  },
  scrollArea: {
    maxHeight: 400,
  },
  scrollContent: {
    gap: Spacing.two,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 14,
  },
  logCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logTime: {
    fontSize: 12,
    fontWeight: "600",
  },
  logPlatform: {
    fontSize: 11,
  },
  logMessage: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "monospace",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.one,
    paddingHorizontal: Spacing.two + Spacing.one,
    paddingVertical: Spacing.one,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  sendText: {
    fontSize: 13,
    fontWeight: "600",
  },
  closeButton: {
    alignItems: "center",
    paddingVertical: Spacing.two + Spacing.one,
    borderRadius: Radius.md,
  },
  closeText: {
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
