import { StyleSheet, View } from 'react-native';

import { useThemedStyles, type Palette } from '@/theme';

import { Pressable } from './Pressable';

export interface SwatchProps {
  color: string;
  selected: boolean;
  onPress: () => void;
  /** Out-of-stock colour: dimmed with a strike, still tappable so the user sees why. */
  disabled?: boolean;
}

/** Colour dot with the double ring used on the product page. */
export function Swatch({ color, selected, onPress, disabled = false }: SwatchProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      style={[styles.ring, selected && styles.ringSelected, disabled && styles.disabled]}
    >
      <View style={[styles.fill, { backgroundColor: color }]} />
      {disabled ? <View style={styles.strike} /> : null}
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    ring: { width: 34, height: 34, borderRadius: 17, padding: 2, borderWidth: 2, borderColor: 'transparent' },
    ringSelected: { borderColor: colors.navy, backgroundColor: colors.surface },
    disabled: { opacity: 0.45 },
    fill: { flex: 1, borderRadius: 15 },
    strike: { position: 'absolute', left: 4, right: 4, top: 14, height: 2, backgroundColor: colors.surface, transform: [{ rotate: '-45deg' }] },
  });
