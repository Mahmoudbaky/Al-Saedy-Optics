import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { useMarkNotificationsRead, useNotifications, type AppNotification } from '@/api';
import { RequireAuth } from '@/auth';
import { EmptyView, ErrorView, LoadingView } from '@/components/feedback';
import { Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { Button, Card, Icon, Pressable, Text } from '@/components/ui';
import { useLocale } from '@/i18n';
import { radius, spacing, useTheme, useThemedStyles, type Palette } from '@/theme';

export default function NotificationsScreen() {
  const { t } = useLocale();
  return (
    <Screen>
      <ScreenHeader showBack title={t.notifications.title} />
      <RequireAuth>
        <NotificationsBody />
      </RequireAuth>
    </Screen>
  );
}

function NotificationsBody() {
  const { t } = useLocale();
  const notifications = useNotifications();
  const markRead = useMarkNotificationsRead();
  const items = notifications.data?.pages.flatMap((p) => p.data) ?? [];
  const unread = notifications.data?.pages[0]?.meta.unread ?? 0;

  // Opening the screen counts as reading everything, like most inboxes.
  useEffect(() => {
    if (unread > 0 && !markRead.isPending) markRead.mutate('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unread]);

  if (notifications.isPending) return <LoadingView />;
  if (notifications.isError) return <ErrorView error={notifications.error} onRetry={() => notifications.refetch()} />;
  if (items.length === 0) return <EmptyView icon="bell" title={t.notifications.empty} />;

  return (
    <ScreenScroll gap={spacing.sm}>
      {items.map((item) => (
        <NotificationRow key={item.id} item={item} />
      ))}
      {notifications.hasNextPage ? <Button label={t.orders.loadMore} variant="outline" size="md" disabled={notifications.isFetchingNextPage} onPress={() => notifications.fetchNextPage()} /> : null}
    </ScreenScroll>
  );
}

function NotificationRow({ item }: { item: AppNotification }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { l, dateTime } = useLocale();
  const unread = !item.readAt;

  const open = () => {
    if (!item.link) return;
    // Links use order numbers ("/orders/10428"); the detail route takes the id, so send those to the list.
    const link = /^\/orders\/\d+$/.test(item.link) ? '/orders' : item.link.replace(/^\/categories/, '/(tabs)/categories');
    router.push(link as Href);
  };

  return (
    <Pressable onPress={open} accessibilityRole={item.link ? 'button' : undefined}>
      <Card style={styles.row} padding={13}>
        <View style={[styles.dot, { backgroundColor: unread ? colors.red : 'transparent' }]} />
        <View style={styles.body}>
          <Text variant="bodySm" weight={unread ? 'bold' : 'medium'}>{l(item.title)}</Text>
          <Text variant="caption" color="textSecondary">{l(item.body)}</Text>
          <Text variant="tiny" color="textMuted">{dateTime(item.createdAt)}</Text>
        </View>
        {item.link ? <Icon name="forward" size={16} color={colors.textMuted} /> : null}
      </Card>
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg },
    dot: { width: 8, height: 8, borderRadius: 4 },
    body: { flex: 1, gap: 2 },
  });
