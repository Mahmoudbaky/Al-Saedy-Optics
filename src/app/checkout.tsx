import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAddresses, useApiErrorMessage, useCart, useCheckout, type Cart, type DeliveryMethod, type PaymentMethod } from '@/api';
import { RequireAuth } from '@/auth';
import { OrderSummaryCard } from '@/components/cart';
import { EmptyView, ErrorView, LoadingView } from '@/components/feedback';
import { BottomBar, Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { Button, Card, Icon, Pressable, RadioDot, SectionLabel, Text, TextField, type IconName } from '@/components/ui';
import { useLocale } from '@/i18n';
import { radius, spacing, useThemedStyles, type Palette } from '@/theme';

export default function CheckoutScreen() {
  const { t } = useLocale();
  return (
    <Screen>
      <ScreenHeader showBack title={t.checkout.title} />
      <RequireAuth>
        <CheckoutBody />
      </RequireAuth>
    </Screen>
  );
}

function CheckoutBody() {
  const router = useRouter();
  const { t } = useLocale();
  const cart = useCart();
  if (cart.isLoading) return <LoadingView />;
  if (cart.error && !cart.cart) return <ErrorView error={cart.error} onRetry={() => cart.refetch()} />;
  if (!cart.cart || cart.cart.items.length === 0) {
    return <EmptyView icon="bag" title={t.cart.empty} action={{ label: t.cart.browse, onPress: () => router.replace('/(tabs)/categories') }} />;
  }
  return <CheckoutForm cart={cart.cart} />;
}

function CheckoutForm({ cart }: { cart: Cart }) {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { t, tf, n, price } = useLocale();
  const errorMessage = useApiErrorMessage();
  const addresses = useAddresses();
  const checkout = useCheckout();
  const [delivery, setDelivery] = useState<DeliveryMethod>('home');
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [note, setNote] = useState('');

  const address = addresses.data?.find((a) => a.isDefault) ?? addresses.data?.[0];
  const { summary, prescription, requiresPrescription } = cart;
  // Mirrors `deliveryFeeFor` on the server: pickup is free, home delivery is free above the threshold.
  const deliveryFee = delivery === 'pickup' ? 0 : summary.deliveryFee;
  const total = summary.subtotal - summary.discount + deliveryFee;
  const missingRx = requiresPrescription && !prescription;
  const missingAddress = delivery === 'home' && !address;
  const canPlace = !missingRx && !missingAddress && !checkout.isPending && !addresses.isPending;

  const placeOrder = async () => {
    try {
      const order = await checkout.mutateAsync({
        deliveryMethod: delivery,
        paymentMethod: payment,
        addressId: delivery === 'home' ? address?.id : undefined,
        prescriptionId: prescription?.id,
        note: note.trim() || undefined,
      });
      router.replace({ pathname: '/orders/[id]', params: { id: order.id } });
    } catch (err) {
      Alert.alert(errorMessage(err));
    }
  };

  const paymentOptions: { id: PaymentMethod; label: string; icon?: IconName }[] = [
    { id: 'cod', label: t.checkout.cod, icon: 'cash' },
    { id: 'wallet', label: t.checkout.wallet },
    { id: 'card', label: t.checkout.card },
  ];

  return (
    <>
      <ScreenScroll gap={14}>
        {delivery === 'home' ? (
          <Pressable onPress={() => router.push('/addresses')} accessibilityRole="button">
            <Card style={styles.address}>
              <Icon name="pin" size={20} />
              <View style={styles.addressBody}>
                <Text variant="bodySm" weight="bold">{address?.label ?? t.checkout.address}</Text>
                {addresses.isPending ? (
                  <Text variant="label" color="textMuted">{t.common.loading}</Text>
                ) : address ? (
                  <Text variant="label" color="textSecondary">{`${address.formatted}\n${n(address.phone)}`}</Text>
                ) : (
                  <Text variant="label" color="red">{t.checkout.noAddress}</Text>
                )}
              </View>
              <Text variant="label" color="red">{address ? t.common.change : t.checkout.addAddress}</Text>
            </Card>
          </Pressable>
        ) : null}

        <View style={styles.section}>
          <SectionLabel>{t.checkout.deliveryMethod}</SectionLabel>
          <View style={styles.optionRow}>
            <OptionBox
              title={t.checkout.homeDelivery}
              hint={tf(t.checkout.homeDeliveryFee, { fee: summary.deliveryFee === 0 ? t.common.free : price(summary.deliveryFee) })}
              selected={delivery === 'home'}
              onPress={() => setDelivery('home')}
            />
            <OptionBox title={t.checkout.pickup} hint={t.checkout.pickupHintShort} selected={delivery === 'pickup'} onPress={() => setDelivery('pickup')} />
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

        <TextField label={t.checkout.note} value={note} onChangeText={setNote} placeholder={t.checkout.notePlaceholder} maxLength={500} multiline />

        <OrderSummaryCard
          rows={[
            { label: t.common.items, value: price(summary.subtotal) },
            ...(summary.discount > 0 ? [{ label: t.cart.discount, value: `− ${price(summary.discount)}`, valueColor: 'green' as const }] : []),
            { label: t.common.delivery, value: deliveryFee === 0 ? t.common.free : price(deliveryFee), valueColor: deliveryFee === 0 ? ('green' as const) : ('text' as const) },
            ...(requiresPrescription
              ? [{ label: t.checkout.rxLine, value: prescription ? t.checkout.rxSaved : t.checkout.rxMissing, valueColor: prescription ? ('green' as const) : ('red' as const) }]
              : []),
          ]}
          totalLabel={t.common.total}
          totalValue={price(total)}
        />
        {missingRx ? (
          <Pressable onPress={() => router.push('/prescription')} accessibilityRole="button">
            <Text variant="caption" color="red" align="center">{t.cart.rxRequiredHint}</Text>
          </Pressable>
        ) : null}
      </ScreenScroll>

      <BottomBar>
        <Button label={checkout.isPending ? t.checkout.placing : t.checkout.placeOrder} style={styles.cta} disabled={!canPlace} onPress={placeOrder} />
      </BottomBar>
    </>
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
