import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  Linking,
  Modal,
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
import {
  PROVIDERS_CONFIG,
  displayModelName,
  effectiveModel,
  modelsForProvider
} from "@/lib/models";
import type { Provider, ProviderCategory, ProviderDetail, ThemeMode } from "@/lib/types";

const HEADER_PADDING_V = Spacing.two + Spacing.one;

const LANGS = [
  { key: "id-ID", label: "Indonesia" },
  { key: "en-US", label: "English" },
  { key: "en-GB", label: "English (UK)" },
];

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: React.ComponentProps<typeof Ionicons>["name"] }[] = [
  { key: "system", label: "Sistem", icon: "phone-portrait-outline" },
  { key: "light", label: "Terang", icon: "sunny-outline" },
  { key: "dark", label: "Gelap", icon: "moon-outline" },
];

const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  zen: "OpenCode Zen",
  commercial: "Penyedia Komersial Terkemuka",
  alternative: "Model Alternatif & Berkembang",
  infrastructure: "Infrastruktur & Router",
  custom: "Kustom / Self-Hosted",
};

const PROVIDER_HELP_INFO: Record<
  Provider,
  { label: string; url?: string; hint: string }
> = {
  zen: {
    label: "opencode.ai/auth",
    url: "https://opencode.ai/auth",
    hint: "API key gratis dari OpenCode Zen. Key disimpan aman di perangkat Anda.",
  },
  openai: {
    label: "platform.openai.com",
    url: "https://platform.openai.com/api-keys",
    hint: "Dapatkan API Key dari dashboard OpenAI Platform.",
  },
  anthropic: {
    label: "console.anthropic.com",
    url: "https://console.anthropic.com/settings/keys",
    hint: "Dapatkan API Key Claude dari Anthropic Console.",
  },
  google: {
    label: "aistudio.google.com",
    url: "https://aistudio.google.com/app/apikey",
    hint: "Dapatkan API Key Gemini gratis dari Google AI Studio.",
  },
  deepseek: {
    label: "platform.deepseek.com",
    url: "https://platform.deepseek.com/api_keys",
    hint: "Dapatkan API Key DeepSeek dengan tarif token sangat hemat.",
  },
  kimi: {
    label: "platform.moonshot.cn",
    url: "https://platform.moonshot.cn/console/api-keys",
    hint: "Dapatkan API Key dari konsol Moonshot Kimi.",
  },
  minimax: {
    label: "api.minimax.chat",
    url: "https://api.minimax.chat",
    hint: "Dapatkan API Key dari platform developer MiniMax.",
  },
  glm: {
    label: "open.bigmodel.cn",
    url: "https://open.bigmodel.cn/usercenter/apikeys",
    hint: "Dapatkan API Key Zhipu AI untuk model GLM.",
  },
  groq: {
    label: "console.groq.com",
    url: "https://console.groq.com/keys",
    hint: "Daftar gratis di Groq Console untuk inference LPU berkecepatan tinggi.",
  },
  openrouter: {
    label: "openrouter.ai",
    url: "https://openrouter.ai/keys",
    hint: "Akses agregator ratusan model AI open-source dan komersial.",
  },
  cerebras: {
    label: "cloud.cerebras.ai",
    url: "https://cloud.cerebras.ai",
    hint: "Inference ultra-cepat dengan arsitektur chip Wafer-Scale.",
  },
  fireworks: {
    label: "fireworks.ai",
    url: "https://fireworks.ai/api-keys",
    hint: "Platform inference teroptimasi untuk open-weights.",
  },
  deepinfra: {
    label: "deepinfra.com",
    url: "https://deepinfra.com/dash/api_keys",
    hint: "Inference pay-as-you-go hemat biaya per juta token.",
  },
  baseten: {
    label: "baseten.co",
    url: "https://baseten.co",
    hint: "Bridge dedicated inference untuk tingkat enterprise.",
  },
  "302ai": {
    label: "302.ai",
    url: "https://302.ai",
    hint: "Agregator multi-model pay-as-you-go tanpa sistem langganan bulanan.",
  },
  custom: {
    label: "Local / OpenAI Proxy",
    hint: "Gunakan endpoint OpenAI-compatible Anda sendiri (mis. Ollama di http://localhost:11434/v1).",
  },
};

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
    setToolsEnabled,
    setNotificationSound,
    setThemeMode,
  } = useSettings();

  const { conversations, deleteConversation } = useChat();
  const [showKey, setShowKey] = useState(false);
  const [modelPickerVisible, setModelPickerVisible] = useState(false);
  const [providerPickerVisible, setProviderPickerVisible] = useState(false);

  const currentProviderConfig =
    PROVIDERS_CONFIG[settings.provider] ?? PROVIDERS_CONFIG.zen;

  const handleProviderChange = (newProvider: Provider) => {
    const nextConfig = PROVIDERS_CONFIG[newProvider];
    if (nextConfig) {
      setBaseUrl(nextConfig.baseUrl);
      setModel(nextConfig.defaultModel);
    }
    setProvider(newProvider);
    setProviderPickerVisible(false);
  };

  const availableModels = useMemo(() => {
    return modelsForProvider(settings.provider);
  }, [settings.provider]);

  const activeModelId = effectiveModel(settings);
  const activeModelInfo = availableModels.find((m) => m.id === activeModelId);

  const providerHelp =
    PROVIDER_HELP_INFO[settings.provider] ?? PROVIDER_HELP_INFO.zen;

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
        {/* ================================================================= */}
        {/* 1. KONEKSI & PROVIDER AI */}
        {/* ================================================================= */}
        <Section title="Penyedia Layanan (Provider)" colors={colors}>
          <Pressable
            onPress={() => setProviderPickerVisible(true)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View
              style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}
            >
              <Ionicons name="hardware-chip" size={16} color={colors.accent} />
            </View>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {currentProviderConfig.name}
              </Text>
              <Text
                style={[styles.rowSubtitle, { color: colors.textSecondary }]}
              >
                {CATEGORY_LABELS[currentProviderConfig.category]}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textMuted}
            />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Field label="Base URL / Endpoint">
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
                  ready
                    ? currentProviderConfig.baseUrl || "https://..."
                    : "Memuat…"
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

          <Field
            label={
              settings.provider === "anthropic"
                ? "Anthropic API Key (x-api-key)"
                : "API Key (Bearer Token)"
            }
          >
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
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          </Field>
        </Section>

        <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
          {providerHelp.hint}{" "}
          {providerHelp.url && (
            <>
              Dapatkan di:{" "}
              <Text
                style={{ color: colors.accent, fontWeight: "600" }}
                onPress={() => Linking.openURL(providerHelp.url!)}
              >
                {providerHelp.label}
              </Text>
            </>
          )}
        </Text>

        {!settings.apiKey && settings.provider !== "custom" && (
          <Text style={[styles.warning, { color: colors.danger }]}>
            API key belum diisi — request ke AI tidak akan berfungsi.
          </Text>
        )}

        {/* ================================================================= */}
        {/* 2. PEMILIHAN MODEL AI */}
        {/* ================================================================= */}
        <Section title="Model AI Aktif" colors={colors}>
          <Pressable
            onPress={() => setModelPickerVisible(true)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View
              style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}
            >
              <Ionicons name="sparkles" size={16} color={colors.accent} />
            </View>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {displayModelName(settings)}
              </Text>
              <Text
                style={[styles.rowSubtitle, { color: colors.textSecondary }]}
              >
                {activeModelInfo?.description ||
                  `Model ID: ${effectiveModel(settings)}`}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textMuted}
            />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Field label="Custom Model ID (Override)">
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
                placeholder="Kosongkan jika memilih dari daftar di atas"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.apiInput, { color: colors.text }]}
              />
            </View>
          </Field>
        </Section>

        <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
          Pilih model yang telah diuji dari daftar di atas, atau masukkan ID
          model khusus secara manual pada kolom override.
        </Text>

        {/* ================================================================= */}
        {/* 3. PERSONA & TEMPERATURE */}
        {/* ================================================================= */}
        <Section title="Persona & Parameter" colors={colors}>
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
                placeholder="Contoh: Anda adalah asisten profesional yang ramah..."
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
                size={16}
                color={colors.accent}
              />
            </View>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Temperature: {settings.temperature.toFixed(1)}
              </Text>
              <Text
                style={[styles.rowSubtitle, { color: colors.textSecondary }]}
              >
                Kreativitas vs Presisi (0.0 = kaku/faktual, 1.0 = imajinatif)
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

        {/* ================================================================= */}
        {/* 4. PENCARIAN WEB */}
        {/* ================================================================= */}
        <Section title="Pencarian Web (Search Grounding)" colors={colors}>
          <View style={styles.row}>
            <View
              style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}
            >
              <Ionicons name="globe-outline" size={16} color={colors.accent} />
            </View>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Aktifkan Pencarian Web
              </Text>
              <Text
                style={[styles.rowSubtitle, { color: colors.textSecondary }]}
              >
                AI dapat menelusuri data internet terbaru sebelum menjawab
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
              <Field label="Tavily API Key (Opsional)">
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
                Jika dikosongkan, aplikasi menggunakan pencarian bawaan Exa.
                Dapatkan API Key gratis di{" "}
                <Text
                  style={{ color: colors.accent }}
                  onPress={() => Linking.openURL("https://tavily.com")}
                >
                  tavily.com
                </Text>
                .
              </Text>
            </>
          )}
        </Section>

        {/* ================================================================= */}
        {/* 4b. TOOLS (Kalkulator, Code Runner, Konversi) */}
        {/* ================================================================= */}
        <Section title="Tools AI (Kalkulator, Code, Konversi)" colors={colors}>
          <View style={styles.row}>
            <View
              style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}
            >
              <Ionicons name="construct-outline" size={16} color={colors.accent} />
            </View>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Aktifkan Tools AI
              </Text>
              <Text
                style={[styles.rowSubtitle, { color: colors.textSecondary }]}
              >
                Kalkulator, eksekusi kode, dan konversi satuan — tanpa perlu pencarian web
              </Text>
            </View>
            <Switch
              value={settings.toolsEnabled}
              onValueChange={setToolsEnabled}
              trackColor={{
                false: colors.backgroundSelected,
                true: colors.accent,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
          {settings.toolsEnabled && (
            <>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
              <Text
                style={[styles.sectionHint, { color: colors.textSecondary }]}
              >
                Model akan otomatis menggunakan tools saat dibutuhkan. Contoh: {"Berapa 2+2?"} → kalkulator, {"Jalankan Python..."} → code runner, {"100 km berapa miles?"} → konversi satuan.
              </Text>
            </>
          )}
        </Section>

        {/* ================================================================= */}
        {/* 5. SUARA & AKSESIBILITAS */}
        {/* ================================================================= */}
        <Section title="Suara & Haptik" colors={colors}>
          <View style={styles.row}>
            <View
              style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}
            >
              <Ionicons
                name="volume-high-outline"
                size={16}
                color={colors.accent}
              />
            </View>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Text-to-Speech (TTS)
              </Text>
              <Text
                style={[styles.rowSubtitle, { color: colors.textSecondary }]}
              >
                Membacakan balasan teks AI dengan suara
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
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.row}>
            <View
              style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}
            >
              <Ionicons
                name="notifications-outline"
                size={16}
                color={colors.accent}
              />
            </View>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Getaran Haptik
              </Text>
              <Text
                style={[styles.rowSubtitle, { color: colors.textSecondary }]}
              >
                Memberikan efek getar saat respons selesai digenerate
              </Text>
            </View>
            <Switch
              value={settings.notificationSound}
              onValueChange={setNotificationSound}
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

        {/* ================================================================= */}
        {/* 5b. TAMPILAN */}
        {/* ================================================================= */}
        <Text style={[styles.subsectionLabel, { color: colors.textMuted }]}>
          TAMPILAN
        </Text>
        <Section colors={colors}>
          <View style={styles.row}>
            <View
              style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}
            >
              <Ionicons
                name="color-palette-outline"
                size={16}
                color={colors.accent}
              />
            </View>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Mode Tema
              </Text>
              <Text
                style={[styles.rowSubtitle, { color: colors.textSecondary }]}
              >
                Pilih tampilan terang, gelap, atau ikuti sistem
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.segmentWrap,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            {THEME_OPTIONS.map((opt) => {
              const active = settings.themeMode === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setThemeMode(opt.key)}
                  style={({ pressed }) => [
                    styles.segmentItem,
                    active && { backgroundColor: colors.accent },
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={opt.icon}
                    size={14}
                    color={active ? colors.onAccent : colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: active ? colors.onAccent : colors.textSecondary,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* ================================================================= */}
        {/* 6. PENGELOLAAN DATA */}
        {/* ================================================================= */}
        <Section title="Data & Privasi" colors={colors}>
          <Pressable
            onPress={clearAll}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View
              style={[styles.rowIcon, { backgroundColor: colors.dangerSoft }]}
            >
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
            </View>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.danger }]}>
                Hapus Semua Percakapan
              </Text>
              <Text
                style={[styles.rowSubtitle, { color: colors.textSecondary }]}
              >
                {conversations.length} sesi obrolan tersimpan di memori lokal
              </Text>
            </View>
          </Pressable>
        </Section>
      </ScrollView>

      {/* =================================================================== */}
      {/* MODAL PILIH MODEL */}
      {/* =================================================================== */}
      <ModelPicker
        visible={modelPickerVisible}
        selected={activeModelId}
        models={availableModels}
        subtitle={`Daftar model untuk ${currentProviderConfig.name}`}
        onClose={() => setModelPickerVisible(false)}
        onSelect={(id) => {
          setModel(id);
          setCustomModel(""); // reset custom model saat memilih dari picker
          setModelPickerVisible(false);
        }}
      />

      {/* =================================================================== */}
      {/* MODAL PILIH PROVIDER */}
      {/* =================================================================== */}
      <ProviderPickerModal
        visible={providerPickerVisible}
        selected={settings.provider}
        onClose={() => setProviderPickerVisible(false)}
        onSelect={handleProviderChange}
      />
    </View>
  );
}

