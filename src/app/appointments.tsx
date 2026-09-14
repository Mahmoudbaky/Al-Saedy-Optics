import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useApiErrorMessage, useAppointments, useCancelAppointment, type Appointment, type AppointmentStatus } from '@/api';
import { RequireAuth } from '@/auth';
import { EmptyView, ErrorView, LoadingView } from '@/components/feedback';
import { BottomBar, Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { Button, Card, Icon, ImageSlot, Pressable, SectionLabel, Text } from '@/components/ui';
import { useLocale } from '@/i18n';
import { radius, spacing, useTheme, useThemedStyles, type Palette } from '@/theme';

export default function AppointmentsScreen() {
  const router = useRouter();
  const { t } = useLocale();
  return (
    <Screen>
      <ScreenHeader showBack title={t.booking.myAppointments} />
      <RequireAuth>
        <AppointmentsBody />
      </RequireAuth>
      <BottomBar>
        <Button label={t.booking.book} style={styles.cta} onPress={() => router.push('/book-exam')} />
      </BottomBar>
    </Screen>
  );
}

function AppointmentsBody() {
  const { t } = useLocale();
  const appointments = useAppointments();

  if (appointments.isPending) return <LoadingView />;
  if (appointments.isError) return <ErrorView error={appointments.error} onRetry={() => appointments.refetch()} />;
  if (appointments.data.length === 0) return <EmptyView icon="calendar" title={t.booking.empty} />;

  // Live bookings are "upcoming"; the server flips them to completed / noShow after the slot.
  const isUpcoming = (a: Appointment) => a.status === 'booked' || a.status === 'confirmed';
  const upcoming = appointments.data.filter(isUpcoming).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const past = appointments.data.filter((a) => !isUpcoming(a)).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));

  return (
    <ScreenScroll gap={spacing.md}>
      {upcoming.length ? <SectionLabel>{t.booking.upcoming}</SectionLabel> : null}
      {upcoming.map((a) => (
        <AppointmentRow key={a.id} appointment={a} />
      ))}
      {past.length ? <SectionLabel>{t.booking.past}</SectionLabel> : null}
      {past.map((a) => (
        <AppointmentRow key={a.id} appointment={a} />
      ))}
    </ScreenScroll>
  );
}

function AppointmentRow({ appointment: a }: { appointment: Appointment }) {
  const rowStyles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const { t, l, dateTime } = useLocale();
  const cancel = useCancelAppointment();
  const errorMessage = useApiErrorMessage();

  const statusLabel: Record<AppointmentStatus, string> = {
    booked: t.booking.statusBooked,
    confirmed: t.booking.statusConfirmed,
    completed: t.booking.statusCompleted,
    cancelled: t.booking.statusCancelled,
    noShow: t.booking.statusNoShow,
  };
  const reasonLabel = { exam: t.booking.reasonExam, rx: t.booking.reasonRx, contacts: t.booking.reasonContacts }[a.reason];
  const tone = a.status === 'cancelled' || a.status === 'noShow' ? 'textMuted' : a.status === 'completed' ? 'green' : 'red';

  const confirmCancel = () =>
    Alert.alert(t.booking.cancelConfirm, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.booking.cancelAppointment, style: 'destructive', onPress: () => cancel.mutateAsync(a.id).catch((err) => Alert.alert(errorMessage(err))) },
    ]);

  return (
    <Card style={rowStyles.row}>
      <ImageSlot style={rowStyles.avatar} source={a.doctor.imageUrl ? { uri: a.doctor.imageUrl } : undefined} />
      <View style={rowStyles.body}>
        <Text variant="bodySm" weight="bold">{dateTime(a.scheduledAt)}</Text>
        <Text variant="caption" color="textSecondary">{`${l(a.doctor.name)} · ${reasonLabel}`}</Text>
        <Text variant="caption" color={tone}>{statusLabel[a.status]}</Text>
      </View>
      {a.canCancel ? (
        <Pressable onPress={confirmCancel} hitSlop={10} accessibilityRole="button" accessibilityLabel={t.booking.cancelAppointment} disabled={cancel.isPending}>
          <Icon name="close" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </Card>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface },
    avatar: { width: 44, height: 44, borderRadius: radius.md },
    body: { flex: 1, gap: 2 },
  });

const styles = StyleSheet.create({
  cta: { flex: 1 },
});
