import { Fonts, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export function EmptyState() {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.robotBgWrap} pointerEvents="none">
        <Image
          source={require("@/assets/images/kawan-model-transparent.png")}
          style={styles.robotBg}
          resizeMode="contain"
        />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: colors.text }]}>
          Ada yang bisa kubantu?
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Ketik pertanyaanmu di bawah untuk memulai percakapan.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  robotBgWrap: {
    position: "absolute",
    right: -80,
    bottom: -60,
    width: 420,
    height: 420,
  },
  robotBg: {
    width: "100%",
    height: "100%",
    opacity: 0.15,
  },
  textBlock: {
    alignItems: "center",
    gap: Spacing.three,
    zIndex: 1,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 340,
    textAlign: "center",
  },
});
