import { StyleSheet, View, type ViewProps } from 'react-native';

import { radius, spacing, useThemedStyles, type Palette } from '@/theme';

export interface CardProps extends ViewProps {
  /** `navy` is the dark promo/summary card; `muted` the soft inset panel. */
  tone?: 'surface' | 'navy' | 'muted' | 'dashed';
  padding?: number;
}

export function Card({ tone = 'surface', padding = spacing.lg - 2, style, ...rest }: CardProps) {
  const tones = useThemedStyles(makeTones);
  return <View {...rest} style={[styles.base, tones[tone], { padding }, style]} />;
}

const makeTones = (colors: Palette) =>
  StyleSheet.create({
  surface: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  navy: { backgroundColor: colors.brand },
  muted: { backgroundColor: colors.background },
  dashed: { backgroundColor: colors.surface, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderStrong },
});

const styles = StyleSheet.create({
  base: { borderRadius: radius.card, overflow: 'hidden' },
});
