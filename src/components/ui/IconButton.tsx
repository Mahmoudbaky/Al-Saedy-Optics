import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

import { radius, useTheme, type Palette } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';

type Variant = 'plain' | 'glass' | 'glassDark' | 'navy' | 'outline';

export interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  variant?: Variant;
  size?: number;
  iconSize?: number;
  color?: string;
  filled?: boolean;
  /** `rounded` uses the 14px card radius (e.g. the try-on button next to the CTA). */
  shape?: 'circle' | 'rounded';
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const glassAvailable = isLiquidGlassAvailable();

/**
 * Circular icon button. `glass` variants render Liquid Glass on iOS 26+ and a
 * translucent disc elsewhere (Android, older iOS), matching the design overlays.
 */
export function IconButton({
  icon,
  onPress,
  variant = 'plain',
  size = 38,
  iconSize = 18,
  color,
  filled,
  shape = 'circle',
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const { colors } = useTheme();
  const circle = { width: size, height: size, borderRadius: shape === 'circle' ? size / 2 : radius.xl };
  const tint = color ?? (variant === 'glassDark' || variant === 'navy' ? colors.onNavy : colors.navy);
  const glyph = <Icon name={icon} size={iconSize} color={tint} strokeWidth={1.8} filled={filled} />;

  const isGlass = variant === 'glass' || variant === 'glassDark';
  const surface = isGlass && glassAvailable ? (
    <GlassView
      style={[styles.center, circle]}
      glassEffectStyle="regular"
      colorScheme={variant === 'glassDark' ? 'dark' : 'light'}
      isInteractive
    >
      {glyph}
    </GlassView>
  ) : (
    <View style={[styles.center, circle, fallbackStyles(colors)[variant]]}>{glyph}</View>
  );

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={[circle, style]}>
      {surface}
    </Pressable>
  );
}

const fallbackStyles = (colors: Palette): Record<Variant, ViewStyle> => ({
  plain: {},
  glass: { backgroundColor: colors.overlaySurface },
  glassDark: { backgroundColor: colors.white16 },
  navy: { backgroundColor: colors.navy },
  outline: { borderWidth: 1, borderColor: colors.navy },
});

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
