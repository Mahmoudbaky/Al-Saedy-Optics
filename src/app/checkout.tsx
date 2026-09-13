import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { OrderSummaryCard } from '@/components/cart';
import { BottomBar, Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { Button, Card, Icon, Pressable, RadioDot, SectionLabel, Text, type IconName } from '@/components/ui';
import { currentUser, orders } from '@/data';
import { useLocale } from '@/i18n';
import { useCart } from '@/store';
import { radius, spacing, useThemedStyles, type Palette } from '@/theme';

type Delivery = 'home' | 'pickup';
type Payment = 'cod' | 'wallet' | 'card';

export default function CheckoutScreen() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { t, l, n, price } = useLocale();
  const cart = useCart();
  const [delivery, setDelivery] = useState<Delivery>('home');
  const [payment, setPayment] = useState<Payment>('cod');

  const placeOrder = () => {
    cart.dispatch({ type: 'clear' });
    router.replace({ pathname: '/orders/[id]', params: { id: orders[0].id } });
  };

  const paymentOptions: { id: Payment; label: string; icon?: IconName }[] = [
    { id: 'cod', label: t.checkout.cod, icon: 'cash' },
    { id: 'wallet', label: t.checkout.wallet },
    { id: 'card', label: t.checkout.card },
  ];

  return (
    <Screen>
      <ScreenHeader showBack title={t.checkout.title} />

      <ScreenScroll gap={14}>
        <Card style={styles.address}>
          <Icon name="pin" size={20} />
          <View style={styles.addressBody}>
            <Text variant="bodySm" weight="bold">{t.checkout.address}</Text>
            <Text variant="label" color="textSecondary">{`${l(currentUser.address)}\n${n(currentUser.phone)}`}</Text>
          </View>
          <Text variant="label" color="red">{t.common.change}</Text>
        </Card>

        <View style={styles.section}>
          <SectionLabel>{t.checkout.deliveryMethod}</SectionLabel>
          <View style={styles.optionRow}>
            <OptionBox title={t.checkout.homeDelivery} hint={t.checkout.homeDeliveryHint} selected={delivery === 'home'} onPress={() => setDelivery('home')} />
            <OptionBox title={t.checkout.pickup} hint={t.checkout.pickupHint} selected={delivery === 'pickup'} onPress={() => setDelivery('pickup')} />
          </View>
        </View>

        <View style={styles.section}>
          <SectionLabel>{t.checkout.paymentMethod}</SectionLabel>
          {paymentOptions.map((option) => {
            const selected = payment === option.id;
            return (
              <Pressable key={option.id} onPress={() => setPayment(option.id)} accessibilityRole="radio" accessibilityState={{ selected }} style={[styles.option, styles.paymentRow, selected && styles.optionSelected]}>
                <RadioDot selected={selected} />
                <Text variant="bodySm" weight={selected ? 'bold' : 'regular'} style={styles.paymentLabel}>{option.label}</Text>
                {option.icon ? <Icon name={option.icon} size={22} /> : null}
              </Pressable>
            );
          })}
        </View>

        <OrderSummaryCard
          rows={[
            { label: t.common.items, value: price(cart.subtotal) },
            { label: t.checkout.rxLine, value: t.checkout.rxSaved, valueColor: 'green' },
          ]}
          totalLabel={t.common.total}
          totalValue={price(cart.total)}
        />
      </ScreenScroll>

      <BottomBar>
        <Button label={t.checkout.placeOrder} style={styles.cta} onPress={placeOrder} />
      </BottomBar>
    </Screen>
  );
}

function OptionBox({ title, hint, selected, onPress }: { title: string; hint: string; selected: boolean; onPress: () => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} style={[styles.option, styles.optionBox, selected && styles.optionSelected]}>
      <Text variant="bodySm" weight={selected ? 'bold' : 'medium'}>{title}</Text>
      <Text variant="caption" color="textSecondary">{hint}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  address: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  addressBody: { flex: 1, gap: 4 },
  section: { gap: spacing.sm },
  optionRow: { flexDirection: 'row', gap: 10 },
  option: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, overflow: 'hidden' },
  optionBox: { flex: 1, padding: 12, gap: 3 },
  optionSelected: { borderWidth: 1.5, borderColor: colors.navy },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: 14 },
  paymentLabel: { flex: 1 },
  cta: { flex: 1 },
});
