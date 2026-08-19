import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '@/context/ThemeContext';

function Dot({ delay }: { delay: number }) {
  const { colors } = useAppTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }), -1, false),
    );
    return () => cancelAnimation(progress);
  }, [progress, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + progress.value * 0.75,
    transform: [{ translateY: -progress.value * 5 }],
  }));

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: colors.accent }, animatedStyle]}
    />
  );
}

export function TypingIndicator() {
  return (
    <Animated.View style={styles.row} accessibilityLabel="Kawan Model sedang mengetik">
      <Dot delay={0} />
      <Dot delay={200} />
      <Dot delay={400} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
