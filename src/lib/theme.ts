import { useStore } from '../store/useStore'

export interface AppTheme {
  bg: string
  card: string
  cardAlt: string
  border: string
  text: string
  textSub: string
  textMuted: string
  inputBg: string
  buttonBg: string
  buttonText: string
  darkMode: boolean
}

const LIGHT: AppTheme = {
  bg: '#f5f5f7',
  card: '#ffffff',
  cardAlt: '#f9fafb',
  border: '#f3f4f6',
  text: '#111827',
  textSub: '#6b7280',
  textMuted: '#9ca3af',
  inputBg: 'transparent',
  buttonBg: '#f3f4f6',
  buttonText: '#6b7280',
  darkMode: false,
}

const DARK: AppTheme = {
  bg: '#0f1117',
  card: '#161c2c',
  cardAlt: '#1e2540',
  border: '#222d42',
  text: '#f0f4ff',
  textSub: '#8b96b5',
  textMuted: '#556080',
  inputBg: '#1e2540',
  buttonBg: '#1e2540',
  buttonText: '#8b96b5',
  darkMode: true,
}

export function useTheme(): AppTheme {
  const darkMode = useStore((s) => s.darkMode)
  return darkMode ? DARK : LIGHT
}
