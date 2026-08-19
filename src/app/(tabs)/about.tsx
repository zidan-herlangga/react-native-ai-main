import { Ionicons } from "@expo/vector-icons";

import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StatsCard } from "@/components/StatsCard";
import { Radius, Spacing } from "@/constants/theme";
import { useChat } from "@/context/ChatContext";
import { useAppTheme } from "@/context/ThemeContext";
import { computeStats } from "@/lib/storage";

const HEADER_PADDING_V = Spacing.two + Spacing.one;

export default function AboutScreen() {
  const { colors } = useAppTheme();
  const { conversations } = useChat();
  const stats = computeStats(conversations);

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
              {
                backgroundColor: colors.accentSoft,
                borderColor: colors.accentBorder,
              },
            ]}
          >
            <Image
              source={require("@/assets/images/kawan-model.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>
            Kawan Model
          </Text>
          <Text style={[styles.version, { color: colors.textMuted }]}>
            Versi 1.0.0
          </Text>
        </View>

        <Section title="Tentang Aplikasi" colors={colors}>
          <View style={styles.aboutContent}>
            <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
              Kawan Model adalah asisten AI berbasis mobile yang dibangun dengan
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

        <Section title="Statistik Penggunaan" colors={colors}>
          <View style={styles.aboutContent}>
            <StatsCard stats={stats} />
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
        <Ionicons name={icon} size={16} color={colors.accent} />
      </View>
      <Text style={[styles.featureText, { color: colors.text }]}>{text}</Text>
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
    paddingVertical: HEADER_PADDING_V,
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  logoSection: {
    alignItems: "center",
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
  },
  version: {
    fontSize: 13,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginLeft: Spacing.one,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  aboutContent: {
    padding: Spacing.three,
  },
  aboutText: {
    fontSize: 13,
    lineHeight: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    gap: Spacing.three,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    gap: Spacing.three,
  },
  reportIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  reportMain: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  reportSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  pressed: {
    opacity: 0.5,
  },
});
