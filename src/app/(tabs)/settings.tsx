import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ModelPicker } from "@/components/ModelPicker";
import { Radius, Spacing } from "@/constants/theme";
import { useChat } from "@/context/ChatContext";
import { useSettings } from "@/context/SettingsContext";
import { useAppTheme } from "@/context/ThemeContext";
import { PROVIDER_CONFIG } from "@/lib/api";
import {
  DEFAULT_GROQ_MODEL,
  GROQ_MODELS,
  MODELS,
  displayModelName,
} from "@/lib/models";
import type { Provider } from "@/lib/types";

const PROVIDERS: { key: Provider; label: string }[] = [
  { key: "zen", label: "Zen" },
  { key: "groq", label: "Groq" },
  { key: "custom", label: "Kustom" },
];

const LANGS = [
  { key: "id-ID", label: "Indonesia" },
  { key: "en-US", label: "English" },
  { key: "en-GB", label: "English (UK)" },
];

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const {
    settings,
    ready,
    setProvider,
    setApiKey,
    setModel,
    setCustomModel,
    setBaseUrl,
    setTtsEnabled,
    setSpeechLang,
    setSystemPrompt,
    setTemperature,
    setWebSearchEnabled,
    setSearchApiKey,
  } = useSettings();
  const { conversations, deleteConversation } = useChat();
  const [showKey, setShowKey] = useState(false);
  const [modelPickerVisible, setModelPickerVisible] = useState(false);

  const handleProviderChange = (provider: Provider) => {
    const current = settings.baseUrl.trim();
    const defaults = [
      PROVIDER_CONFIG.zen.baseUrl,
      PROVIDER_CONFIG.groq.baseUrl,
      "",
    ];
    if (!current || defaults.includes(current)) {
      setBaseUrl(PROVIDER_CONFIG[provider].baseUrl);
    }
    setProvider(provider);
  };

  const modelList = settings.provider === "zen" ? MODELS : GROQ_MODELS;
  const modelSubtitle =
    settings.provider === "zen"
      ? "Ditenagai oleh OpenCode Zen"
      : "Model gratis di Groq free tier";
  const selectedModel =
    settings.provider === "zen" ? settings.model : settings.customModel;

  const clearAll = () => {
    Alert.alert(
      "Hapus semua percakapan?",
      "Semua riwayat akan dihapus permanen dari perangkat ini.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus Semua",
          style: "destructive",
          onPress: () => conversations.forEach((c) => deleteConversation(c.id)),
        },
      ],
    );
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
            Pengaturan
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Koneksi AI" colors={colors}>
          <View
            style={[
              styles.segmentWrap,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            {PROVIDERS.map((p) => {
              const active = settings.provider === p.key;
              return (
                <Pressable
                  key={p.key}
                  onPress={() => handleProviderChange(p.key)}
                  style={({ pressed }) => [
                    styles.segmentItem,
                    active && { backgroundColor: colors.accent },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: active ? colors.onAccent : colors.textSecondary,
                      },
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Field label="Base URL">
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                },
              ]}
            >
              <TextInput
                value={settings.baseUrl}
                onChangeText={setBaseUrl}
                placeholder={
                  ready ? PROVIDER_CONFIG[settings.provider].baseUrl : "Memuat…"
                }
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={[styles.apiInput, { color: colors.text }]}
              />
            </View>
          </Field>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Field label="API Key">
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                },
              ]}
            >
              <TextInput
                value={settings.apiKey}
                onChangeText={setApiKey}
                placeholder={ready ? "sk-…" : "Memuat…"}
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showKey}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.apiInput, { color: colors.text }]}
              />
              <Pressable onPress={() => setShowKey((v) => !v)} hitSlop={8}>
                <Ionicons
                  name={showKey ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          </Field>
        </Section>
        <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
          {settings.provider === "zen" ? (
            <>
              API key gratis dari{" "}
              <Text
                style={{ color: colors.accent }}
                onPress={() => Linking.openURL("https://opencode.ai/auth")}
              >
                opencode.ai/auth
              </Text>
              . Key disimpan hanya di perangkat Anda.
            </>
          ) : settings.provider === "groq" ? (
            <>
              Daftar gratis di{" "}
              <Text
                style={{ color: colors.accent }}
                onPress={() => Linking.openURL("https://console.groq.com/keys")}
              >
                console.groq.com
              </Text>{" "}
              (tanpa kartu kredit), lalu salin API key dari menu API Keys.
            </>
          ) : (
            "Masukkan endpoint OpenAI-compatible Anda sendiri (mis. Ollama lokal). Bisa kosongkan API key jika provider tidak membutuhkannya."
          )}
        </Text>
        {!settings.apiKey && settings.provider !== "custom" ? (
          <Text style={[styles.warning, { color: colors.danger }]}>
            Key belum diisi — chat tidak akan berfungsi.
          </Text>
        ) : null}

        <Section title="Model AI" colors={colors}>
          <Pressable
            onPress={() => setModelPickerVisible(true)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View
              style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}
            >
              <Ionicons name="sparkles" size={18} color={colors.accent} />
            </View>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {displayModelName(settings)}
              </Text>
              <Text
                style={[styles.rowSubtitle, { color: colors.textSecondary }]}
              >
                {modelList.find((m) => m.id === selectedModel)?.description}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
          {settings.provider !== "zen" ? (
            <>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
              <Field label="Model kustom">
                <View
                  style={[
                    styles.inputRow,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <TextInput
                    value={settings.customModel}
                    onChangeText={setCustomModel}
                    placeholder={ready ? DEFAULT_GROQ_MODEL : "Memuat…"}
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[styles.apiInput, { color: colors.text }]}
                  />
                </View>
              </Field>
            </>
          ) : null}
        </Section>
        <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
          {settings.provider !== "zen"
            ? "Ketik ID model apa pun, atau pilih dari daftar di atas."
            : "Pilih model yang ingin dipakai untuk percakapan."}
        </Text>

        <Section title="Persona & Suhu" colors={colors}>
          <Field label="System Prompt / Persona">
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                },
              ]}
            >
              <TextInput
                value={settings.systemPrompt}
                onChangeText={setSystemPrompt}
                placeholder="Contoh: Kamu adalah asisten yang ramah dan ringkas, selalu menjawab dalam Bahasa Indonesia."
                placeholderTextColor={colors.textMuted}
                multiline
                style={[
                  styles.apiInput,
                  styles.promptInput,
                  { color: colors.text },
                ]}
              />
            </View>
          </Field>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.row}>
            <View
              style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}
            >
              <Ionicons
                name="thermometer-outline"
                size={18}
                color={colors.accent}
              />
            </View>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Temperature
              </Text>
              <Text
                style={[styles.rowSubtitle, { color: colors.textSecondary }]}
              >
                Kreativitas respons: {settings.temperature.toFixed(1)} (0 =
                presisi, 1 = kreatif)
              </Text>
            </View>
          </View>
          <Slider
            minimumValue={0}
            maximumValue={1}
            step={0.1}
            value={settings.temperature}
            onValueChange={setTemperature}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={colors.backgroundSelected}
            thumbTintColor={colors.accent}
            style={styles.slider}
          />
        </Section>
        <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
          System prompt menentukan kepribadian dan gaya jawaban AI untuk semua
          percakapan. Kosongkan untuk memakai perilaku bawaan model.
        </Text>

        <Section title="Pencarian Web" colors={colors}>
          <View style={styles.row}>
            <View
              style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}
            >
              <Ionicons name="globe-outline" size={18} color={colors.accent} />
            </View>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Izinkan pencarian di web
              </Text>
              <Text
                style={[styles.rowSubtitle, { color: colors.textSecondary }]}
              >
                AI bisa mencari info terkini sebelum menjawab dan menampilkan
                daftar sumber
              </Text>
            </View>
            <Switch
              value={settings.webSearchEnabled}
              onValueChange={setWebSearchEnabled}
              trackColor={{
                false: colors.backgroundSelected,
                true: colors.accent,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
          {settings.webSearchEnabled && (
            <>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
              <Field label="API Key Pencarian (opsional)">
                <View
                  style={[
                    styles.inputRow,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <TextInput
                    value={settings.searchApiKey}
                    onChangeText={setSearchApiKey}
                    placeholder="tvly-… (opsional)"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[styles.apiInput, { color: colors.text }]}
                  />
                </View>
              </Field>
              <Text
                style={[styles.sectionHint, { color: colors.textSecondary }]}
              >
                Tanpa key memakai pencarian Exa (sama seperti OpenCode, gratis
                tapi dibatasi). Isi API key Tavily gratis dari{" "}
                <Text
                  style={{ color: colors.accent }}
                  onPress={() => Linking.openURL("https://tavily.com")}
                >
                  tavily.com
                </Text>{" "}
                untuk hasil yang lebih banyak.
              </Text>
            </>
          )}
        </Section>
        <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
          Saat aktif, AI dapat memutuskan sendiri untuk mencari di internet.
          Pencarian yang dijalankan sesuai keinginan model, bukan untuk setiap
          pertanyaan.
        </Text>

        <Section title="Suara" colors={colors}>
          <View style={styles.row}>
            <View
              style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}
            >
              <Ionicons
                name="volume-high-outline"
                size={18}
                color={colors.accent}
              />
            </View>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Baca jawaban (Text-to-Speech)
              </Text>
              <Text
                style={[styles.rowSubtitle, { color: colors.textSecondary }]}
              >
                Jawaban AI dibacakan dengan suara
              </Text>
            </View>
            <Switch
              value={settings.ttsEnabled}
              onValueChange={setTtsEnabled}
              trackColor={{
                false: colors.backgroundSelected,
                true: colors.accent,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Section>

        <Text style={[styles.subsectionLabel, { color: colors.textMuted }]}>
          BAHASA SUARA
        </Text>
        <Section colors={colors}>
          <View
            style={[
              styles.segmentWrap,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            {LANGS.map((lang) => {
              const active = settings.speechLang === lang.key;
              return (
                <Pressable
                  key={lang.key}
                  onPress={() => setSpeechLang(lang.key)}
                  style={({ pressed }) => [
                    styles.segmentItem,
                    active && { backgroundColor: colors.accent },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: active ? colors.onAccent : colors.textSecondary,
                      },
                    ]}
                  >
                    {lang.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Data" colors={colors}>
          <Pressable
            onPress={clearAll}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View
              style={[styles.rowIcon, { backgroundColor: colors.dangerSoft }]}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </View>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.danger }]}>
                Hapus semua percakapan
              </Text>
              <Text
                style={[styles.rowSubtitle, { color: colors.textSecondary }]}
              >
                {conversations.length} percakapan tersimpan
              </Text>
            </View>
          </Pressable>
        </Section>
      </ScrollView>

      <ModelPicker
        visible={modelPickerVisible}
        selected={selectedModel}
        models={modelList}
        subtitle={modelSubtitle}
        onClose={() => setModelPickerVisible(false)}
        onSelect={(id) => {
          if (settings.provider === "zen") {
            setModel(id);
          } else {
            setCustomModel(id);
          }
          setModelPickerVisible(false);
        }}
      />
    </View>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title?: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <View style={styles.section}>
      {title ? (
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          {title.toUpperCase()}
        </Text>
      ) : null}
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
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 19,
    marginHorizontal: Spacing.two,
    paddingLeft: 10,
    paddingBottom: 10,
  },
  warning: {
    fontSize: 12,
    marginHorizontal: Spacing.two,
    marginTop: -Spacing.one,
  },
  field: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    gap: Spacing.one,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: Spacing.two,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  apiInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Spacing.two + Spacing.one,
  },
  promptInput: {
    minHeight: 84,
    paddingVertical: Spacing.two + Spacing.one,
    textAlignVertical: "top",
  },
  slider: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    height: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  rowMain: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  rowSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  segmentWrap: {
    flexDirection: "row",
    margin: Spacing.three,
    borderRadius: Radius.md,
    padding: Spacing.one,
    gap: Spacing.one,
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.two + Spacing.one,
    borderRadius: Radius.sm,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
  },
  subsectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginLeft: Spacing.two,
    marginTop: Spacing.two,
  },

  pressed: {
    opacity: 0.7,
  },
});
