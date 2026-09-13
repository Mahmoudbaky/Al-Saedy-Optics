import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { spacing } from '@/theme';

export interface ChipRowProps extends PropsWithChildren {
  /** Adds the screen gutter inside the scroller so chips can bleed to the edge. */
  inset?: boolean;
}

/**
 * Horizontal, edge-bleeding chip scroller. ScrollView defaults to `flexGrow: 1`,
 * which would let the row claim vertical space in a column layout; pin it to its content.
 */
export function ChipRow({ inset = false, children }: ChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={[styles.content, inset && styles.inset]}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, flexShrink: 0 },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  inset: { paddingHorizontal: spacing.screen },
});
