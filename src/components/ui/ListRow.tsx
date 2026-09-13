import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing, useTheme, useThemedStyles, type Palette } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

export interface ListRowProps {
  icon?: IconName;
  iconColor?: string;
  label: string;
  labelColor?: 'text' | 'red' | 'textSecondary';
  trailing?: ReactNode;
  onPress?: () => void;
  showDivider?: boolean;
}

/** A settings-style row used in the account screen. */
export function ListRow({ icon, iconColor, label, labelColor = 'text', trailing, onPress, showDivider = true }: ListRowProps) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} style={[styles.row, showDivider && styles.divider]}>
      {icon ? <Icon name={icon} size={20} color={iconColor ?? colors.icon} /> : null}
      <View style={styles.label}>
        <Text variant="body" color={labelColor}>{label}</Text>
      </View>
      {trailing}
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 15, paddingHorizontal: 14 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.surfaceMuted },
  label: { flex: 1 },
});
