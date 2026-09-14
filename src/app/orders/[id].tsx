import { Alert, Linking, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useApiErrorMessage, useCancelOrder, useOrder, type Order } from '@/api';
import { RequireAuth } from '@/auth';
import { ErrorView, LoadingView } from '@/components/feedback';
import { BottomBar, Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { useOrderStatusLabel } from '@/components/orders/status';
import { Button, Card, IconButton, ImageSlot, SectionLabel, Text } from '@/components/ui';
import { formatAmount, useLocale } from '@/i18n';
import { radius, spacing, useThemedStyles, type Palette } from '@/theme';

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen>
      <RequireAuth>
        <OrderBody id={id} />
      </RequireAuth>
    </Screen>
  );
}

function OrderBody({ id }: { id: string }) {
  const order = useOrder(id);
  if (order.isPending) {
    return (
      <>
        <ScreenHeader showBack />
        <LoadingView />
      </>
    );
  }
  if (order.isError) {
    return (
      <>
        <ScreenHeader showBack />
        <ErrorView error={order.error} onRetry={() => order.refetch()} />
      </>
    );
  }
  return <OrderView order={order.data} />;
}

function OrderView({ order }: { order: Order }) {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { t, tf, l, n, price, dateTime } = useLocale();
  const statusLabel = useOrderStatusLabel();
  const cancel = useCancelOrder();
  const errorMessage = useApiErrorMessage();

  // The server returns the rail for this delivery method (cancelled appended when it happens).
  // A pending order matches no step yet, so every step renders as upcoming.
  const rail = order.timeline;
  const isCancelled = order.status === 'cancelled';
  const currentIndex = rail.findIndex((e) => e.status === order.status);

  const confirmCancel = () =>
    Alert.alert(t.tracking.cancelConfirm, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.tracking.cancelOrder, style: 'destructive', onPress: () => cancel.mutateAsync({ id: order.id }).catch((err) => Alert.alert(errorMessage(err))) },
    ]);

  const paymentLabel = { cod: t.tracking.paymentCod, wallet: t.tracking.paymentWallet, card: t.tracking.paymentCard }[order.paymentMethod];

  return (
    <>
      <ScreenHeader
        showBack
        title={tf(t.tracking.orderNumber, { id: n(order.number) })}
        subtitle={`${tf(t.tracking.summary, { count: n(order.itemCount), total: price(order.total) })} · ${dateTime(order.createdAt)}`}
      />

      <ScreenScroll>
        <Card tone="navy" padding={18} style={styles.eta}>
          <Text variant="label" color="onNavyMuted">{isCancelled ? t.tracking.cancelled : t.tracking.eta}</Text>
          <Text variant="displayMd" color="onNavy">
            {isCancelled ? (order.cancelReason ?? '—') : order.eta ? l(order.eta) : order.deliveryMethod === 'pickup' ? t.tracking.pickupEta : t.tracking.etaPending}
          </Text>
        </Card>

        <Card padding={18}>
          {rail.map((event, i) => (
            <TimelineRow
              key={event.status}
              label={statusLabel(event.status)}
              at={event.at ? dateTime(event.at) : null}
              note={event.note}
              state={i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'pending'}
              isLast={i === rail.length - 1}
            />
          ))}
        </Card>

        {order.courier ? (
          <Card style={styles.courier}>
            <ImageSlot style={styles.avatar} />
            <View style={styles.courierBody}>
              <Text variant="bodySm" weight="bold">{tf(t.tracking.courier, { name: order.courier.name })}</Text>
              <Text variant="caption" color="textSecondary">{t.tracking.courierHint}</Text>
            </View>
            {order.courier.phone ? (
              <IconButton icon="phone" variant="navy" size={40} iconSize={19} onPress={() => Linking.openURL(`tel:${order.courier!.phone}`)} accessibilityLabel={t.tracking.courier} />
            ) : null}
          </Card>
        ) : null}

        <Card style={styles.contents}>
          <SectionLabel>{t.tracking.contents}</SectionLabel>
          {order.items.map((item) => {
            const details = [item.variantLabel ? n(item.variantLabel) : null, ...item.addons.map((a) => l(a.name))].filter(Boolean).join(' · ');
            return (
              <View key={item.id} style={styles.lineRow}>
                <ImageSlot style={styles.lineImage} source={item.imageUrl ? { uri: item.imageUrl } : undefined} />
                <View style={styles.lineBody}>
                  <Text variant="bodySm" weight="medium" numberOfLines={1}>{item.code ? `${l(item.name)} ${item.code}` : l(item.name)}</Text>
                  <Text variant="caption" color="textSecondary" numberOfLines={1}>{`${details ? `${details} · ` : ''}×${n(item.quantity)}`}</Text>
                </View>
                <Text variant="bodySm" weight="bold">{formatAmount(item.lineTotal)}</Text>
              </View>
            );
          })}
        </Card>

        <Card style={styles.contents}>
          <SectionLabel>{t.tracking.details}</SectionLabel>
          <DetailRow label={order.deliveryMethod === 'pickup' ? t.checkout.pickup : t.tracking.deliverTo} value={order.deliveryMethod === 'pickup' ? t.tracking.pickupFrom : (order.address?.formatted ?? '—')} />
          <DetailRow label={t.checkout.paymentMethod} value={paymentLabel} />
          {order.promoCode ? <DetailRow label={t.tracking.promo} value={`${order.promoCode} · − ${price(order.discount)}`} /> : null}
          <DetailRow label={t.common.delivery} value={order.deliveryFee === 0 ? t.common.free : price(order.deliveryFee)} />
          {order.customerNote ? <DetailRow label={t.checkout.note} value={order.customerNote} /> : null}
        </Card>
      </ScreenScroll>

      <BottomBar>
        {order.canCancel ? (
          <Button label={t.tracking.cancelOrder} variant="outline" style={styles.cta} disabled={cancel.isPending} onPress={confirmCancel} />
        ) : (
          <Button label={t.tracking.backToOrders} variant="outline" style={styles.cta} onPress={() => (router.canGoBack() ? router.back() : router.replace('/orders'))} />
        )}
      </BottomBar>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.detailRow}>
      <Text variant="caption" color="textSecondary">{label}</Text>
      <Text variant="bodySm" style={styles.detailValue}>{value}</Text>
    </View>
  );
}

