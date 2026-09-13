import { StyleSheet, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { BottomBar, Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { Button, Card, IconButton, ImageSlot, SectionLabel, Text } from '@/components/ui';
import { getOrder, type OrderEvent, type OrderStatus } from '@/data';
import { formatAmount, useLocale } from '@/i18n';
import { radius, spacing, useThemedStyles, type Palette } from '@/theme';

const statusOrder: OrderStatus[] = ['confirmed', 'lab', 'onTheWay', 'delivered'];

export default function OrderTrackingScreen() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tf, l, n, price } = useLocale();

  const order = getOrder(id);
  if (!order) return <Redirect href="/(tabs)/account" />;

  const currentIndex = statusOrder.indexOf(order.currentStatus);
  const statusLabel: Record<OrderStatus, string> = {
    confirmed: t.tracking.confirmed,
    lab: t.tracking.lab,
    onTheWay: t.tracking.onTheWay,
    delivered: t.tracking.delivered,
  };

  return (
    <Screen>
      <ScreenHeader showBack title={tf(t.tracking.orderNumber, { id: order.id })} subtitle={tf(t.tracking.summary, { count: n(order.itemCount), total: price(order.total) })} />

      <ScreenScroll>
        <Card tone="navy" padding={18} style={styles.eta}>
          <Text variant="label" color="onNavyMuted">{t.tracking.eta}</Text>
          <Text variant="displayMd" color="onNavy">{l(order.eta)}</Text>
        </Card>

        <Card padding={18}>
          {order.events.map((event, i) => (
            <TimelineRow
              key={event.status}
              event={event}
              label={statusLabel[event.status]}
              state={i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'pending'}
              isLast={i === order.events.length - 1}
            />
          ))}
        </Card>

        <Card style={styles.courier}>
          <ImageSlot style={styles.avatar} />
          <View style={styles.courierBody}>
            <Text variant="bodySm" weight="bold">{tf(t.tracking.courier, { name: l(order.courier.name) })}</Text>
            <Text variant="caption" color="textSecondary">{t.tracking.courierHint}</Text>
          </View>
          <IconButton icon="phone" variant="navy" size={40} iconSize={19} accessibilityLabel={t.tracking.courier} />
        </Card>

        <Card style={styles.contents}>
          <SectionLabel>{t.tracking.contents}</SectionLabel>
          {order.lines.map((line) => (
            <View key={line.product.id} style={styles.lineRow}>
              <ImageSlot style={styles.lineImage} />
              <View style={styles.lineBody}>
                <Text variant="bodySm" weight="medium">{line.product.code ? `${l(line.product.name)} ${line.product.code}` : l(line.product.name)}</Text>
                <Text variant="caption" color="textSecondary">{`${l(line.variant)} · ×${n(line.quantity)}`}</Text>
              </View>
              <Text variant="bodySm" weight="bold">{formatAmount(line.unitPrice)}</Text>
            </View>
          ))}
        </Card>
      </ScreenScroll>

      <BottomBar>
        <Button label={t.tracking.details} variant="outline" style={styles.cta} onPress={() => router.back()} />
      </BottomBar>
    </Screen>
  );
}

type TimelineState = 'done' | 'current' | 'pending';

function TimelineRow({ event, label, state, isLast }: { event: OrderEvent; label: string; state: TimelineState; isLast: boolean }) {
  const styles = useThemedStyles(makeStyles);
  const { l } = useLocale();
  return (
    <View style={styles.timelineRow}>
      <View style={styles.rail}>
        <View style={[styles.node, state === 'done' && styles.nodeDone, state === 'current' && styles.nodeCurrent, state === 'pending' && styles.nodePending]} />
        {!isLast ? <View style={[styles.railLine, state === 'done' ? styles.railDone : styles.railPending]} /> : null}
      </View>
      <View style={[styles.timelineBody, !isLast && styles.timelineGap]}>
        <Text variant="bodySm" weight={state === 'pending' ? 'regular' : 'bold'} color={state === 'current' ? 'red' : state === 'pending' ? 'textMuted' : 'text'}>{label}</Text>
        {event.at ? <Text variant="caption" color="textSecondary">{l(event.at)}</Text> : null}
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
  cta: { flex: 1 },
});
