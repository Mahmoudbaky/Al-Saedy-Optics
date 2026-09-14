import { useState, type ComponentProps } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ApiError, useApiErrorMessage, useCart, useCreatePrescription, useDeletePrescription, usePrescriptions, type Prescription } from '@/api';
import { RequireAuth } from '@/auth';
import { EmptyView, ErrorView, LoadingView } from '@/components/feedback';
import { BottomBar, Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { Button, Card, Divider, Icon, Pressable, SectionLabel, Text, TextField } from '@/components/ui';
import { useLocale } from '@/i18n';
import { radius, spacing, typography, useTheme, useThemedStyles, type Palette } from '@/theme';

type Mode = 'manual' | 'upload';
type Eye = 'od' | 'os';
type EyeField = 'sph' | 'cyl' | 'axis';
type EyeForm = Record<EyeField, string>;

const emptyEye: EyeForm = { sph: '', cyl: '', axis: '' };

export default function PrescriptionScreen() {
  const { t } = useLocale();
  return (
    <Screen>
      <ScreenHeader showBack title={t.prescription.title} />
      <RequireAuth>
        <PrescriptionBody />
      </RequireAuth>
    </Screen>
  );
}

function PrescriptionBody() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useLocale();
  const errorMessage = useApiErrorMessage();
  const prescriptions = usePrescriptions();
  const create = useCreatePrescription();
  const cart = useCart();

  const [mode, setMode] = useState<Mode>('manual');
  const [values, setValues] = useState<Record<Eye, EyeForm>>({ od: emptyEye, os: emptyEye });
  const [pd, setPd] = useState('');
  const [add, setAdd] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [issuedOn, setIssuedOn] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const update = (eye: Eye, field: EyeField, value: string) => setValues((prev) => ({ ...prev, [eye]: { ...prev[eye], [field]: value } }));
  const clean = (v: string) => (v.trim() ? v.trim() : undefined);

  const save = async () => {
    setFieldErrors({});
    setFormError(null);
    if (!values.od.sph.trim() && !values.os.sph.trim()) return setFormError(t.prescription.sphRequired);
    try {
      const created = await create.mutateAsync({
        source: 'manual',
        od: { sph: clean(values.od.sph), cyl: clean(values.od.cyl), axis: clean(values.od.axis) },
        os: { sph: clean(values.os.sph), cyl: clean(values.os.cyl), axis: clean(values.os.axis) },
        pd: clean(pd),
        add: clean(add),
        doctorName: clean(doctorName),
        issuedOn: clean(issuedOn),
      });
      setValues({ od: emptyEye, os: emptyEye });
      setPd('');
      setAdd('');
      // Attach it straight away when the cart is waiting for one, then return to the cart.
      if (cart.cart?.requiresPrescription && !cart.cart.prescription) {
        await cart.attachPrescription(created.id).catch(() => {});
        Alert.alert(t.prescription.savedHint, t.prescription.pendingHint, [{ text: t.common.done, onPress: () => router.canGoBack() && router.back() }]);
      } else {
        Alert.alert(t.prescription.savedHint, t.prescription.pendingHint);
      }
    } catch (err) {
      if (ApiError.is(err, 'VALIDATION_ERROR')) setFieldErrors(err.fieldErrors());
      setFormError(errorMessage(err));
    }
  };

  return (
    <>
      <ScreenScroll>
        <View style={styles.segmented}>
          <SegmentButton label={t.prescription.manual} selected={mode === 'manual'} onPress={() => setMode('manual')} />
          <SegmentButton label={t.prescription.upload} selected={mode === 'upload'} onPress={() => setMode('upload')} />
        </View>

        {mode === 'manual' ? (
          <Card style={styles.form}>
            <View style={styles.gridRow}>
              <View style={styles.eyeLabel} />
              {(['SPH', 'CYL', 'AXIS'] as const).map((h) => (
                <Text key={h} variant="caption" color="textSecondary" align="center" style={styles.cell}>{h}</Text>
              ))}
            </View>
            <EyeRow label={t.prescription.rightEye} code="OD" values={values.od} errors={fieldErrors} onChange={(f, v) => update('od', f, v)} />
            <EyeRow label={t.prescription.leftEye} code="OS" values={values.os} errors={fieldErrors} onChange={(f, v) => update('os', f, v)} />
            <View style={styles.pdRow}>
              <Field label={t.prescription.pd} value={pd} onChangeText={setPd} suffix={t.prescription.pdUnit} error={fieldErrors.pd} />
              <Field label={t.prescription.add} value={add} onChangeText={setAdd} placeholder={t.common.optional} error={fieldErrors.add} />
            </View>
            <View style={styles.pdRow}>
              <TextField label={t.prescription.doctorName} value={doctorName} onChangeText={setDoctorName} placeholder={t.common.optional} style={styles.cell} error={fieldErrors.doctorName} />
              <TextField
                label={t.prescription.issuedOn}
                value={issuedOn}
                onChangeText={setIssuedOn}
                placeholder={t.prescription.dateFormat}
                keyboardType="numbers-and-punctuation"
                style={styles.cell}
                error={fieldErrors.issuedOn}
              />
            </View>
            {formError ? <Text variant="caption" color="red">{formError}</Text> : null}
            <Text variant="caption" color="textMuted">{t.prescription.pendingHint}</Text>
          </Card>
        ) : (
          <Card tone="dashed" padding={18} style={styles.upload}>
            <View style={styles.iconBox}>
              <Icon name="image" size={22} />
            </View>
            <View style={styles.uploadText}>
              <Text variant="bodySm" weight="medium">{t.prescription.uploadTitle}</Text>
              <Text variant="caption" color="textSecondary">{t.prescription.uploadComingSoon}</Text>
            </View>
          </Card>
        )}

        <Card style={styles.saved}>
          <SectionLabel>{t.prescription.saved}</SectionLabel>
          {prescriptions.isPending ? (
            <LoadingView compact />
          ) : prescriptions.isError ? (
            <ErrorView error={prescriptions.error} onRetry={() => prescriptions.refetch()} compact />
          ) : prescriptions.data.length === 0 ? (
            <EmptyView icon="bookmark" title={t.prescription.none} />
          ) : (
            prescriptions.data.map((rx, i) => (
              <View key={rx.id} style={styles.savedList}>
                {i > 0 ? <Divider tone="muted" /> : null}
                <SavedRow rx={rx} />
              </View>
            ))
          )}
        </Card>

        <Pressable onPress={() => router.push('/book-exam')} accessibilityRole="button">
          <Card tone="navy" padding={13} style={styles.banner}>
            <Icon name="info" size={20} color={colors.onNavy} />
            <Text variant="label" color="onNavy" style={styles.bannerText}>{t.prescription.bookHint}</Text>
          </Card>
        </Pressable>
      </ScreenScroll>

      {mode === 'manual' ? (
        <BottomBar>
          <Button label={create.isPending ? t.prescription.saving : t.prescription.save} style={styles.cta} disabled={create.isPending} onPress={save} />
        </BottomBar>
      ) : null}
    </>
  );
}

