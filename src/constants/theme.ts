import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F2F57',
    textSecondary: '#4A4A4A',
    textMuted: '#8896A7',
    background: '#F7F9FC',
    backgroundElement: '#EFF3F8',
    backgroundSelected: '#DDE6EF',
    surface: '#FFFFFF',
    surfaceBorder: '#D5DFE9',
    border: '#DDE6EF',
    accent: '#00A3C4',
    accentBright: '#00B4D8',
    accentText: '#008DAB',
    accentSoft: '#E5F7FB',
    accentBorder: '#99DDE9',
    onAccent: '#FFFFFF',
    userBubble: '#E5F7FB',
    userBubbleText: '#0F2F57',
    assistantBubble: '#FFFFFF',
    assistantBubbleBorder: '#DDE6EF',
    inputBg: '#EFF3F8',
    danger: '#E76F3B',
    dangerSoft: '#FFF0E8',
    overlay: 'rgba(15, 47, 87, 0.45)',
    orange: '#E76F3B',
    orangeSoft: '#FFF0E8',
    cyan: '#00A3C4',
    cyanSoft: '#E5F7FB',
    navy: '#0F2F57',
    navySoft: '#E8EDF5',
  },
  dark: {
    text: '#EEF2F7',
    textSecondary: '#A8B5C5',
    textMuted: '#5D6E82',
    background: '#0A1628',
    backgroundElement: '#111E33',
    backgroundSelected: '#1A2940',
    surface: '#121F35',
    surfaceBorder: '#1C2E48',
    border: '#1C2E48',
    accent: '#00B4D8',
    accentBright: '#22D3EE',
    accentText: '#22D3EE',
    accentSoft: '#0A2A42',
    accentBorder: '#00A3C4',
    onAccent: '#FFFFFF',
    userBubble: '#0D3B5E',
    userBubbleText: '#E5F7FB',
    assistantBubble: '#121F35',
    assistantBubbleBorder: '#1C2E48',
    inputBg: '#111E33',
    danger: '#F37A3D',
    dangerSoft: 'rgba(243, 122, 61, 0.12)',
    overlay: 'rgba(5, 12, 24, 0.65)',
    orange: '#F37A3D',
    orangeSoft: 'rgba(243, 122, 61, 0.12)',
    cyan: '#22D3EE',
    cyanSoft: 'rgba(34, 211, 238, 0.1)',
    navy: '#EEF2F7',
    navySoft: 'rgba(238, 242, 247, 0.08)',
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
