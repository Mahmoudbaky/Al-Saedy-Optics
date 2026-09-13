import { StyleSheet, View } from 'react-native';

import { Icon, Pressable, Text } from '@/components/ui';
import { radius, useTheme, useThemedStyles, type Palette } from '@/theme';

export interface SearchBarProps {
  placeholder: string;
  onPress?: () => void;
}

/** Tappable search affordance from the home header. */
export function SearchBar({ placeholder, onPress }: SearchBarProps) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="search" style={styles.bar}>
      <Icon name="search" size={18} color={colors.textMuted} strokeWidth={1.8} />
      <View style={styles.text}>
        <Text variant="bodySm" color="textMuted" numberOfLines={1}>{placeholder}</Text>
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  text: { flex: 1 },
});
