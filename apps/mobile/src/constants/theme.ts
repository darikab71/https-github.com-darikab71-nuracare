/**
 * NuraCare Semantic Theme Tokens
 * Professional Dark Mode / Night Vision Design System
 */

export type ThemeMode = 'light' | 'dark' | 'night' | 'deep_night' | 'system';
export type ActiveTheme = 'light' | 'dark' | 'night' | 'deep_night';

export interface ThemeTokens {
  background: string;       // LEVEL 0: App Canvas Background
  surface: string;          // LEVEL 1: Primary Cards & Base Containers
  surfaceElevated: string;  // LEVEL 2: Elevated Cards, Inputs, Sheets
  surfaceModal: string;     // LEVEL 3: Modals, Popups, High Z-Index Panels
  
  border: string;           // Standard structural border
  borderSubtle: string;     // Soft hairline border
  borderElevated: string;   // Elevated element border
  
  textPrimary: string;      // High-contrast primary headings and metrics
  textSecondary: string;    // Subtitles, metadata, body
  textTertiary: string;     // Captions, subtle hints, timestamps
  textDisabled: string;     // Inactive or disabled items
  
  accent: string;           // Primary NuraCare Green
  accentSecondary: string;  // Deep or secondary interactive green
  accentSoft: string;       // Pastel / luminous soft green highlight
  accentDeep: string;       // Dark green container / card fill
  accentGlow: string;       // Subtle ambient glow / aura color
  
  success: string;
  successBackground: string;
  warning: string;
  warningBackground: string;
  attention: string;
  attentionBackground: string;
  error: string;
  errorBackground: string;
  info: string;
  infoBackground: string;
  
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  placeholderText: string;
  
  userBubble: string;
  userBubbleText: string;
  aiBubble: string;
  aiBubbleBorder: string;
  aiBubbleText: string;
  
  navBackground: string;
  navBorder: string;
  navActive: string;
  navInactive: string;
  navActiveBackground: string;
  
  shadowColor: string;
  shadowOpacity: number;
}

export const lightTheme: ThemeTokens = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceElevated: '#f1f5f9',
  surfaceModal: '#ffffff',
  
  border: '#e2e8f0',
  borderSubtle: 'rgba(0, 0, 0, 0.04)',
  borderElevated: '#cbd5e1',
  
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textTertiary: '#64748b',
  textDisabled: '#94a3b8',
  
  accent: '#16a34a',
  accentSecondary: '#15803d',
  accentSoft: '#bbf7d0',
  accentDeep: '#dcfce7',
  accentGlow: 'rgba(22, 163, 74, 0.12)',
  
  success: '#16a34a',
  successBackground: '#dcfce7',
  warning: '#f59e0b',
  warningBackground: '#fef3c7',
  attention: '#ea580c',
  attentionBackground: '#ffedd5',
  error: '#ef4444',
  errorBackground: '#fee2e2',
  info: '#0ea5e9',
  infoBackground: '#e0f2fe',
  
  inputBackground: '#f1f5f9',
  inputBorder: '#e2e8f0',
  inputText: '#0f172a',
  placeholderText: '#94a3b8',
  
  userBubble: '#16a34a',
  userBubbleText: '#ffffff',
  aiBubble: '#ffffff',
  aiBubbleBorder: '#e2e8f0',
  aiBubbleText: '#0f172a',
  
  navBackground: '#ffffff',
  navBorder: '#e2e8f0',
  navActive: '#16a34a',
  navInactive: '#64748b',
  navActiveBackground: '#f0fdf4',
  
  shadowColor: '#000000',
  shadowOpacity: 0.04,
};

export const darkTheme: ThemeTokens = {
  background: '#0B100F',       // LEVEL 0
  surface: '#111817',          // LEVEL 1
  surfaceElevated: '#17201E',  // LEVEL 2
  surfaceModal: '#1D2825',     // LEVEL 3
  
  border: '#26332F',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderElevated: 'rgba(255, 255, 255, 0.09)',
  
  textPrimary: '#F3F7F5',
  textSecondary: '#B8C4BF',
  textTertiary: '#7E8C86',
  textDisabled: '#59645F',
  
  accent: '#54C878',
  accentSecondary: '#3DAE63',
  accentSoft: '#8BE3A3',
  accentDeep: '#173D29',
  accentGlow: 'rgba(84, 200, 120, 0.16)',
  
  success: '#54C878',
  successBackground: 'rgba(84, 200, 120, 0.12)',
  warning: '#F59E0B',
  warningBackground: 'rgba(245, 158, 11, 0.12)',
  attention: '#FB923C',
  attentionBackground: 'rgba(251, 146, 60, 0.12)',
  error: '#F87171',
  errorBackground: 'rgba(248, 113, 113, 0.12)',
  info: '#38BDF8',
  infoBackground: 'rgba(56, 189, 248, 0.12)',
  
  inputBackground: '#17201E',
  inputBorder: '#26332F',
  inputText: '#F3F7F5',
  placeholderText: '#7E8C86',
  
  userBubble: '#173D29',
  userBubbleText: '#F3F7F5',
  aiBubble: '#17201E',
  aiBubbleBorder: '#26332F',
  aiBubbleText: '#F3F7F5',
  
  navBackground: '#111817',
  navBorder: '#26332F',
  navActive: '#54C878',
  navInactive: '#7E8C86',
  navActiveBackground: 'rgba(84, 200, 120, 0.10)',
  
  shadowColor: '#000000',
  shadowOpacity: 0.25,
};

