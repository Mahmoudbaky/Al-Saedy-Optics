import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BottomBar, Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { Button, Card, Chip, Icon, ImageSlot, Pressable, SectionLabel, Text, Toggle } from '@/components/ui';
import { examDays, examDoctor, examSlots } from '@/data';
import { useLocale } from '@/i18n';
import { radius, spacing, useThemedStyles, type Palette } from '@/theme';

type Reason = 'exam' | 'rx' | 'contacts';

export default function BookExamScreen() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { t, l, n } = useLocale();
  const [dayId, setDayId] = useState(examDays[0].id);
  const [slotId, setSlotId] = useState('16:00');
  const [reason, setReason] = useState<Reason>('exam');
  const [remind, setRemind] = useState(true);

  const reasons: { id: Reason; label: string }[] = [
    { id: 'exam', label: t.booking.reasonExam },
    { id: 'rx', label: t.booking.reasonRx },
    { id: 'contacts', label: t.booking.reasonContacts },
  ];

  const confirm = () => {
    Alert.alert(t.booking.confirmed, undefined, [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <Screen>
      <ScreenHeader showBack title={t.booking.title} />

      <ScreenScroll>
        <Card style={styles.doctor}>
          <ImageSlot style={styles.doctorImage} />
          <View style={styles.doctorBody}>
            <Text variant="body" weight="bold">{l(examDoctor.name)}</Text>
            <Text variant="caption" color="textSecondary">{t.booking.doctorSpecialty}</Text>
            <Text variant="caption" color="green">{t.booking.freeWithPurchase}</Text>
          </View>
        </Card>

        <View style={styles.section}>
          <SectionLabel>{t.booking.date}</SectionLabel>
          <View style={styles.dayRow}>
            {examDays.map((day) => {
              const selected = day.id === dayId;
              return (
                <Pressable key={day.id} onPress={() => setDayId(day.id)} accessibilityRole="radio" accessibilityState={{ selected }} style={[styles.day, selected && styles.daySelected]}>
                  <Text variant="caption" color={selected ? 'onNavy' : 'textSecondary'} style={selected && styles.dayWeekday}>{l(day.weekday)}</Text>
                  <Text variant="bodyLg" weight="bold" color={selected ? 'onNavy' : 'text'}>{n(day.day)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <SectionLabel>{t.booking.time}</SectionLabel>
          <View style={styles.slotGrid}>
            {examSlots.map((slot) => {
              const selected = slot.id === slotId;
              return (
                <Pressable
                  key={slot.id}
                  disabled={!slot.available}
                  onPress={() => setSlotId(slot.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected, disabled: !slot.available }}
                  style={[styles.slot, selected && styles.slotSelected, !slot.available && styles.slotDisabled]}
                >
                  <Text variant="bodySm" weight={selected ? 'bold' : 'regular'} color={selected ? 'onNavy' : slot.available ? 'text' : 'textDisabled'} style={!slot.available && styles.strike}>
                    {l(slot.time)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
            {reasons.map((r) => <Chip key={r.id} variant="outlined" label={r.label} selected={reason === r.id} onPress={() => setReason(r.id)} />)}
          </View>
        </View>

        <Card style={styles.row}>
          <Icon name="bell" size={20} />
          <View style={styles.rowBody}>
            <Text variant="label">{t.booking.reminder}</Text>
          </View>
          <Toggle value={remind} onValueChange={setRemind} />
        </Card>
      </ScreenScroll>

      <BottomBar>
        <Button label={t.booking.confirm} style={styles.cta} onPress={confirm} />
      </BottomBar>
    </Screen>
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
