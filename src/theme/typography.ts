import { Platform, type TextStyle } from 'react-native';

/**
 * Display face: El Messiri (loaded in the root layout).
 * Body face: GE Dinar One in the design. Until the licensed OTF files are added
 * under assets/fonts, we fall back to the platform Arabic-capable system font.
 * To enable GE Dinar One: add the files, register them in `src/theme/fonts.ts`
 * and point `bodyFamily` at the loaded names.
 */
const displayFamily = {
  regular: 'ElMessiri-Regular',
  semibold: 'ElMessiri-SemiBold',
  bold: 'ElMessiri-Bold',
} as const;

const bodyFamily = {
  regular: undefined,
  medium: undefined,
  bold: undefined,
} as const satisfies Record<'regular' | 'medium' | 'bold', string | undefined>;

const bodyWeight = { regular: '400', medium: '500', bold: '700' } as const;

export type DisplayWeight = keyof typeof displayFamily;
export type BodyWeight = keyof typeof bodyFamily;

export function displayFont(weight: DisplayWeight = 'semibold'): TextStyle {
  return { fontFamily: displayFamily[weight] };
}

export function bodyFont(weight: BodyWeight = 'regular'): TextStyle {
  const family = bodyFamily[weight];
  return family ? { fontFamily: family } : { fontWeight: bodyWeight[weight] };
}

/** Named text styles matching the sizes used in the design canvas. */
export const typography = {
  displayLg: { ...displayFont('bold'), fontSize: 30, lineHeight: 40 },
  displayMd: { ...displayFont('bold'), fontSize: 24, lineHeight: 32 },
  title: { ...displayFont('bold'), fontSize: 23, lineHeight: 30 },
  headline: { ...displayFont('semibold'), fontSize: 22, lineHeight: 28 },
  screenTitle: { ...displayFont('semibold'), fontSize: 20, lineHeight: 26 },
  sectionTitle: { ...displayFont('semibold'), fontSize: 19, lineHeight: 24 },
  price: { ...bodyFont('bold'), fontSize: 22, lineHeight: 28 },
  bodyLg: { ...bodyFont('regular'), fontSize: 17, lineHeight: 24 },
  body: { ...bodyFont('regular'), fontSize: 15, lineHeight: 22 },
  bodySm: { ...bodyFont('regular'), fontSize: 14, lineHeight: 20 },
  label: { ...bodyFont('regular'), fontSize: 13, lineHeight: 20 },
  caption: { ...bodyFont('regular'), fontSize: 12, lineHeight: 16 },
  tiny: { ...bodyFont('regular'), fontSize: 11, lineHeight: 14 },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** Android renders some Arabic glyphs slightly taller; give lines a little more room. */
export const lineHeightScale = Platform.OS === 'android' ? 1.08 : 1;
