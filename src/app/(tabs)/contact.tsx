import { Ionicons } from "@expo/vector-icons";

import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";

const DEVELOPER_EMAIL = "zidanherlangga24@gmail.com";
const DEVELOPER_NAME = "Zidan Herlangga";

export default function ContactScreen() {
  const { colors } = useAppTheme();

  const handleEmailPress = async () => {
    const url = `mailto:${DEVELOPER_EMAIL}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert("Email", `Email: ${DEVELOPER_EMAIL}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.safeTop, { backgroundColor: colors.surface }]}
      >
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerSpacer} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Kontak
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: colors.accentSoft,
                borderColor: colors.accentBorder,
              },
            ]}
          >
            <Ionicons name="person" size={40} color={colors.accent} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {DEVELOPER_NAME}
          </Text>
          <Text style={[styles.role, { color: colors.textSecondary }]}>
            Developer
          </Text>
        </View>

        <Section title="Hubungi Developer" colors={colors}>
          <View
            style={[
              styles.emailCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.emailRow}>
              <View
                style={[
                  styles.emailIcon,
                  { backgroundColor: colors.accentSoft },
                ]}
              >
                <Ionicons name="mail-outline" size={22} color={colors.accent} />
              </View>
              <View style={styles.emailInfo}>
                <Text style={[styles.emailLabel, { color: colors.textMuted }]}>
                  Email
                </Text>
                <Text
                  onPress={handleEmailPress}
                  style={[styles.emailValue, { color: colors.text }]}
                >
                  {DEVELOPER_EMAIL}
                </Text>
              </View>
            </View>
            <Text style={[styles.emailHint, { color: colors.textSecondary }]}>
              Tekan untuk mengirim email langsung ke developer.
            </Text>
          </View>
        </Section>

        <Section title="Sosial Media" colors={colors}>
          <View style={styles.socialGrid}>
            <SocialCard
              icon="logo-instagram"
              label="Instagram"
              colors={colors}
              onPress={() =>
                Linking.openURL("https://instagram.com/zidanherlangga_")
              }
            />
            <SocialCard
              icon="logo-twitter"
              label="Twitter"
              colors={colors}
              onPress={() => Linking.openURL("https://x.com/dansec04_")}
            />
            <SocialCard
              // telegram
              icon="paper-plane"
              label="Telegram"
              colors={colors}
              onPress={() => Linking.openURL("https://t.me/zidanherlangga")}
            />
          </View>
        </Section>

        <Section title="Dukungan" colors={colors}>
          <View style={styles.supportContent}>
            <Text style={[styles.supportText, { color: colors.textSecondary }]}>
              Jika kamu menemukan bug atau memiliki saran untuk perbaikan,
              jangan ragu untuk menghubungi developer melalui email atau media
              sosial di atas.
            </Text>
            <Text style={[styles.supportText, { color: colors.textSecondary }]}>
              Dukungan kamu sangat berarti untuk pengembangan aplikasi ini
              menjadi lebih baik!
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
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function SocialCard({
  icon,
  label,
  colors,
  onPress,
  fullWidth,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: ReturnType<typeof useAppTheme>["colors"];
  onPress: () => void;
  fullWidth?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.socialCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons name={icon} size={22} color={colors.accent} />
        <Text style={[styles.socialLabel, { color: colors.text }]}>
          {label}
        </Text>
      </View>
    </Pressable>
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
  profileSection: {
    alignItems: "center",
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
  },
  role: {
    fontSize: 14,
    fontWeight: "500",
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
  sectionCard: {
    gap: 0,
  },
  emailCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  emailIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  emailInfo: {
    flex: 1,
    gap: 2,
  },
  emailLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  emailValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  emailHint: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: Spacing.one,
  },
  socialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    padding: Spacing.three,
  },
  socialCard: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    minHeight: 90,
  },
  socialLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  fullWidth: {
    flex: 1,
  },
  supportContent: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  supportText: {
    fontSize: 14,
    lineHeight: 21,
  },
  fabContainer: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.7,
  },
});
