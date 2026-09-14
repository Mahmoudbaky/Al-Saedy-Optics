import { StyleSheet, View } from 'react-native';

import type { CartItem } from '@/api';
import { Card, Icon, ImageSlot, Pressable, Stepper, Text } from '@/components/ui';
import { useLocale } from '@/i18n';
import { radius, spacing, useTheme } from '@/theme';

export interface CartLineCardProps {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  /** Disables the stepper while a quantity change is in flight. */
  busy?: boolean;
}

export function CartLineCard({ item, onQuantityChange, onRemove, busy = false }: CartLineCardProps) {
  const { t, l, n, price } = useLocale();
  const { colors } = useTheme();
  const details = [
    item.variantLabel ? n(item.variantLabel) : null,
    item.variant.colorName ? l(item.variant.colorName) : null,
    ...item.addons.map((a) => l(a.name)),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card padding={12} style={[styles.card, !item.available && styles.unavailable]}>
      <ImageSlot style={styles.image} source={item.product.image ? { uri: item.product.image } : undefined} placeholder={l({ ar: 'نظارة', en: 'Frame' })} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text variant="bodySm" weight="medium" numberOfLines={1} style={styles.title}>
            {l(item.product.name)}{item.product.code ? ` ${item.product.code}` : ''}
          </Text>
          <Pressable onPress={onRemove} hitSlop={10} accessibilityRole="button" accessibilityLabel={t.common.remove}>
            <Icon name="close" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
        {details ? <Text variant="caption" color="textSecondary" numberOfLines={1}>{details}</Text> : null}
        {!item.available ? <Text variant="caption" color="red">{t.cart.unavailable}</Text> : null}
        <View style={styles.footer}>
          <Text variant="body" weight="bold">{price(item.unitPrice)}</Text>
          <View pointerEvents={busy ? 'none' : 'auto'} style={busy && styles.busy}>
            <Stepper value={item.quantity} onChange={onQuantityChange} max={20} />
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.md },
  unavailable: { opacity: 0.7 },
  image: { width: 82, height: 82, borderRadius: radius.lg },
  body: { flex: 1, gap: 5 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  busy: { opacity: 0.5 },
});
