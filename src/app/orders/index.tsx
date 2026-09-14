import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useOrders, type Order } from '@/api';
import { RequireAuth } from '@/auth';
import { EmptyView, ErrorView, LoadingView } from '@/components/feedback';
import { Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { useOrderStatusLabel } from '@/components/orders/status';
import { Button, Card, Icon, Pressable, Text } from '@/components/ui';
import { useLocale } from '@/i18n';
import { radius, spacing, useTheme, useThemedStyles, type Palette } from '@/theme';

export default function OrdersScreen() {
  const { t } = useLocale();
  return (
    <Screen>
      <ScreenHeader showBack title={t.orders.title} />
      <RequireAuth>
        <OrdersBody />
      </RequireAuth>
    </Screen>
  );
}

function OrdersBody() {
  const router = useRouter();
  const { t } = useLocale();
  const orders = useOrders();
  const items = orders.data?.pages.flatMap((p) => p.data) ?? [];

  if (orders.isPending) return <LoadingView />;
  if (orders.isError) return <ErrorView error={orders.error} onRetry={() => orders.refetch()} />;
  if (items.length === 0) {
    return <EmptyView icon="bag" title={t.orders.empty} hint={t.orders.emptyHint} action={{ label: t.cart.browse, onPress: () => router.replace('/(tabs)/categories') }} />;
  }

  return (
    <ScreenScroll gap={spacing.md}>
      {items.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
      {orders.hasNextPage ? <Button label={t.orders.loadMore} variant="outline" size="md" disabled={orders.isFetchingNextPage} onPress={() => orders.fetchNextPage()} /> : null}
    </ScreenScroll>
  );
}

function OrderRow({ order }: { order: Order }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { t, tf, n, price, dateTime } = useLocale();
  const statusLabel = useOrderStatusLabel();
  const tone = order.status === 'cancelled' ? 'textMuted' : order.status === 'delivered' ? 'green' : 'red';

  return (
    <Pressable onPress={() => router.push({ pathname: '/orders/[id]', params: { id: order.id } })} accessibilityRole="button">
      <Card style={styles.row}>
        <View style={styles.iconBox}>
          <Icon name="bag" size={20} color={colors.navy} />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text variant="bodySm" weight="bold">{tf(t.tracking.orderNumber, { id: n(order.number) })}</Text>
            <Text variant="bodySm" weight="bold">{price(order.total)}</Text>
          </View>
          <Text variant="caption" color="textSecondary">{`${dateTime(order.createdAt)} · ${tf(t.orders.itemCount, { count: n(order.itemCount) })}`}</Text>
          <Text variant="caption" color={tone}>{statusLabel(order.status)}</Text>
        </View>
        <Icon name="forward" size={18} color={colors.textMuted} />
      </Card>
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    iconBox: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
    body: { flex: 1, gap: 3 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  });
