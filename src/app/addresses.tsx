import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { ApiError, useAddresses, useApiErrorMessage, useCreateAddress, useDeleteAddress, useSetDefaultAddress, useUpdateAddress, type Address, type AddressInput } from '@/api';
import { RequireAuth } from '@/auth';
import { isPhone } from '@/components/auth/validation';
import { EmptyView, ErrorView, LoadingView } from '@/components/feedback';
import { BottomBar, Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { Button, Card, Icon, Pressable, Text, TextField, Toggle } from '@/components/ui';
import { useLocale } from '@/i18n';
import { radius, spacing, useTheme, useThemedStyles, type Palette } from '@/theme';

type Editing = { mode: 'new' } | { mode: 'edit'; address: Address } | null;

export default function AddressesScreen() {
  const { t } = useLocale();
  const [editing, setEditing] = useState<Editing>(null);

  return (
    <Screen>
      <ScreenHeader showBack title={editing ? (editing.mode === 'new' ? t.addresses.add : t.addresses.edit) : t.addresses.title} />
      <RequireAuth>
        {editing ? <AddressForm editing={editing} onDone={() => setEditing(null)} /> : <AddressList onAdd={() => setEditing({ mode: 'new' })} onEdit={(address) => setEditing({ mode: 'edit', address })} />}
      </RequireAuth>
    </Screen>
  );
}

function AddressList({ onAdd, onEdit }: { onAdd: () => void; onEdit: (a: Address) => void }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const { t, n } = useLocale();
  const addresses = useAddresses();
  const setDefault = useSetDefaultAddress();
  const remove = useDeleteAddress();
  const errorMessage = useApiErrorMessage();

  const confirmDelete = (a: Address) =>
    Alert.alert(t.addresses.deleteConfirm, a.formatted, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.delete, style: 'destructive', onPress: () => remove.mutateAsync(a.id).catch((err) => Alert.alert(errorMessage(err))) },
    ]);

  return (
    <>
      {addresses.isPending ? (
        <LoadingView />
      ) : addresses.isError ? (
        <ErrorView error={addresses.error} onRetry={() => addresses.refetch()} />
      ) : addresses.data.length === 0 ? (
        <EmptyView icon="pin" title={t.addresses.empty} hint={t.addresses.emptyHint} />
      ) : (
        <ScreenScroll gap={spacing.md}>
          {addresses.data.map((a) => (
            <Card key={a.id} style={styles.row}>
              <View style={styles.iconBox}>
                <Icon name="pin" size={19} color={a.isDefault ? colors.navy : colors.textMuted} />
              </View>
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text variant="bodySm" weight="bold">{a.label ?? a.recipientName}</Text>
                  {a.isDefault ? <Text variant="tiny" color="green">{t.addresses.default}</Text> : null}
                </View>
                <Text variant="caption" color="textSecondary">{`${a.formatted}\n${a.recipientName} · ${n(a.phone)}`}</Text>
                <View style={styles.actions}>
                  <Pressable onPress={() => onEdit(a)} hitSlop={6} accessibilityRole="button">
                    <Text variant="label" color="navy">{t.common.edit}</Text>
                  </Pressable>
                  {!a.isDefault ? (
                    <Pressable onPress={() => setDefault.mutateAsync(a.id).catch((err) => Alert.alert(errorMessage(err)))} hitSlop={6} accessibilityRole="button">
                      <Text variant="label" color="navy">{t.addresses.setDefault}</Text>
                    </Pressable>
                  ) : null}
                  <Pressable onPress={() => confirmDelete(a)} hitSlop={6} accessibilityRole="button">
                    <Text variant="label" color="red">{t.common.delete}</Text>
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}
        </ScreenScroll>
      )}
      <BottomBar>
        <Button label={t.addresses.add} style={styles.cta} onPress={onAdd} />
      </BottomBar>
    </>
  );
}

type Field = 'label' | 'recipientName' | 'phone' | 'city' | 'area' | 'street' | 'building' | 'notes';

function AddressForm({ editing, onDone }: { editing: NonNullable<Editing>; onDone: () => void }) {
  const styles = useThemedStyles(makeStyles);
  const { t } = useLocale();
  const create = useCreateAddress();
  const update = useUpdateAddress();
  const errorMessage = useApiErrorMessage();
  const initial = editing.mode === 'edit' ? editing.address : null;

  const [form, setForm] = useState<Record<Field, string>>({
    label: initial?.label ?? '',
    recipientName: initial?.recipientName ?? '',
    phone: initial?.phone ?? '',
    city: initial?.city ?? '',
    area: initial?.area ?? '',
    street: initial?.street ?? '',
    building: initial?.building ?? '',
    notes: initial?.notes ?? '',
  });
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const set = (field: Field) => (value: string) => setForm((f) => ({ ...f, [field]: value }));
  const saving = create.isPending || update.isPending;

  const submit = async () => {
    const next: Partial<Record<Field, string>> = {};
    if (form.recipientName.trim().length < 2) next.recipientName = t.auth.required;
    if (!isPhone(form.phone)) next.phone = t.errors.validation;
    if (form.city.trim().length < 2) next.city = t.auth.required;
    if (form.area.trim().length < 2) next.area = t.auth.required;
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length) return;

    const input: AddressInput = {
      label: form.label.trim() || null,
      recipientName: form.recipientName.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      area: form.area.trim(),
      street: form.street.trim() || null,
      building: form.building.trim() || null,
      notes: form.notes.trim() || null,
      isDefault,
    };
    try {
      if (initial) await update.mutateAsync({ id: initial.id, ...input });
      else await create.mutateAsync(input);
      onDone();
    } catch (err) {
      if (ApiError.is(err, 'VALIDATION_ERROR')) setErrors(err.fieldErrors() as Partial<Record<Field, string>>);
      setFormError(errorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenScroll gap={spacing.md}>
        <TextField label={t.addresses.label} placeholder={t.addresses.labelPlaceholder} value={form.label} onChangeText={set('label')} error={errors.label} maxLength={40} />
        <TextField label={t.addresses.recipientName} value={form.recipientName} onChangeText={set('recipientName')} error={errors.recipientName} autoComplete="name" />
        <TextField label={t.addresses.phone} value={form.phone} onChangeText={set('phone')} error={errors.phone} keyboardType="phone-pad" autoComplete="tel" placeholder="+964 7xx xxx xxxx" />
        <View style={styles.pair}>
          <TextField label={t.addresses.city} value={form.city} onChangeText={set('city')} error={errors.city} style={styles.flex} />
          <TextField label={t.addresses.area} value={form.area} onChangeText={set('area')} error={errors.area} style={styles.flex} />
        </View>
        <TextField label={t.addresses.street} value={form.street} onChangeText={set('street')} error={errors.street} placeholder={t.common.optional} />
        <TextField label={t.addresses.building} value={form.building} onChangeText={set('building')} error={errors.building} placeholder={t.common.optional} />
        <TextField label={t.addresses.notes} value={form.notes} onChangeText={set('notes')} error={errors.notes} placeholder={t.common.optional} maxLength={300} />
        <Card style={styles.toggleRow} padding={13}>
          <Text variant="label" style={styles.flex}>{t.addresses.makeDefault}</Text>
          <Toggle value={isDefault} onValueChange={setIsDefault} />
        </Card>
        {formError ? <Text variant="caption" color="red" align="center">{formError}</Text> : null}
      </ScreenScroll>
      <BottomBar>
        <Button label={t.common.cancel} variant="outline" style={styles.half} onPress={onDone} disabled={saving} />
        <Button label={t.common.save} style={styles.half} onPress={submit} disabled={saving} />
      </BottomBar>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    half: { flex: 1 },
    cta: { flex: 1 },
    pair: { flexDirection: 'row', gap: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
    iconBox: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
    body: { flex: 1, gap: 4 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    actions: { flexDirection: 'row', gap: spacing.lg, paddingTop: 4 },
    toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  });
