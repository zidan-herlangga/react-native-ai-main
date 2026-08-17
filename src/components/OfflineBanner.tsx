import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function OfflineBanner() {
  const isConnected = useNetworkStatus();
  const { colors } = useAppTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isConnected ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, opacity]);

  if (isConnected) return null;

  return (
    <Animated.View
      style={[styles.banner, { backgroundColor: colors.danger, opacity }]}
      pointerEvents="none"
    >
      <Ionicons name="cloud-offline" size={14} color="#fff" />
      <Text style={styles.text}>Tidak ada koneksi internet</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  text: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
