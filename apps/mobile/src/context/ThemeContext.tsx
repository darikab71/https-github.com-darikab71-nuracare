import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeMode, ActiveTheme, ThemeTokens, THEME_MAP, lightTheme, darkTheme } from '../constants/theme';
import { storage } from '../storage/mmkv';

const THEME_STORAGE_KEY = 'nuracare_theme_mode';

interface ThemeContextType {
  themeMode: ThemeMode;
  activeTheme: ActiveTheme;
  isDark: boolean;
  theme: ThemeTokens;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  activeTheme: 'light',
  isDark: false,
  theme: lightTheme,
  setThemeMode: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  
  // Read persisted theme mode or default to system
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = storage.getString(THEME_STORAGE_KEY);
      if (saved && ['light', 'dark', 'night', 'deep_night', 'system'].includes(saved)) {
        return saved as ThemeMode;
      }
    } catch (e) {}
    return 'system';
  });

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      storage.set(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Failed to persist theme mode:', e);
    }
  }, []);

  // Compute active theme from themeMode and system preference
  const activeTheme: ActiveTheme = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const isDark = activeTheme !== 'light';
  const theme = useMemo(() => THEME_MAP[activeTheme] || darkTheme, [activeTheme]);

  const toggleTheme = useCallback(() => {
    if (isDark) {
      setThemeMode('light');
    } else {
      setThemeMode('dark');
    }
  }, [isDark, setThemeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      activeTheme,
      isDark,
      theme,
      setThemeMode,
      toggleTheme,
    }),
    [themeMode, activeTheme, isDark, theme, setThemeMode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
