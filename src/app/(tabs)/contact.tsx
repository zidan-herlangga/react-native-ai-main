import { CrashReportModal } from "@/components/CrashReportModal";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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

const HEADER_PADDING_V = Spacing.two + Spacing.one;

const DEVELOPER_EMAIL = "zidanherlangga24@gmail.com";
const DEVELOPER_NAME = "Zidan Herlangga";

export default function ContactScreen() {
  const { colors } = useAppTheme();
  const [crashModalVisible, setCrashModalVisible] = useState(false);

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
            <Ionicons name="person" size={36} color={colors.accent} />
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
                <Ionicons name="mail-outline" size={20} color={colors.accent} />
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

        <Section title="Masalah?" colors={colors}>
          <Pressable
            onPress={() => setCrashModalVisible(true)}
            style={({ pressed }) => [
              styles.reportRow,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.reportIcon,
                { backgroundColor: colors.dangerSoft },
              ]}
            >
              <Ionicons name="bug-outline" size={18} color={colors.danger} />
            </View>
            <View style={styles.reportMain}>
              <Text style={[styles.reportTitle, { color: colors.text }]}>
                Laporkan Bug
              </Text>
              <Text
                style={[styles.reportSubtitle, { color: colors.textSecondary }]}
              >
                Kirim laporan crash via email
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textMuted}
            />
          </Pressable>
        </Section>

        <CrashReportModal
          visible={crashModalVisible}
          onClose={() => setCrashModalVisible(false)}
        />
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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: ReturnType<typeof useAppTheme>["colors"];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View
        style={[
          styles.socialCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons name={icon} size={20} color={colors.accent} />
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
  profileSection: {
    alignItems: "center",
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
  },
  role: {
    fontSize: 13,
    fontWeight: "500",
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
  sectionCard: {
    gap: 0,
  },
  emailCard: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  emailIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  emailInfo: {
    flex: 1,
    gap: 1,
  },
  emailLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  emailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  emailHint: {
    fontSize: 12,
    lineHeight: 16,
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
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    minHeight: 80,
  },
  socialLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  supportContent: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  supportText: {
    fontSize: 13,
    lineHeight: 19,
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
