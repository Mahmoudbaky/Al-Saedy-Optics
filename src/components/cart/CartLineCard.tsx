import { StyleSheet, View } from 'react-native';

import { Card, ImageSlot, Stepper, Text } from '@/components/ui';
import type { CartLine } from '@/data';
import { useLocale } from '@/i18n';
import { lineUnitPrice } from '@/store';
import { radius, spacing } from '@/theme';

export interface CartLineCardProps {
  line: CartLine;
  onQuantityChange: (quantity: number) => void;
}

export function CartLineCard({ line, onQuantityChange }: CartLineCardProps) {
  const { t, l, price } = useLocale();
  const addonLabels = line.addons.map((id) => (id === 'blueLight' ? t.product.blueLight : id === 'antiGlare' ? t.product.antiGlare : t.product.thinLens));
  const details = [line.variant ? l(line.variant) : null, ...addonLabels].filter(Boolean).join(' · ');

  return (
    <Card padding={12} style={styles.card}>
      <ImageSlot style={styles.image} placeholder={l({ ar: 'نظارة', en: 'Frame' })} />
      <View style={styles.body}>
        <Text variant="bodySm" weight="medium" numberOfLines={1}>{l(line.product.name)}{line.product.code ? ` ${line.product.code}` : ''}</Text>
        {details ? <Text variant="caption" color="textSecondary" numberOfLines={1}>{details}</Text> : null}
        <View style={styles.footer}>
          <Text variant="body" weight="bold">{price(lineUnitPrice(line))}</Text>
          <Stepper value={line.quantity} onChange={onQuantityChange} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.md },
  image: { width: 82, height: 82, borderRadius: radius.lg },
  body: { flex: 1, gap: 5 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
});
