/**
 * NuraCare Unified Design System Tokens
 * Canonical source of truth for colors, typography, spacing, radius, shadows, and status cues
 * shared across Mobile (React Native) and Web (React / CSS-in-JS).
 */

export const NuraTokens = {
  colors: {
    brand: {
      primary: '#16a34a',       // Emerald 600
      primaryDark: '#15803d',   // Emerald 700
      primaryDeep: '#14532d',   // Emerald 900
      primaryLight: '#dcfce7',  // Emerald 100
      primaryGlow: 'rgba(22, 163, 74, 0.15)',
      leafAccent: '#10b981',
    },
    neutral: {
      black: '#0a0f0d',
      dark: '#111827',
      gray800: '#1f2937',
      gray700: '#374151',
      gray600: '#4b5563',
      gray500: '#6b7280',
      gray400: '#9ca3af',
      gray300: '#d1d5db',
      gray200: '#e5e7eb',
      gray100: '#f3f4f6',
      gray50: '#f9fafb',
      white: '#ffffff',
    },
    surface: {
      lightBg: '#f8fafc',
      lightCard: '#ffffff',
      darkBg: '#0b130e',
      darkCard: '#131e17',
      darkElevated: '#1a2920',
      borderLight: '#e2e8f0',
      borderDark: '#23382b',
    },
    urgency: {
      low: '#16a34a',
      mid: '#f59e0b',
      high: '#dc2626',
    },
    categories: {
      nutrition: '#16a34a',
      fitness: '#0284c7',
      sleep: '#6366f1',
      habits: '#f59e0b',
      mental: '#ec4899',
      digital: '#8b5cf6',
      hydration: '#06b6d4',
    },
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
  },
  elevation: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    hover: {
      shadowColor: '#16a34a',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 4,
    },
    modal: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 32,
      elevation: 10,
    },
  },
  typography: {
    fontFamilies: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      serif: 'Georgia, Cambria, serif',
    },
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      display: 32,
    },
  },
  breakpoints: {
    mobile: 640,
    tablet: 1024,
    desktop: 1280,
  },
} as const;

export type NuraTokensType = typeof NuraTokens;
