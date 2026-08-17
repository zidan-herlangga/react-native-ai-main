import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    background: '#F8FAFC',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
    surface: '#FFFFFF',
    surfaceBorder: '#E2E8F0',
    border: '#E2E8F0',
    accent: '#2563EB',
    accentBright: '#3B82F6',
    accentText: '#1D4ED8',
    accentSoft: '#DBEAFE',
    accentBorder: '#93C5FD',
    onAccent: '#FFFFFF',
    userBubble: '#DBEAFE',
    userBubbleText: '#0F172A',
    assistantBubble: '#FFFFFF',
    assistantBubbleBorder: '#E2E8F0',
    inputBg: '#F1F5F9',
    danger: '#DC2626',
    dangerSoft: '#FEE2E2',
    overlay: 'rgba(15, 23, 42, 0.5)',
    violet: '#7C3AED',
    cyan: '#06B6D4',
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    background: '#0F172A',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    surface: '#1E293B',
    surfaceBorder: '#334155',
    border: '#334155',
    accent: '#60A5FA',
    accentBright: '#93C5FD',
    accentText: '#93C5FD',
    accentSoft: '#1E3A8A',
    accentBorder: '#3B82F6',
    onAccent: '#0F172A',
    userBubble: '#1D4ED8',
    userBubbleText: '#EFF6FF',
    assistantBubble: '#1E293B',
    assistantBubbleBorder: '#334155',
    inputBg: '#1E293B',
    danger: '#F87171',
    dangerSoft: 'rgba(248, 113, 113, 0.15)',
    overlay: 'rgba(2, 6, 23, 0.6)',
    violet: '#A78BFA',
    cyan: '#22D3EE',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