type TimelineState = 'done' | 'current' | 'pending';

function TimelineRow({ label, at, note, state, isLast }: { label: string; at: string | null; note: string | null; state: TimelineState; isLast: boolean }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.timelineRow}>
      <View style={styles.rail}>
        <View style={[styles.node, state === 'done' && styles.nodeDone, state === 'current' && styles.nodeCurrent, state === 'pending' && styles.nodePending]} />
        {!isLast ? <View style={[styles.railLine, state === 'done' ? styles.railDone : styles.railPending]} /> : null}
      </View>
      <View style={[styles.timelineBody, !isLast && styles.timelineGap]}>
        <Text variant="bodySm" weight={state === 'pending' ? 'regular' : 'bold'} color={state === 'current' ? 'red' : state === 'pending' ? 'textMuted' : 'text'}>{label}</Text>
        {at ? <Text variant="caption" color="textSecondary">{at}</Text> : null}
        {note ? <Text variant="caption" color="textMuted">{note}</Text> : null}
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    eta: { gap: 6, borderRadius: radius.hero },
    timelineRow: { flexDirection: 'row', gap: 14 },
    rail: { alignItems: 'center', width: 14 },
    node: { width: 14, height: 14, borderRadius: 7 },
    nodeDone: { backgroundColor: colors.navy },
    nodeCurrent: { backgroundColor: colors.red, borderWidth: 5, borderColor: colors.redSoft, width: 24, height: 24, borderRadius: 12, marginTop: -5, marginBottom: -5 },
    nodePending: { borderWidth: 2, borderColor: colors.borderStrong },
    railLine: { width: 2, flex: 1, minHeight: 44 },
    railDone: { backgroundColor: colors.navy },
    railPending: { backgroundColor: colors.border },
    timelineBody: { flex: 1, gap: 2 },
    timelineGap: { paddingBottom: 22 },
    courier: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    courierBody: { flex: 1, gap: 2 },
    contents: { gap: spacing.md },
    lineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    lineImage: { width: 52, height: 52, borderRadius: radius.md },
    lineBody: { flex: 1, gap: 2 },
    detailRow: { gap: 2 },
    detailValue: {},
    cta: { flex: 1 },
  });