export const nightTheme: ThemeTokens = {
  background: '#0E1413',       // LEVEL 0
  surface: '#141C1A',          // LEVEL 1
  surfaceElevated: '#1A2422',  // LEVEL 2
  surfaceModal: '#202D2A',     // LEVEL 3
  
  border: '#2A3A35',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
  borderElevated: 'rgba(255, 255, 255, 0.08)',
  
  textPrimary: '#E8EFEB',
  textSecondary: '#A9B7B1',
  textTertiary: '#71807A',
  textDisabled: '#4E5A55',
  
  accent: '#4BB86D',
  accentSecondary: '#369A57',
  accentSoft: '#7BCF94',
  accentDeep: '#143523',
  accentGlow: 'rgba(75, 184, 109, 0.12)',
  
  success: '#4BB86D',
  successBackground: 'rgba(75, 184, 109, 0.10)',
  warning: '#E6950A',
  warningBackground: 'rgba(230, 149, 10, 0.10)',
  attention: '#EB8532',
  attentionBackground: 'rgba(235, 133, 50, 0.10)',
  error: '#E56565',
  errorBackground: 'rgba(229, 101, 101, 0.10)',
  info: '#30ACDE',
  infoBackground: 'rgba(48, 172, 222, 0.10)',
  
  inputBackground: '#1A2422',
  inputBorder: '#2A3A35',
  inputText: '#E8EFEB',
  placeholderText: '#71807A',
  
  userBubble: '#143523',
  userBubbleText: '#E8EFEB',
  aiBubble: '#1A2422',
  aiBubbleBorder: '#2A3A35',
  aiBubbleText: '#E8EFEB',
  
  navBackground: '#141C1A',
  navBorder: '#2A3A35',
  navActive: '#4BB86D',
  navInactive: '#71807A',
  navActiveBackground: 'rgba(75, 184, 109, 0.08)',
  
  shadowColor: '#000000',
  shadowOpacity: 0.20,
};

export const deepNightTheme: ThemeTokens = {
  background: '#060908',       // LEVEL 0
  surface: '#0B100F',          // LEVEL 1
  surfaceElevated: '#101715',  // LEVEL 2
  surfaceModal: '#151F1C',     // LEVEL 3
  
  border: '#1F2C28',
  borderSubtle: 'rgba(255, 255, 255, 0.04)',
  borderElevated: 'rgba(255, 255, 255, 0.07)',
  
  textPrimary: '#DDE6E2',
  textSecondary: '#9AABA4',
  textTertiary: '#64736E',
  textDisabled: '#434E4A',
  
  accent: '#3DAE63',
  accentSecondary: '#2E8C4D',
  accentSoft: '#68C387',
  accentDeep: '#102A1C',
  accentGlow: 'rgba(61, 174, 99, 0.10)',
  
  success: '#3DAE63',
  successBackground: 'rgba(61, 174, 99, 0.08)',
  warning: '#D98907',
  warningBackground: 'rgba(217, 137, 7, 0.08)',
  attention: '#DB7828',
  attentionBackground: 'rgba(219, 120, 40, 0.08)',
  error: '#D35858',
  errorBackground: 'rgba(211, 88, 88, 0.08)',
  info: '#2798C7',
  infoBackground: 'rgba(39, 152, 199, 0.08)',
  
  inputBackground: '#101715',
  inputBorder: '#1F2C28',
  inputText: '#DDE6E2',
  placeholderText: '#64736E',
  
  userBubble: '#102A1C',
  userBubbleText: '#DDE6E2',
  aiBubble: '#101715',
  aiBubbleBorder: '#1F2C28',
  aiBubbleText: '#DDE6E2',
  
  navBackground: '#0B100F',
  navBorder: '#1F2C28',
  navActive: '#3DAE63',
  navInactive: '#64736E',
  navActiveBackground: 'rgba(61, 174, 99, 0.06)',
  
  shadowColor: '#000000',
  shadowOpacity: 0.35,
};

export const THEME_MAP: Record<ActiveTheme, ThemeTokens> = {
  light: lightTheme,
  dark: darkTheme,
  night: nightTheme,
  deep_night: deepNightTheme,
};
