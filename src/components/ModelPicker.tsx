import { Ionicons } from "@expo/vector-icons";
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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

  const groups: ModelGroup[] = [
    { key: "free", label: "Gratis", items: models.filter((m) => m.free) },
    {
      key: "paid",
      label: "Berbayar",
      items: models.filter((m) => !m.free),
    },
  ].filter((group) => group.items.length > 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={Keyboard.dismiss}
      statusBarTranslucent
      navigationBarTranslucent
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
            onPress={onClose}
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        >
          {groups.map((group) => (
            <View key={group.key} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text
                  style={[styles.groupLabel, { color: colors.textSecondary }]}
                >
                  {group.label}
                </Text>
                <Text style={[styles.groupCount, { color: colors.textMuted }]}>
                  {group.items.length}
                </Text>
              </View>
              {group.items.map((model) => {
                const isSelected = model.id === selected;
                return (
                  <Pressable
                    key={model.id}
                    onPress={() => onSelect(model.id)}
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
          ))}
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
  pressed: {
    opacity: 0.7,
  },
});
