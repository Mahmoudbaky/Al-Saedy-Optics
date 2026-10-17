import { StyleSheet, View } from 'react-native';

import type { AppointmentSummary, CartLineRx as CartLineRxDto, LineRxState } from '@/api';
import { Button, Icon, Pressable, Text, type IconName } from '@/components/ui';
import { useLocale } from '@/i18n';
import { radius, spacing, useTheme, useThemedStyles, type Palette } from '@/theme';

export interface CartLineRxProps {
  rx: CartLineRxDto;
  /** Option 1 – pick one of my saved prescriptions. */
  onChoosePrescription: () => void;
  /** Option 2 – book an eye exam for this item. */
  onBookExam: () => void;
  /** Option 2b – link an upcoming visit I already booked (shown only when one exists). */
  upcomingAppointment?: AppointmentSummary | null;
  onLinkAppointment?: (appointmentId: string) => void;
  onClear: () => void;
  busy?: boolean;
}

/**
 * Prescription strip under a cart line. Products that need a prescription must be
 * fulfilled per item: either with a saved prescription or with an eye exam whose
 * result the clinic records later.
 */
export function CartLineRx({ rx, onChoosePrescription, onBookExam, upcomingAppointment, onLinkAppointment, onClear, busy = false }: CartLineRxProps) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const { t, tf, l, n, dateTime } = useLocale();
  if (!rx.required) return null;

  const tone = toneOf(rx.state);
  const iconColor = colors[tone.text];
  const needsChoice = rx.state === 'missing' || rx.state === 'rejected' || rx.state === 'expired' || rx.state === 'examCancelled';

  let detail: string | null = null;
  if (rx.prescription) {
    detail = n(`OD ${rx.prescription.od.sph ?? '—'} · OS ${rx.prescription.os.sph ?? '—'}${rx.prescription.pd ? ` · PD ${rx.prescription.pd}` : ''}`);
  } else if (rx.appointment) {
    detail = tf(t.cart.rxExamWith, { doctor: l(rx.appointment.doctor.name), time: dateTime(rx.appointment.scheduledAt) });
  }

  return (
    <View style={[styles.wrap, styles[tone.wrap]]}>
      <View style={styles.row}>
        <Icon name={tone.icon} size={16} color={iconColor} />
        <View style={styles.body}>
          <Text variant="caption" weight="medium" color={tone.text}>{t.cart.rxState[rx.state]}</Text>
          {detail ? <Text variant="tiny" color="textSecondary" numberOfLines={1}>{detail}</Text> : null}
          {rx.issue && needsChoice ? <Text variant="tiny" color="red">{rx.issue}</Text> : null}
        </View>
        {!needsChoice ? (
          <Pressable onPress={onClear} disabled={busy} hitSlop={8} accessibilityRole="button" accessibilityLabel={t.common.change}>
            <Text variant="tiny" color="red">{t.common.change}</Text>
          </Pressable>
        ) : null}
      </View>

      {needsChoice ? (
        <View style={styles.actions}>
          <Button label={t.cart.rxUseSaved} variant="outline" size="sm" style={styles.action} disabled={busy} onPress={onChoosePrescription} />
          <Button label={t.cart.rxBookExam} variant="navy" size="sm" style={styles.action} disabled={busy} onPress={onBookExam} />
          {upcomingAppointment && onLinkAppointment ? (
            <Pressable onPress={() => onLinkAppointment(upcomingAppointment.id)} disabled={busy} accessibilityRole="button" style={styles.link}>
              <Text variant="tiny" color="navy" align="center">{tf(t.cart.rxUseVisit, { time: dateTime(upcomingAppointment.scheduledAt) })}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function toneOf(state: LineRxState): { icon: IconName; text: 'green' | 'red' | 'textSecondary' | 'navy'; wrap: 'ok' | 'warn' | 'wait' } {
  switch (state) {
    case 'verified':
      return { icon: 'check', text: 'green', wrap: 'ok' };
    case 'pending':
      return { icon: 'rxCard', text: 'textSecondary', wrap: 'wait' };
    case 'awaitingExam':
      return { icon: 'calendar', text: 'navy', wrap: 'wait' };
    default:
      return { icon: 'info', text: 'red', wrap: 'warn' };
  }
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    wrap: { borderRadius: radius.md, padding: 10, gap: spacing.sm, marginTop: 6 },
    ok: { backgroundColor: colors.surfaceMuted },
    warn: { backgroundColor: colors.redSoft },
    wait: { backgroundColor: colors.background },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    body: { flex: 1, gap: 1 },
    actions: { gap: 6 },
    action: { minHeight: 36 },
    link: { paddingVertical: 4 },
  });
