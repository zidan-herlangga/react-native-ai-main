import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";

type AttachmentMenuProps = {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onPickImages: () => void;
  onPickDocuments: () => void;
};

export function AttachmentMenu({
  visible,
  onClose,
  onTakePhoto,
  onPickImages,
  onPickDocuments,
}: AttachmentMenuProps) {
  const { colors } = useAppTheme();

  const rows = [
    { icon: "camera-outline" as const, label: "Kamera", onPress: onTakePhoto },
    { icon: "images-outline" as const, label: "Galeri", onPress: onPickImages },
    {
      icon: "folder-open-outline" as const,
      label: "Dokumen",
      onPress: onPickDocuments,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        testID="attachment-menu-backdrop"
      >
        <SafeAreaView
          style={[styles.sheet, { backgroundColor: colors.surface }]}
          edges={["bottom"]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.text }]}>
            Lampirkan file
          </Text>
          {rows.map((row) => (
            <Pressable
              key={row.label}
              onPress={() => {
                onClose();
                row.onPress();
              }}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: colors.surface },
                pressed && { backgroundColor: colors.backgroundElement },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: colors.accentSoft },
                ]}
              >
                <Ionicons name={row.icon} size={20} color={colors.accent} />
              </View>
              <Text style={[styles.rowText, { color: colors.text }]}>
                {row.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          ))}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.cancel,
              { backgroundColor: colors.backgroundElement },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
              Batal
            </Text>
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.two,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  cancel: {
    marginTop: Spacing.two,
    alignItems: "center",
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.6,
  },
});
