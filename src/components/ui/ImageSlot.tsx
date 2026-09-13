import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image, type ImageSource } from 'expo-image';

import { useTheme, type ColorToken } from '@/theme';

import { Text } from './Text';

export interface ImageSlotProps {
  source?: ImageSource | number;
  /** Shown when no image is available, mirroring the design's image-slot labels. */
  placeholder?: string;
  tone?: 'muted' | 'hero' | 'navy';
  style?: StyleProp<ViewStyle>;
}

const backgrounds = {
  muted: 'surfaceMuted',
  hero: 'heroPlaceholder',
  navy: 'navyLight',
} as const satisfies Record<string, ColorToken>;

export function ImageSlot({ source, placeholder, tone = 'muted', style }: ImageSlotProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.base, { backgroundColor: colors[backgrounds[tone]] }, style]}>
      {source ? (
        <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      ) : placeholder ? (
        <Text variant="caption" color="textMuted" align="center">{placeholder}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
