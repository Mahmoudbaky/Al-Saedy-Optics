import { Pressable as RNPressable, StyleSheet, type PressableProps as RNPressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export interface PressableProps extends Omit<RNPressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  pressedOpacity?: number;
  rippleColor?: string;
}

/**
 * Press feedback that feels native on both platforms: a Material ripple on
 * Android and an opacity dip on iOS.
 */
export function Pressable({ style, pressedOpacity = 0.72, rippleColor, ...rest }: PressableProps) {
  const { colors } = useTheme();
  return (
    <RNPressable
      android_ripple={{ color: rippleColor ?? colors.ripple, foreground: true }}
      {...rest}
      style={({ pressed }) => [style, pressed && { opacity: pressedOpacity }]}
    />
  );
}

export const hitSlop = StyleSheet.hairlineWidth * 8;
