import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, useTheme, type ColorToken, type Palette } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

type Variant = 'primary' | 'navy' | 'outline' | 'white' | 'ghostOnDark' | 'whiteOutline';
type Size = 'lg' | 'md' | 'sm';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const variantStyles = (colors: Palette): Record<Variant, { container: ViewStyle; text: ColorToken }> => ({
  primary: { container: { backgroundColor: colors.red }, text: 'onNavy' },
  navy: { container: { backgroundColor: colors.navy }, text: 'onNavy' },
  outline: { container: { borderWidth: 1, borderColor: colors.navy, backgroundColor: colors.surface }, text: 'navy' },
  white: { container: { backgroundColor: colors.surface }, text: 'navy' },
  ghostOnDark: { container: { backgroundColor: 'transparent' }, text: 'onNavy' },
  whiteOutline: { container: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' }, text: 'onNavy' },
});

const sizeStyles: Record<Size, { paddingVertical: number; fontSize: number }> = {
  lg: { paddingVertical: 16, fontSize: 16 },
  md: { paddingVertical: 13, fontSize: 14 },
  sm: { paddingVertical: 9, fontSize: 13 },
};

export function Button({ label, onPress, variant = 'primary', size = 'lg', icon, disabled, style }: ButtonProps) {
  const { colors } = useTheme();
  const v = variantStyles(colors)[variant];
  const s = sizeStyles[size];
  const isBold = variant !== 'whiteOutline' && variant !== 'ghostOnDark';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      rippleColor={variant === 'primary' || variant === 'navy' ? 'rgba(255,255,255,0.25)' : undefined}
      style={[styles.base, v.container, { paddingVertical: s.paddingVertical }, disabled && styles.disabled, style]}
    >
      <View style={styles.content}>
        {icon ? <Icon name={icon} size={16} color={colors[v.text]} strokeWidth={2} /> : null}
        <Text variant="body" color={v.text} weight={isBold ? 'bold' : 'regular'} style={{ fontSize: s.fontSize, lineHeight: s.fontSize * 1.35 }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disabled: { opacity: 0.5 },
});
