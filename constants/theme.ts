/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */
import { Platform } from 'react-native';

// Color palette
const deepPlum = '#6E1352';
const dustyRose = '#AC515F';
const warmCoral = '#E98E58';
const cream = '#F6F3E8';
const sage = '#B9D3C2';
const teal = '#51B0A5';
const espresso = '#0F0A08';

const tintColorLight = teal;
const tintColorDark = sage;

export const Colors = {
  light: {
    text: espresso,
    background: cream,
    tint: tintColorLight,
    icon: dustyRose,
    tabIconDefault: '#8B6B5C',
    tabIconSelected: tintColorLight,
    accent: warmCoral,
    secondary: sage,
    primary: deepPlum,
  },
  dark: {
    text: cream,
    background: espresso,
    tint: tintColorDark,
    icon: sage,
    tabIconDefault: dustyRose,
    tabIconSelected: tintColorDark,
    accent: warmCoral,
    secondary: teal,
    primary: deepPlum,
    // Gradient colors for shifting background
    gradientStart: '#1A0E0A',
    gradientMid: deepPlum,
    gradientEnd: '#0F2B28',
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