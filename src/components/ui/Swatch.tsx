import { StyleSheet, View } from 'react-native';

import { useThemedStyles, type Palette } from '@/theme';

import { Pressable } from './Pressable';

export interface SwatchProps {
  color: string;
  selected: boolean;
  onPress: () => void;
}

/** Colour dot with the double ring used on the product page. */
export function Swatch({ color, selected, onPress }: SwatchProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} style={[styles.ring, selected && styles.ringSelected]}>
      <View style={[styles.fill, { backgroundColor: color }]} />
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  ring: { width: 34, height: 34, borderRadius: 17, padding: 2, borderWidth: 2, borderColor: 'transparent' },
  ringSelected: { borderColor: colors.navy, backgroundColor: colors.surface },
  fill: { flex: 1, borderRadius: 15 },
});
