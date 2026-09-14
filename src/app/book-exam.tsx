import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useApiErrorMessage, useAvailability, useBookAppointment, useDoctors, type AppointmentReason, type Availability } from '@/api';
import { useAuth } from '@/auth';
import { ErrorView, LoadingView } from '@/components/feedback';
import { BottomBar, Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { Button, Card, Chip, Icon, ImageSlot, Pressable, SectionLabel, Text, TextField, Toggle } from '@/components/ui';
import { formatDayNumber, useLocale } from '@/i18n';
import { radius, spacing, useThemedStyles, type Palette } from '@/theme';

export default function BookExamScreen() {
  const { t } = useLocale();
  const doctors = useDoctors();
  const [doctorId, setDoctorId] = useState<string | undefined>();
  const activeDoctorId = doctorId ?? doctors.data?.[0]?.id;
  const availability = useAvailability({ doctorId: activeDoctorId, days: 7 }, { enabled: !!activeDoctorId });

  return (
    <Screen>
      <ScreenHeader showBack title={t.booking.title} />
      {doctors.isPending || (availability.isPending && !!activeDoctorId) ? (
        <LoadingView />
      ) : doctors.isError ? (
        <ErrorView error={doctors.error} onRetry={() => doctors.refetch()} />
      ) : availability.isError ? (
        <ErrorView error={availability.error} onRetry={() => availability.refetch()} />
      ) : availability.data ? (
        <BookingForm
          key={availability.data.doctor.id}
          availability={availability.data}
          doctors={doctors.data.map((d) => d.id)}
          onDoctorChange={setDoctorId}
          doctorOptions={doctors.data.map((d) => ({ id: d.id, name: d.name }))}
        />
      ) : (
        <ErrorView error={null} />
      )}
    </Screen>
  );
}

interface BookingFormProps {
  availability: Availability;
  doctors: string[];
  doctorOptions: { id: string; name: { ar: string; en: string } }[];
  onDoctorChange: (id: string) => void;
}

function BookingForm({ availability, doctorOptions, onDoctorChange }: BookingFormProps) {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { t, l, n, locale, weekday, dateTime } = useLocale();
  const { user } = useAuth();
  const book = useBookAppointment();
  const errorMessage = useApiErrorMessage();

  const days = availability.days;
  const [dayIndex, setDayIndex] = useState(() => Math.max(0, days.findIndex((d) => d.slots.some((s) => s.available))));
  const [slotAt, setSlotAt] = useState<string | null>(null);
  const [reason, setReason] = useState<AppointmentReason>('exam');
  const [remind, setRemind] = useState(true);
  const [notes, setNotes] = useState('');

  const day = days[dayIndex];
  const reasons: { id: AppointmentReason; label: string }[] = [
    { id: 'exam', label: t.booking.reasonExam },
    { id: 'rx', label: t.booking.reasonRx },
    { id: 'contacts', label: t.booking.reasonContacts },
  ];

  const confirm = async () => {
    if (!user) return router.push('/(auth)/sign-in');
    if (!slotAt) return Alert.alert(t.booking.selectSlot);
    try {
      const appt = await book.mutateAsync({ doctorId: availability.doctor.id, scheduledAt: slotAt, reason, remindMe: remind, notes: notes.trim() || undefined });
      Alert.alert(t.booking.confirmed, dateTime(appt.scheduledAt), [{ text: t.common.done, onPress: () => router.replace('/appointments') }]);
    } catch (err) {
      Alert.alert(errorMessage(err));
      setSlotAt(null);
    }
  };

  return (
    <>
      <ScreenScroll>
        <Card style={styles.doctor}>
          <ImageSlot style={styles.doctorImage} source={availability.doctor.imageUrl ? { uri: availability.doctor.imageUrl } : undefined} />
          <View style={styles.doctorBody}>
            <Text variant="body" weight="bold">{l(availability.doctor.name)}</Text>
            <Text variant="caption" color="textSecondary">{availability.doctor.specialty ? l(availability.doctor.specialty) : t.booking.doctorSpecialty}</Text>
            <Text variant="caption" color="green">{t.booking.freeWithPurchase}</Text>
          </View>
        </Card>

        {doctorOptions.length > 1 ? (
          <View style={styles.section}>
            <SectionLabel>{t.booking.doctor}</SectionLabel>
            <View style={styles.chips}>
              {doctorOptions.map((d) => (
                <Chip key={d.id} variant="outlined" label={l(d.name)} selected={d.id === availability.doctor.id} onPress={() => onDoctorChange(d.id)} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionLabel>{t.booking.date}</SectionLabel>
          <View style={styles.dayRow}>
            {days.map((d, i) => {
              const selected = i === dayIndex;
              const closed = d.slots.length === 0;
              return (
                <Pressable
                  key={d.date}
                  onPress={() => {
                    setDayIndex(i);
                    setSlotAt(null);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[styles.day, selected && styles.daySelected, closed && styles.dayClosed]}
                >
                  <Text variant="caption" color={selected ? 'onNavy' : 'textSecondary'} style={selected && styles.dayWeekday}>{weekday(d.date)}</Text>
                  <Text variant="bodyLg" weight="bold" color={selected ? 'onNavy' : closed ? 'textDisabled' : 'text'}>{formatDayNumber(d.date, locale)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <SectionLabel>{t.booking.time}</SectionLabel>
          {day && day.slots.length ? (
            <View style={styles.slotGrid}>
              {day.slots.map((slot) => {
                const selected = slot.startsAt === slotAt;
                return (
                  <Pressable
                    key={slot.startsAt}
                    disabled={!slot.available}
                    onPress={() => setSlotAt(slot.startsAt)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected, disabled: !slot.available }}
                    style={[styles.slot, selected && styles.slotSelected, !slot.available && styles.slotDisabled]}
                  >
                    <Text variant="bodySm" weight={selected ? 'bold' : 'regular'} color={selected ? 'onNavy' : slot.available ? 'text' : 'textDisabled'} style={!slot.available && styles.strike}>
                      {n(slot.time)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text variant="bodySm" color="textMuted">{day?.slots.length === 0 ? t.booking.closed : t.booking.noSlots}</Text>
          )}
        </View>

        <Card style={styles.row}>
          <Icon name="pin" size={20} />
          <View style={styles.rowBody}>
            <Text variant="label">{t.booking.location}</Text>
            <Text variant="label" color="textSecondary">{t.booking.locationHint}</Text>
          </View>
        </Card>

        <View style={styles.section}>
          <SectionLabel>{t.booking.reason}</SectionLabel>
          <View style={styles.chips}>
            {reasons.map((r) => (
              <Chip key={r.id} variant="outlined" label={r.label} selected={reason === r.id} onPress={() => setReason(r.id)} />
            ))}
          </View>
        </View>

        <TextField label={t.booking.notes} value={notes} onChangeText={setNotes} placeholder={t.booking.notesPlaceholder} maxLength={300} />

        <Card style={styles.row}>
          <Icon name="bell" size={20} />
          <View style={styles.rowBody}>
            <Text variant="label">{t.booking.reminder}</Text>
          </View>
          <Toggle value={remind} onValueChange={setRemind} />
        </Card>
      </ScreenScroll>

      <BottomBar>
        <Button label={book.isPending ? t.booking.booking : user ? t.booking.confirm : t.common.signIn} style={styles.cta} disabled={book.isPending} onPress={confirm} />
      </BottomBar>
    </>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    doctor: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    doctorImage: { width: 56, height: 56, borderRadius: radius.xl },
    doctorBody: { flex: 1, gap: 3 },
    section: { gap: 9 },
    dayRow: { flexDirection: 'row', gap: spacing.sm },
    day: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 12, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    daySelected: { backgroundColor: colors.navy, borderColor: colors.navy },
    dayClosed: { opacity: 0.6 },
    dayWeekday: { opacity: 0.75 },
    slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    slot: { width: '31.5%', flexGrow: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    slotSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
    slotDisabled: { backgroundColor: colors.canvas, borderColor: colors.canvas },
    strike: { textDecorationLine: 'line-through' },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    rowBody: { flex: 1, gap: 2 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    cta: { flex: 1 },
  });
