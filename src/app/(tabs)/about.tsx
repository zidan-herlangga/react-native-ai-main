import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";

export default function AboutScreen() {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.safeTop, { backgroundColor: colors.surface }]}
      >
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerSpacer} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Tentang
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
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
          <Text style={[styles.appName, { color: colors.text }]}>
            OrbitChat
          </Text>
          <Text style={[styles.version, { color: colors.textMuted }]}>
            Versi 1.0.0
          </Text>
        </View>

        <Section title="Tentang Aplikasi" colors={colors}>
          <View style={styles.aboutContent}>
            <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
              OrbitChat adalah asisten AI berbasis mobile yang dibangun dengan
              Expo dan React Native. Aplikasi ini mendukung beberapa penyedia
              API seperti OpenCode Zen, Groq, dan endpoint kustom
              OpenAI-compatible lainnya.
            </Text>
          </View>
        </Section>

        <Section title="Fitur Utama" colors={colors}>
          <FeatureItem
            icon="chatbubbles-outline"
            text="Percakapan AI tanpa batas"
            colors={colors}
          />
          <FeatureItem
            icon="globe-outline"
            text="Pencarian web real-time"
            colors={colors}
          />
          <FeatureItem
            icon="volume-high-outline"
            text="Text-to-Speech untuk jawaban"
            colors={colors}
          />
          <FeatureItem
            icon="image-outline"
            text="Kirim gambar dan file"
            colors={colors}
          />
          <FeatureItem
            icon="moon-outline"
            text="Mode gelap & terang"
            colors={colors}
          />
          <FeatureItem
            icon="color-palette-outline"
            text="Penyedia API fleksibel"
            colors={colors}
          />
        </Section>

        <Section title="Teknologi" colors={colors}>
          <View style={styles.techGrid}>
            <TechChip label="React Native" colors={colors} />
            <TechChip label="Expo SDK 57" colors={colors} />
            <TechChip label="TypeScript" colors={colors} />
            <TechChip label="expo-router" colors={colors} />
          </View>
        </Section>

        <Section title="Hak Cipta" colors={colors}>
          <View style={styles.aboutContent}>
            <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
              Dikembangkan dengan sepenuh hati. Dibangun untuk memberikan
              pengalaman asisten AI yang mudah diakses oleh semua orang.
            </Text>
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
        {title.toUpperCase()}
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function FeatureItem({
  icon,
  text,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <View style={styles.featureRow}>
      <View
        style={[styles.featureIcon, { backgroundColor: colors.accentSoft }]}
      >
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <Text style={[styles.featureText, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

function TechChip({
  label,
  colors,
}: {
  label: string;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <View
      style={[
        styles.techChip,
        {
          backgroundColor: colors.accentSoft,
          borderColor: colors.accentBorder,
        },
      ]}
    >
      <Text style={[styles.techChipText, { color: colors.accentText }]}>
        {label}
      </Text>
    </View>
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
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  logoSection: {
    alignItems: "center",
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
  },
  version: {
    fontSize: 14,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginLeft: Spacing.two,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  aboutContent: {
    padding: Spacing.three,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    gap: Spacing.three,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  techGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: Spacing.three,
    gap: Spacing.two,
  },
  techChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  techChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
