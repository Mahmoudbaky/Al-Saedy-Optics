import { useCallback, type PropsWithChildren } from 'react';
import { Platform, ScrollView, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { spacing, useTheme } from '@/theme';

export interface ScreenProps extends PropsWithChildren {
  background?: 'background' | 'surface' | 'brand' | 'cameraBackdrop';
  /** Safe-area edges to pad. Tab screens leave `bottom` to the native tab bar. */
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}

type ScreenBackground = NonNullable<ScreenProps['background']>;

/** Backgrounds dark enough to need light status-bar icons. */
const darkBackgrounds: ReadonlySet<ScreenBackground> = new Set(['brand', 'cameraBackdrop']);

/**
 * Full-height screen container with safe-area padding and the brand background.
 * Each screen owns its status-bar icon colour: applied on focus so it stays correct
 * across stack pushes/pops and native tab switches.
 */
export function Screen({ background = 'background', edges = ['top'], style, children }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const statusBarStyle = isDark || darkBackgrounds.has(background) ? 'light' : 'dark';

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(statusBarStyle, true);
    }, [statusBarStyle]),
  );

  const padding = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
  };
  return <View style={[styles.screen, { backgroundColor: colors[background] }, padding, style]}>{children}</View>;
}

export interface ScreenScrollProps extends ScrollViewProps {
  /** Adds the standard 18px gutter and vertical gap used across the design. */
  gutter?: boolean;
  gap?: number;
}

/**
 * Scrollable body. `contentInsetAdjustmentBehavior="automatic"` lets content scroll
 * beneath the translucent (Liquid Glass) tab bar on iOS; Android's bar is opaque.
 */
export function ScreenScroll({ gutter = true, gap = spacing.lg, contentContainerStyle, ...rest }: ScreenScrollProps) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        { gap, paddingBottom: spacing.xl + (Platform.OS === 'android' ? insets.bottom : 0) },
        gutter && styles.gutter,
        contentContainerStyle,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  gutter: { paddingHorizontal: spacing.screen },
});
