import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CartLineCard, OrderSummaryCard } from '@/components/cart';
import { Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { Button, Card, Icon, Pressable, Text } from '@/components/ui';
import { getProduct, prescriptions } from '@/data';
import { useLocale } from '@/i18n';
import { useCart } from '@/store';
import { radius, spacing, typography, useTheme, useThemedStyles, type Palette } from '@/theme';

const UPSELL_PRODUCT_ID = 'case-cleaner';

export default function CartScreen() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { t, tf, n, price } = useLocale();
  const cart = useCart();
  const [promo, setPromo] = useState('');

  const attachedRx = prescriptions.find((rx) => rx.id === cart.prescriptionId);
  const upsell = getProduct(UPSELL_PRODUCT_ID);
  const showUpsell = upsell && !cart.has(upsell.id);

  if (cart.lines.length === 0) {
    return (
      <Screen>
        <ScreenHeader size="lg" title={t.cart.title} />
        <View style={styles.empty}>
          <Icon name="bag" size={44} color={colors.textMuted} strokeWidth={1.4} />
          <Text variant="headline" align="center">{t.cart.empty}</Text>
          <Text variant="bodySm" color="textSecondary" align="center">{t.cart.emptyHint}</Text>
          <Button label={t.cart.browse} variant="navy" size="md" style={styles.emptyButton} onPress={() => router.push('/(tabs)/categories')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader size="lg" title={t.cart.title} trailing={<Text variant="label" color="textSecondary">{tf(t.cart.count, { count: n(cart.itemCount) })}</Text>} />

      <ScreenScroll gap={spacing.md}>
        {cart.lines.map((line) => (
          <CartLineCard
            key={`${line.product.id}-${line.color}-${line.addons.join(',')}`}
            line={line}
            onQuantityChange={(quantity) => cart.dispatch({ type: 'setQuantity', productId: line.product.id, quantity })}
          />
        ))}

        <View style={styles.promoRow}>
          <TextInput
            value={promo}
            onChangeText={setPromo}
            placeholder={t.cart.promoPlaceholder}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            style={styles.promoInput}
          />
          <Button label={t.common.apply} variant="navy" size="md" style={styles.promoButton} onPress={() => cart.dispatch({ type: 'applyPromo', code: promo || null })} />
        </View>

        <Pressable onPress={() => router.push('/prescription')} accessibilityRole="button">
          <Card style={styles.rowCard}>
            <View style={styles.iconBox}>
              <Icon name="bookmark" size={19} />
            </View>
            <View style={styles.rowBody}>
              <Text variant="bodySm" weight="medium">{attachedRx ? t.cart.rxAttached : t.cart.rxMissing}</Text>
              {attachedRx ? (
                <Text variant="caption" color="textSecondary">{`OD ${attachedRx.od.sph} · OS ${attachedRx.os.sph} · PD ${attachedRx.pd}`}</Text>
              ) : null}
            </View>
            <Text variant="label" color="red">{attachedRx ? t.common.change : t.common.add}</Text>
          </Card>
        </Pressable>

        {showUpsell ? (
          <Card style={styles.rowCard} padding={13}>
            <Icon name="card" size={20} />
            <View style={styles.rowBody}>
              <Text variant="label">{tf(t.cart.upsell, { price: price(upsell.price) })}</Text>
            </View>
            <Pressable onPress={() => cart.dispatch({ type: 'add', product: upsell })} hitSlop={8} accessibilityRole="button">
              <Text variant="label" weight="bold">{t.common.add}</Text>
            </Pressable>
          </Card>
        ) : null}

        <OrderSummaryCard
          rows={[
            { label: t.common.subtotal, value: price(cart.subtotal) },
            { label: t.common.delivery, value: cart.deliveryFee === 0 ? t.common.free : price(cart.deliveryFee), valueColor: cart.deliveryFee === 0 ? 'green' : 'text' },
          ]}
          totalLabel={t.common.total}
          totalValue={price(cart.total)}
        />

        <Button label={t.cart.checkout} onPress={() => router.push('/checkout')} />
      </ScreenScroll>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  promoRow: { flexDirection: 'row', gap: spacing.sm },
  promoInput: {
    ...typography.bodySm,
    flex: 1,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  promoButton: { paddingHorizontal: 20, borderRadius: radius.lg },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowBody: { flex: 1, gap: 2 },
  iconBox: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: 40, paddingBottom: 80 },
  emptyButton: { marginTop: spacing.md, paddingHorizontal: 28 },
});
