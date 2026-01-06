/**
 * Beauty Log & Supplement - Theme Configuration
 * Minimal, unisex design with neutral color palette
 */

import { Platform } from 'react-native';

// Accent colors
const accentLight = '#6B8E7B'; // Sage green
const accentDark = '#8BAA9A';

export const Colors = {
  light: {
    text: '#4A5568', // Charcoal gray - main text
    textSecondary: '#718096', // Lighter gray for secondary text
    background: '#F8F8F6', // Off-white / warm gray
    surface: '#FFFFFF', // Card backgrounds
    tint: accentLight,
    icon: '#718096',
    tabIconDefault: '#A0AEC0',
    tabIconSelected: accentLight,
    border: '#E2E2E0',
    accent: accentLight,
    accentLight: '#E8F0EB', // Sage green light - backgrounds
    secondary: '#8B7355', // Greige - sub accent
    success: '#68A67D',
    error: '#C53030',
  },
  dark: {
    text: '#E2E8F0',
    textSecondary: '#A0AEC0',
    background: '#1A1D1E',
    surface: '#2D3436',
    tint: accentDark,
    icon: '#A0AEC0',
    tabIconDefault: '#718096',
    tabIconSelected: accentDark,
    border: '#4A5568',
    accent: accentDark,
    accentLight: '#2D3D35',
    secondary: '#A08060',
    success: '#68D391',
    error: '#FC8181',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
