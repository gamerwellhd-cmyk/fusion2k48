/**
 * Design Tokens - Color System
 * Based on Material Design 3 principles with custom Petrol palette
 */

export const colorTokens = {
  // Primary Colors - Petrol Palette
  primary: {
    50: '#cfd8da',
    100: '#b7c3c5',
    200: '#9cb0b3',
    300: '#80a7ac',
    400: '#6c9a9f',
    500: '#4d939a',
    600: '#085b6f',
    700: '#1c514e',
    800: '#2a4043',
    900: '#08262e',
    950: '#05181d',
  },

  // Semantic Colors
  background: {
    default: '#05181d', // petrol-950
    surface: '#08262e', // petrol-900
    surfaceVariant: '#2a4043', // petrol-800
  },

  // Status Colors
  success: {
    main: '#10b981',
    light: '#d1fae5',
    dark: '#047857',
  },

  error: {
    main: '#ef4444',
    light: '#fee2e2',
    dark: '#dc2626',
  },

  warning: {
    main: '#f59e0b',
    light: '#fef3c7',
    dark: '#d97706',
  },

  info: {
    main: '#3b82f6',
    light: '#dbeafe',
    dark: '#1d4ed8',
  },

  // Coins/Café Color
  coins: {
    main: '#f97316', // Orange similar to coffee
    light: '#fed7aa',
    dark: '#9a3412',
  },

  // Text Colors
  text: {
    primary: '#f4f4f5', // zinc-100
    secondary: '#a1a1aa', // zinc-400
    disabled: '#71717a', // zinc-500
  },

  // Borders
  border: {
    light: '#3f3f46', // zinc-800
    default: '#27272a', // zinc-800 darker
    dark: '#18181b', // zinc-900
  },
} as const;

/**
 * Get a color token value by path
 * @example getColorToken('primary.500') => '#4d939a'
 */
export function getColorToken(path: string): string {
  const keys = path.split('.');
  let value: any = colorTokens;

  for (const key of keys) {
    value = value?.[key];
  }

  return value || '#05181d';
}

/**
 * Convert color token to CSS variable format
 * @example colorToCssVar('primary.500') => 'var(--color-primary-500)'
 */
export function colorToCssVar(path: string): string {
  return `var(--color-${path.replace('.', '-')})`;
}
