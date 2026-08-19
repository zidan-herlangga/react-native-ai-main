import { Ionicons } from "@expo/vector-icons";
import React, { Component, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Radius, Spacing } from "@/constants/theme";
import { saveCrashLog } from "@/lib/storage";
import type { CrashLog } from "@/lib/types";
import { uid } from "@/lib/types";

type Props = { children: ReactNode };
type State = { error: Error | null; info: string | null };

class ErrorBoundaryInner extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): State {
    return { error, info: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ info: errorInfo.componentStack ?? "" });

    const log: CrashLog = {
      id: uid(),
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      platform: Platform.OS,
      osVersion: Platform.Version as unknown as string,
      appVersion: "1.0.0",
    };
    saveCrashLog(log).catch(() => {});
  }

  handleRestart = () => {
    this.setState({ error: null, info: null });
  };

  render() {
    if (this.state.error) {
      return (
        <CrashView
          error={this.state.error}
          onRestart={this.handleRestart}
        />
      );
    }
    return this.props.children;
  }
}

function CrashView({ error, onRestart }: { error: Error; onRestart: () => void }) {
  const colors = {
    background: "#0A1628",
    surface: "#121F35",
    text: "#EEF2F7",
    textSecondary: "#A8B5C5",
    accent: "#00B4D8",
    danger: "#F37A3D",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: colors.danger + "20" }]}>
          <Ionicons name="warning" size={48} color={colors.danger} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Oops! Terjadi Kesalahan
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Aplikasi mengalami error yang tidak terduga.
        </Text>

        <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.danger + "30" }]}>
          <Text style={[styles.errorLabel, { color: colors.danger }]}>Error:</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]} selectable>
            {error.message}
          </Text>
        </View>

        <Pressable
          onPress={onRestart}
          style={({ pressed }) => [
            styles.restartButton,
            { backgroundColor: colors.accent },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.restartText}>Coba Lagi</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ErrorBoundary({ children }: Props) {
  return <ErrorBoundaryInner>{children}</ErrorBoundaryInner>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  errorCard: {
    width: "100%",
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  errorLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  errorMessage: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "monospace",
  },
  restartButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Radius.xl,
    marginTop: Spacing.two,
  },
  restartText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
