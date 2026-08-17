import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export type AppTheme = {
  scheme: 'light' | 'dark';
  colors: { [K in keyof (typeof Colors)['light']]: string };
};

const ThemeContext = createContext<AppTheme>({ scheme: 'light', colors: Colors.light });

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const rawScheme = useColorScheme();
  const scheme: 'light' | 'dark' = rawScheme === 'dark' ? 'dark' : 'light';
  const value = useMemo<AppTheme>(
    () => ({ scheme, colors: Colors[scheme] }),
    [scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  return useContext(ThemeContext);
}