function SavedRow({ rx }: { rx: Prescription }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { t, n, date } = useLocale();
  const cart = useCart();
  const remove = useDeletePrescription();
  const errorMessage = useApiErrorMessage();

  const verified = rx.status === 'verified';
  // Pending prescriptions can be used right away; the clinic verifies them before the lab step.
  const usable = verified || rx.status === 'pending';
  const attached = cart.cart?.prescription?.id === rx.id;
  const statusLabel = { pending: t.prescription.statusPending, verified: t.prescription.statusVerified, expired: t.prescription.statusExpired, rejected: t.prescription.statusRejected }[rx.status];
  const statusColor = { pending: 'textSecondary', verified: 'green', expired: 'textMuted', rejected: 'red' } as const;
  const title = rx.label ?? rx.doctorName ?? (rx.issuedOn ? date(rx.issuedOn) : t.prescription.title);
  const summary = n(`OD ${rx.od.sph ?? '—'} · OS ${rx.os.sph ?? '—'}${rx.pd ? ` · PD ${rx.pd}` : ''}`);

  const attach = async () => {
    try {
      await cart.attachPrescription(rx.id);
      if (router.canGoBack()) router.back();
    } catch (err) {
      Alert.alert(errorMessage(err));
    }
  };

  const confirmDelete = () =>
    Alert.alert(t.prescription.deleteConfirm, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.delete, style: 'destructive', onPress: () => remove.mutateAsync(rx.id).catch((err) => Alert.alert(errorMessage(err))) },
    ]);

  return (
    <View style={styles.savedRow}>
      <View style={styles.iconBoxSm}>
        <Icon name="bookmark" size={19} color={verified ? colors.navy : colors.textMuted} />
      </View>
      <View style={styles.savedBody}>
        <Text variant="bodySm" weight="medium" color={verified ? 'text' : 'textSecondary'} numberOfLines={1}>{title}</Text>
        <Text variant="caption" color="textSecondary" numberOfLines={1}>{summary}</Text>
        <Text variant="caption" color={statusColor[rx.status]}>
          {rx.issuedOn ? `${date(rx.issuedOn, 'short')} · ` : ''}{statusLabel}{rx.reviewNote ? ` · ${rx.reviewNote}` : ''}
        </Text>
      </View>
      {attached ? (
        <Text variant="caption" color="green">{t.prescription.attached}</Text>
      ) : usable ? (
        <Button label={t.prescription.attach} variant="outline" size="sm" disabled={cart.pending.prescription} onPress={attach} />
      ) : (
        <Pressable onPress={confirmDelete} hitSlop={10} accessibilityRole="button" accessibilityLabel={t.common.delete}>
          <Icon name="close" size={16} color={colors.textMuted} />
        </Pressable>
      )}
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

function EyeRow({ label, code, values, errors, onChange }: { label: string; code: string; values: EyeForm; errors: Record<string, string>; onChange: (field: EyeField, value: string) => void }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const eye = code.toLowerCase();
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
          placeholder={field === 'axis' ? '0–180' : '±0.00'}
          placeholderTextColor={colors.textMuted}
          keyboardType="numbers-and-punctuation"
          textAlign="center"
          style={[styles.cell, styles.inputBox, styles.inputText, errors[`${eye}.${field}`] ? styles.inputError : null]}
        />
      ))}
    </View>
  );
}

function Field({ label, suffix, error, ...input }: { label: string; suffix?: string; error?: string } & ComponentProps<typeof TextInput>) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Text variant="caption" color="textSecondary">{label}</Text>
      <View style={[styles.inputBox, styles.fieldInput, error ? styles.inputError : null]}>
        <TextInput placeholderTextColor={colors.textMuted} keyboardType="numbers-and-punctuation" style={styles.fieldText} {...input} />
        {suffix ? <Text variant="bodySm">{suffix}</Text> : null}
      </View>
      {error ? <Text variant="tiny" color="red">{error}</Text> : null}
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
    inputError: { borderColor: colors.red },
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
