import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { MODELS } from "@/lib/models";
import type { ModelInfo } from "@/lib/types";

type ModelPickerProps = {
  visible: boolean;
  selected: string;
  models?: ModelInfo[];
  subtitle?: string;
  onClose: () => void;
  onSelect: (modelId: string) => void;
};

type FilterType = "all" | "free" | "paid";

type ModelGroup = {
  key: string;
  label: string;
  items: ModelInfo[];
};

export function ModelPicker({
  visible,
  selected,
  models = MODELS,
  subtitle = "Pilih model untuk percakapan ini",
  onClose,
  onSelect,
}: ModelPickerProps) {
  const { colors } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const filteredModels = useMemo(() => {
    return models.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (filterType === "free") return item.free;
      if (filterType === "paid") return !item.free;
      return true;
    });
  }, [models, searchQuery, filterType]);

  const groups: ModelGroup[] = useMemo(() => {
    return [
      {
        key: "free",
        label: "Gratis",
        items: filteredModels.filter((m) => m.free),
      },
      {
        key: "paid",
        label: "Berbayar",
        items: filteredModels.filter((m) => !m.free),
      },
    ].filter((group) => group.items.length > 0);
  }, [filteredModels]);

  const handleClose = () => {
    setSearchQuery("");
    setFilterType("all");
    onClose();
  };

  const handleSelect = (modelId: string) => {
    onSelect(modelId);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      onShow={Keyboard.dismiss}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <SafeAreaView
        style={[styles.sheet, { backgroundColor: colors.surface }]}
        edges={["top", "bottom"]}
      >
        {/* Grabber Bar */}
        <View style={styles.grabber}>
          <View
            style={[styles.grabberBar, { backgroundColor: colors.border }]}
          />
        </View>

        {/* Header Modal */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
            >
              Pilih Model AI
            </Text>
            <Text
              style={[styles.subtitle, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          </View>
          <Pressable
            onPress={handleClose}
            hitSlop={8}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: colors.backgroundElement },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Search Bar Input */}
        {models.length > 3 && (
          <View style={styles.searchContainer}>
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
                style={styles.searchIcon}
              />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Cari model atau provider..."
                placeholderTextColor={colors.textMuted}
                style={[styles.searchInput, { color: colors.text }]}
                clearButtonMode="while-editing"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")} hitSlop={6}>
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={colors.textSecondary}
                  />
                </Pressable>
              )}
            </View>

            {/* Filter Chips */}
            <View style={styles.filterChipsRow}>
              {(
                [
                  { id: "all", label: "Semua" },
                  { id: "free", label: "Gratis" },
                  { id: "paid", label: "Berbayar" },
                ] as const
              ).map((chip) => {
                const isActive = filterType === chip.id;
                return (
                  <Pressable
                    key={chip.id}
                    onPress={() => setFilterType(chip.id)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isActive
                          ? colors.accentSoft
                          : colors.backgroundElement,
                        borderColor: isActive
                          ? colors.accentBorder
                          : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: isActive
                            ? colors.accentText
                            : colors.textSecondary,
                        },
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* List of Models */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        >
          {groups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="cube-outline"
                size={42}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {models.length === 0
                  ? "Tidak Ada Daftar Model"
                  : "Model Tidak Ditemukan"}
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}
              >
                {models.length === 0
                  ? "Provider ini menggunakan konfigurasi custom. Masukkan model ID secara manual di Pengaturan."
                  : `Tidak ada hasil yang cocok dengan kata kunci "${searchQuery}".`}
              </Text>
            </View>
          ) : (
            groups.map((group) => (
              <View key={group.key} style={styles.group}>
                <View style={styles.groupHeader}>
                  <Text
                    style={[styles.groupLabel, { color: colors.textSecondary }]}
                  >
                    {group.label}
                  </Text>
                  <Text
                    style={[styles.groupCount, { color: colors.textMuted }]}
                  >
                    {group.items.length}
                  </Text>
                </View>

                {group.items.map((model) => {
                  const isSelected = model.id === selected;
                  return (
                    <Pressable
                      key={model.id}
                      onPress={() => handleSelect(model.id)}
                      style={({ pressed }) => [
                        styles.item,
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
                      <View style={styles.itemMain}>
                        <View style={styles.itemTitleRow}>
                          <Text
                            style={[styles.itemName, { color: colors.text }]}
                            numberOfLines={1}
                          >
                            {model.name}
                          </Text>
                          <View
                            style={[
                              styles.badge,
                              {
                                backgroundColor: model.free
                                  ? colors.accentSoft
                                  : colors.backgroundSelected,
                                borderColor: model.free
                                  ? colors.accentBorder
                                  : colors.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeText,
                                {
                                  color: model.free
                                    ? colors.accentText
                                    : colors.textSecondary,
                                },
                              ]}
                            >
                              {model.free ? "GRATIS" : "BERBAYAR"}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.itemDesc,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={2}
                        >
                          {model.description}
                        </Text>
                      </View>
                      {isSelected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color={colors.accent}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  headerText: {
    flex: 1,
    flexShrink: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    height: 40,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterChipsRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
  group: {
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.one,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  groupCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  itemMain: {
    flex: 1,
    gap: Spacing.one,
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    flexShrink: 1,
  },
  badge: {
    flexShrink: 0,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  itemDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.four * 2,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.7,
  },
});
