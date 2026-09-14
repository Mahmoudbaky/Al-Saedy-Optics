import { StyleSheet, View } from 'react-native';

import { Button, Icon, Text, type IconName } from '@/components/ui';
import { spacing, useTheme } from '@/theme';

export interface EmptyViewProps {
  icon?: IconName;
  title: string;
  hint?: string;
  action?: { label: string; onPress: () => void };
}

/** Empty state for lists (cart, wishlist, orders…). */
export function EmptyView({ icon = 'bag', title, hint, action }: EmptyViewProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconBox, { backgroundColor: colors.surfaceMuted }]}>
        <Icon name={icon} size={30} color={colors.textMuted} />
      </View>
      <Text variant="sectionTitle" align="center">{title}</Text>
      {hint ? <Text variant="bodySm" color="textSecondary" align="center">{hint}</Text> : null}
      {action ? <Button label={action.label} variant="navy" size="md" onPress={action.onPress} style={styles.button} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
  iconBox: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  button: { marginTop: spacing.sm, minWidth: 180 },
});
