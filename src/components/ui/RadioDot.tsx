import { StyleSheet, View } from 'react-native';

import { useThemedStyles, type Palette } from '@/theme';

export function RadioDot({ selected }: { selected: boolean }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.dot, selected ? styles.selected : styles.idle]} />;
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  dot: { width: 18, height: 18, borderRadius: 9 },
  selected: { borderWidth: 5, borderColor: colors.navy },
  idle: { borderWidth: 1.5, borderColor: colors.borderStrong },
});
