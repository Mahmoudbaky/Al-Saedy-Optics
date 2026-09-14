import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { spacing, useTheme } from '@/theme';

/** Centered spinner for a section or a whole screen body. */
export function LoadingView({ compact = false }: { compact?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, compact ? styles.compact : styles.fill]}>
      <ActivityIndicator color={colors.navy} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  fill: { flex: 1, minHeight: 200 },
  compact: { paddingVertical: spacing.xl },
});
