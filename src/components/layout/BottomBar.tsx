import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, useTheme, useThemedStyles, type Palette } from '@/theme';

export interface BottomBarProps extends PropsWithChildren {
  bordered?: boolean;
  background?: 'background' | 'surface' | 'transparent';
}

/** Pinned footer for primary actions on pushed screens; respects the home indicator. */
export function BottomBar({ bordered = false, background = 'background', children }: BottomBarProps) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, spacing.md), backgroundColor: background === 'transparent' ? 'transparent' : colors[background] },
        bordered && styles.bordered,
      ]}
    >
      {children}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  bar: { flexDirection: 'row', gap: 10, paddingHorizontal: spacing.screen, paddingTop: spacing.md },
  bordered: { borderTopWidth: 1, borderTopColor: colors.border },
});
