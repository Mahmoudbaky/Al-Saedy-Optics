import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { radius, useTheme, useThemedStyles, type Palette } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

type Variant = 'filled' | 'outlined' | 'removable';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** `filled` = navy pill when selected; `outlined` = navy border when selected. */
  variant?: Variant;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, selected = false, onPress, variant = 'filled', icon, style }: ChipProps) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  if (variant === 'removable') {
    return (
      <Pressable onPress={onPress} style={[styles.base, styles.removable, style]} accessibilityRole="button">
        <Text variant="caption" color="redDark">{label}</Text>
        <Icon name="close" size={11} color={colors.redDark} strokeWidth={2.2} />
      </Pressable>
    );
  }

  const isFilledSelected = variant === 'filled' && selected;
  const isOutlinedSelected = variant === 'outlined' && selected;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.base,
        styles.default,
        isFilledSelected && styles.filledSelected,
        isOutlinedSelected && styles.outlinedSelected,
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={14} color={isFilledSelected ? colors.onNavy : colors.navy} strokeWidth={2} /> : null}
      <Text variant="label" color={isFilledSelected ? 'onNavy' : 'text'} weight={isOutlinedSelected ? 'bold' : 'regular'}>
        {label}
      </Text>
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  default: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filledSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
  outlinedSelected: { borderWidth: 1.5, borderColor: colors.navy, paddingVertical: 7.5, paddingHorizontal: 13.5 },
  removable: { backgroundColor: colors.redSoft, paddingVertical: 7, paddingHorizontal: 12 },
});