// ============================================================================
// KOMPONEN PROVIDER PICKER MODAL
// ============================================================================

function ProviderPickerModal({
  visible,
  selected,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selected: Provider;
  onClose: () => void;
  onSelect: (provider: Provider) => void;
}) {
  const { colors } = useAppTheme();
  const [search, setSearch] = useState("");

  const categories: ProviderCategory[] = [
    "zen",
    "commercial",
    "alternative",
    "infrastructure",
    "custom",
  ];

  const filteredProviders = useMemo(() => {
    const query = search.toLowerCase();
    const result: Record<ProviderCategory, ProviderDetail[]> = {
      zen: [],
      commercial: [],
      alternative: [],
      infrastructure: [],
      custom: [],
    };

    Object.values(PROVIDERS_CONFIG).forEach((item) => {
      const match =
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query);
      if (match) {
        result[item.category].push(item);
      }
    });

    return result;
  }, [search]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={Keyboard.dismiss}
      statusBarTranslucent
    >
      <SafeAreaView
        style={[styles.sheet, { backgroundColor: colors.surface }]}
        edges={["top", "bottom"]}
      >
        <View style={styles.grabber}>
          <View
            style={[styles.grabberBar, { backgroundColor: colors.border }]}
          />
        </View>

        <View style={styles.headerModal}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.titleModal, { color: colors.text }]}>
              Pilih Provider AI
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              Pilih platform inferensi atau gateway AI
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            style={[
              styles.closeBtn,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={16}
              color={colors.textSecondary}
              style={{ marginRight: Spacing.two }}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Cari provider (OpenAI, Groq, Cerebras...)"
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
              clearButtonMode="while-editing"
              autoCapitalize="none"
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listModal}
        >
          {categories.map((cat) => {
            const list = filteredProviders[cat];
            if (list.length === 0) return null;
            return (
              <View key={cat} style={styles.groupModal}>
                <Text
                  style={[
                    styles.groupLabelModal,
                    { color: colors.textSecondary },
                  ]}
                >
                  {CATEGORY_LABELS[cat]}
                </Text>
                {list.map((item) => {
                  const isSelected = item.id === selected;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => onSelect(item.id)}
                      style={({ pressed }) => [
                        styles.providerItem,
                        {
                          backgroundColor: isSelected
                            ? colors.accentSoft
                            : colors.backgroundElement,
                          borderColor: isSelected
                            ? colors.accentBorder
                            : colors.border,
                        },
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text
                          style={[styles.providerName, { color: colors.text }]}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.textSecondary,
                          }}
                          numberOfLines={1}
                        >
                          {item.baseUrl || "Endpoint kustom"}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color={colors.accent}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ============================================================================
// HELPER UI COMPONENTS
// ============================================================================

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

// ============================================================================
// STYLES
// ============================================================================

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
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  sectionHint: {
    fontSize: 12,
    lineHeight: 18,
    marginHorizontal: Spacing.one,
    paddingLeft: Spacing.one + Spacing.two,
    paddingBottom: Spacing.one + Spacing.two,
  },
  warning: {
    fontSize: 12,
    marginHorizontal: Spacing.one,
    marginTop: -Spacing.two,
    paddingLeft: Spacing.one + Spacing.two,
  },
  field: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    gap: Spacing.one,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: Spacing.one,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  apiInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: Spacing.two + Spacing.one,
  },
  promptInput: {
    minHeight: 80,
    paddingVertical: Spacing.two + Spacing.one,
    textAlignVertical: "top",
  },
  slider: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    height: 36,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    gap: Spacing.three,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  rowMain: {
    flex: 1,
    gap: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  rowSubtitle: {
    fontSize: 12,
    lineHeight: 16,
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
    fontSize: 13,
    fontWeight: "600",
  },
  subsectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginLeft: Spacing.one,
    marginTop: Spacing.two,
  },
  pressed: {
    opacity: 0.6,
  },
  sheet: {
    flex: 1,
  },
  grabber: {
    alignItems: "center",
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  grabberBar: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
  },
  headerModal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  titleModal: {
    fontSize: 19,
    fontWeight: "700",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  listModal: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
  groupModal: {
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  groupLabelModal: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.one,
  },
  providerItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
  },
  providerName: {
    fontSize: 15,
    fontWeight: "600",
  },
});
