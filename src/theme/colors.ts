/**
 * Brand palettes. Keys are semantic so components never branch on the scheme:
 * `brand` is the fixed navy used for hero/promo surfaces, `navy` the interactive
 * brand colour (lightened in dark mode for contrast), `icon` the default glyph stroke.
 */
export const lightColors = {
  // Brand
  brand: '#16294F',
  navy: '#16294F',
  navyLight: '#2A3E6B',
  red: '#EE2A2E',
  redDark: '#C0181C',
  redSoft: '#FDE8E8',
  green: '#1E8A4C',

  // Surfaces
  background: '#F7F5F1',
  surface: '#FFFFFF',
  surfaceMuted: '#F0EEE9',
  canvas: '#EDEAE4',
  heroPlaceholder: '#E7E3DB',
  cameraBackdrop: '#0F1620',
  /** Bottom tab bar; darker than the page in dark mode so it reads as a distinct layer. */
  tabBar: '#FFFFFF',

  // Lines
  border: '#E4E0D8',
  borderStrong: '#C7C3BB',

  // Text & glyphs
  text: '#16294F',
  textSecondary: '#6B7180',
  textMuted: '#9AA0AC',
  textDisabled: '#B3B0A9',
  icon: '#16294F',
  onNavy: '#FFFFFF',
  onNavyMuted: '#B9C3D8',
  onNavySubtle: '#9DAAC4',

  // Overlays
  overlaySurface: 'rgba(255,255,255,0.92)',
  white16: 'rgba(255,255,255,0.16)',
  white10: 'rgba(255,255,255,0.10)',
  navy88: 'rgba(22,41,79,0.88)',
  navy15: 'rgba(22,41,79,0.15)',
  ripple: 'rgba(22,41,79,0.15)',
} as const;

export type Palette = { [K in keyof typeof lightColors]: string };
export type ColorToken = keyof Palette;

export const darkColors: Palette = {
  brand: '#16294F',
  navy: '#5B7AC2',
  navyLight: '#2A3E6B',
  red: '#F04A4E',
  redDark: '#FF7A7D',
  redSoft: '#3A1E22',
  green: '#4CC27A',

  background: '#0F1620',
  surface: '#171F2B',
  surfaceMuted: '#222C3A',
  canvas: '#1B2431',
  heroPlaceholder: '#27334A',
  cameraBackdrop: '#0F1620',
  tabBar: '#080C13',

  border: '#2A3443',
  borderStrong: '#3B4757',

  text: '#EEF1F6',
  textSecondary: '#A9B2C2',
  textMuted: '#7E8797',
  textDisabled: '#5B6474',
  icon: '#DCE3EF',
  onNavy: '#FFFFFF',
  onNavyMuted: '#B9C3D8',
  onNavySubtle: '#9DAAC4',

  overlaySurface: 'rgba(23,31,43,0.92)',
  white16: 'rgba(255,255,255,0.16)',
  white10: 'rgba(255,255,255,0.10)',
  navy88: 'rgba(22,41,79,0.88)',
  navy15: 'rgba(22,41,79,0.15)',
  ripple: 'rgba(255,255,255,0.12)',
};

export const palettes = { light: lightColors, dark: darkColors } as const;
