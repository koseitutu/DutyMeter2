import React, { createContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { LightColors, DarkColors, ThemeColors } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextValue>({
  colors: LightColors as ThemeColors,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useAppStore((s) => s.settings.darkMode);
  const systemScheme = useColorScheme();

  const { colors, isDark } = useMemo(() => {
    let resolvedDark = false;
    if (darkMode === 'dark') {
      resolvedDark = true;
    } else if (darkMode === 'system') {
      resolvedDark = systemScheme === 'dark';
    }
    return {
      colors: (resolvedDark ? DarkColors : LightColors) as ThemeColors,
      isDark: resolvedDark,
    };
  }, [darkMode, systemScheme]);

  return (
    <ThemeContext value={{ colors, isDark }}>
      {children}
    </ThemeContext>
  );
}

export function useTheme() {
  return React.use(ThemeContext);
}
