import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { saveOnboardingDone } from "@/lib/storage";

type Slide = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
};

const SLIDES: Slide[] = [
  {
    icon: "chatbubbles",
    title: "Selamat Datang di Kawan Model",
    description:
      "Asisten AI yang siap membantu kapan saja. Mulai percakapan alami dengan teknologi AI terkini.",
    color: "#00A3C4",
  },
  {
    icon: "sparkles",
    title: "Bebas Pilih Model",
    description:
      "Pilih dari berbagai model AI: OpenCode Zen, Groq, atau gunakan endpoint kustom Anda sendiri.",
    color: "#E76F3B",
  },
  {
    icon: "shield-checkmark",
    title: "Percakapan Pribadi",
    description:
      "Semua riwayat chat tersimpan lokal di perangkat Anda. Privasi data terjaga sepenuhnya.",
    color: "#0F2F57",
  },
];

export default function OnboardingScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await saveOnboardingDone();
    router.replace("/");
  };

  const handleSkip = () => {
    handleFinish();
  };

  const slide = SLIDES[currentSlide];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={["top"]} style={styles.safeTop}>
        <View style={styles.topRow}>
          <Pressable onPress={handleSkip} hitSlop={8}>
            <Text style={[styles.skipText, { color: colors.textMuted }]}>
              Lewati
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        <Animated.View
          key={currentSlide}
          entering={FadeInRight.duration(300)}
          style={styles.slideContent}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: slide.color + "12",
                borderColor: slide.color + "25",
              },
            ]}
          >
            <Ionicons name={slide.icon} size={56} color={slide.color} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {slide.title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {slide.description}
          </Text>
        </Animated.View>

        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === currentSlide ? slide.color : colors.backgroundSelected,
                  width: i === currentSlide ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <SafeAreaView edges={["bottom"]} style={styles.safeBottom}>
        <View style={styles.bottomRow}>
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.nextButton,
              { backgroundColor: slide.color },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.nextButtonText}>
              {currentSlide === SLIDES.length - 1 ? "Mulai" : "Selanjutnya"}
            </Text>
            <Ionicons
              name={
                currentSlide === SLIDES.length - 1 ? "rocket" : "arrow-forward"
              }
              size={18}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      </SafeAreaView>
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
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  slideContent: {
    alignItems: "center",
    gap: Spacing.four,
  },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 32,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 320,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  safeBottom: {
    backgroundColor: "transparent",
  },
  bottomRow: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.three + Spacing.one,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
