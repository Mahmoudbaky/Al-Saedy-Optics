import { useState, type ComponentProps } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BottomBar, Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { Button, Card, Divider, Icon, Pressable, SectionLabel, Text } from '@/components/ui';
import { prescriptions, type EyeValues, type Prescription } from '@/data';
import { useLocale } from '@/i18n';
import { useCart } from '@/store';
import { radius, spacing, typography, useTheme, useThemedStyles, type Palette } from '@/theme';

type Mode = 'manual' | 'upload';
type Eye = 'od' | 'os';

const current = prescriptions[0];

export default function PrescriptionScreen() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useLocale();
  const { dispatch } = useCart();
  const [mode, setMode] = useState<Mode>('manual');
  const [values, setValues] = useState<Record<Eye, EyeValues>>({ od: current.od, os: current.os });
  const [pd, setPd] = useState(current.pd);
  const [add, setAdd] = useState(current.add ?? '');

  const update = (eye: Eye, field: keyof EyeValues, value: string) =>
    setValues((prev) => ({ ...prev, [eye]: { ...prev[eye], [field]: value } }));

  const save = () => {
    dispatch({ type: 'attachPrescription', prescriptionId: current.id });
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader showBack title={t.prescription.title} />

      <ScreenScroll>
        <View style={styles.segmented}>
          <SegmentButton label={t.prescription.manual} selected={mode === 'manual'} onPress={() => setMode('manual')} />
          <SegmentButton label={t.prescription.upload} selected={mode === 'upload'} onPress={() => setMode('upload')} />
        </View>

        {mode === 'manual' ? (
          <Card style={styles.form}>
            <View style={styles.gridRow}>
              <View style={styles.eyeLabel} />
              {(['SPH', 'CYL', 'AXIS'] as const).map((h) => <Text key={h} variant="caption" color="textSecondary" align="center" style={styles.cell}>{h}</Text>)}
            </View>
            <EyeRow label={t.prescription.rightEye} code="OD" values={values.od} onChange={(f, v) => update('od', f, v)} />
            <EyeRow label={t.prescription.leftEye} code="OS" values={values.os} onChange={(f, v) => update('os', f, v)} />
            <View style={styles.pdRow}>
              <Field label={t.prescription.pd} value={pd} onChangeText={setPd} suffix={t.prescription.pdUnit} />
              <Field label={t.prescription.add} value={add} onChangeText={setAdd} placeholder={t.common.optional} />
            </View>
          </Card>
        ) : null}

        <Card tone="dashed" padding={18} style={styles.upload}>
          <View style={styles.iconBox}><Icon name="image" size={22} /></View>
          <View style={styles.uploadText}>
            <Text variant="bodySm" weight="medium">{t.prescription.uploadTitle}</Text>
            <Text variant="caption" color="textSecondary">{t.prescription.uploadSubtitle}</Text>
          </View>
        </Card>

        <Card style={styles.saved}>
          <SectionLabel>{t.prescription.saved}</SectionLabel>
          {prescriptions.map((rx, i) => (
            <View key={rx.id} style={styles.savedList}>
              {i > 0 ? <Divider tone="muted" /> : null}
              <SavedRow rx={rx} />
            </View>
          ))}
        </Card>

        <Pressable onPress={() => router.push('/book-exam')} accessibilityRole="button">
          <Card tone="navy" padding={13} style={styles.banner}>
            <Icon name="info" size={20} color={colors.onNavy} />
            <Text variant="label" color="onNavy" style={styles.bannerText}>{t.prescription.bookHint}</Text>
          </Card>
        </Pressable>
      </ScreenScroll>

      <BottomBar>
        <Button label={t.prescription.save} style={styles.cta} onPress={save} />
      </BottomBar>
    </Screen>
  );
}

function SavedRow({ rx }: { rx: Prescription }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const { t, l } = useLocale();
  const verified = rx.status === 'verified';
  return (
    <View style={styles.savedRow}>
      <View style={styles.iconBoxSm}><Icon name="bookmark" size={19} color={verified ? colors.navy : colors.textMuted} /></View>
      <View style={styles.savedBody}>
        <Text variant="bodySm" weight="medium" color={verified ? 'text' : 'textSecondary'}>{l(rx.doctor)}</Text>
        <Text variant="caption" color={verified ? 'textSecondary' : 'textMuted'}>{`${l(rx.issuedOn)} · ${verified ? t.prescription.validOneYear : t.prescription.expired}`}</Text>
      </View>
      {verified ? <Text variant="caption" color="green">{t.prescription.verified}</Text> : null}
    </View>
  );
}

function SegmentButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected }} style={[styles.segment, selected && styles.segmentSelected]}>
      <Text variant="bodySm" color={selected ? 'text' : 'textSecondary'} weight={selected ? 'bold' : 'regular'}>{label}</Text>
    </Pressable>
  );
}

function EyeRow({ label, code, values, onChange }: { label: string; code: string; values: EyeValues; onChange: (field: keyof EyeValues, value: string) => void }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.gridRow}>
      <View style={styles.eyeLabel}>
        <Text variant="label" weight="bold">{label}</Text>
        <Text variant="tiny" color="textMuted">{code}</Text>
      </View>
      {(['sph', 'cyl', 'axis'] as const).map((field) => (
        <TextInput
          key={field}
          value={values[field]}
          onChangeText={(v) => onChange(field, v)}
          placeholder="—"
          placeholderTextColor={colors.textMuted}
          keyboardType="numbers-and-punctuation"
          textAlign="center"
          style={[styles.cell, styles.inputBox, styles.inputText]}
        />
      ))}
    </View>
  );
}

function Field({ label, suffix, ...input }: { label: string; suffix?: string } & ComponentProps<typeof TextInput>) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Text variant="caption" color="textSecondary">{label}</Text>
      <View style={[styles.inputBox, styles.fieldInput]}>
        <TextInput placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" style={styles.fieldText} {...input} />
        {suffix ? <Text variant="bodySm">{suffix}</Text> : null}
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  segmented: { flexDirection: 'row', backgroundColor: colors.canvas, borderRadius: radius.lg, padding: 4 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 9, overflow: 'hidden' },
  segmentSelected: { backgroundColor: colors.surface },
  form: { gap: spacing.md },
  gridRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eyeLabel: { width: 58 },
  cell: { flex: 1 },
  inputText: { ...typography.bodySm, color: colors.text },
  inputBox: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  pdRow: { flexDirection: 'row', gap: 10 },
  field: { flex: 1, gap: 5 },
  fieldInput: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 0 },
  fieldText: { ...typography.bodySm, color: colors.text, flex: 1, paddingVertical: 11 },
  upload: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  uploadText: { flex: 1, gap: 3 },
  iconBox: { width: 42, height: 42, borderRadius: radius.lg, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  iconBoxSm: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  saved: { gap: 10 },
  savedList: { gap: 10 },
  savedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  savedBody: { flex: 1, gap: 2 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: radius.xl, paddingHorizontal: 14 },
  bannerText: { flex: 1 },
  cta: { flex: 1 },
});
