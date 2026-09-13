import { StyleSheet, View } from 'react-native';

import { Icon, Pressable, Text } from '@/components/ui';
import { radius, useTheme, useThemedStyles, type Palette } from '@/theme';

export interface TryOnBannerProps {
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export function TryOnBanner({ title, subtitle, onPress }: TryOnBannerProps) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.banner} rippleColor="rgba(255,255,255,0.2)">
      <Icon name="glasses" size={24} color={colors.onNavy} />
      <View style={styles.text}>
        <Text variant="body" color="onNavy" weight="bold">{title}</Text>
        <Text variant="caption" color="onNavyMuted">{subtitle}</Text>
      </View>
      <Icon name="forward" size={18} color={colors.onNavy} strokeWidth={1.8} />
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.brand,
    borderRadius: radius.card - 2,
    paddingVertical: 14,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  text: { flex: 1, gap: 2 },
});
