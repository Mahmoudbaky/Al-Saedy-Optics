import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { ApiError, useApiErrorMessage, useProfile, useUpdateProfile } from '@/api';
import { RequireAuth } from '@/auth';
import { isPhone } from '@/components/auth/validation';
import { LoadingView } from '@/components/feedback';
import { BottomBar, Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { Button, Text, TextField } from '@/components/ui';
import { useLocale } from '@/i18n';
import { spacing } from '@/theme';

export default function ProfileEditScreen() {
  const { t } = useLocale();
  return (
    <Screen>
      <ScreenHeader showBack title={t.profile.title} />
      <RequireAuth>
        <ProfileForm />
      </RequireAuth>
    </Screen>
  );
}

function ProfileForm() {
  const profile = useProfile();
  if (profile.isPending || !profile.data) return <LoadingView />;
  return <ProfileFields initialName={profile.data.name} initialPhone={profile.data.phone ?? ''} email={profile.data.email} />;
}

function ProfileFields({ initialName, initialPhone, email }: { initialName: string; initialPhone: string; email: string }) {
  const router = useRouter();
  const { t } = useLocale();
  const update = useUpdateProfile();
  const errorMessage = useApiErrorMessage();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = t.auth.required;
    if (phone.trim() && !isPhone(phone)) next.phone = t.errors.validation;
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length) return;
    try {
      await update.mutateAsync({ name: name.trim(), phone: phone.trim() || null });
      Alert.alert(t.profile.saved);
      router.back();
    } catch (err) {
      if (ApiError.is(err, 'VALIDATION_ERROR')) setErrors(err.fieldErrors());
      setFormError(errorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenScroll gap={spacing.md}>
        <TextField label={t.auth.name} value={name} onChangeText={setName} error={errors.name} autoComplete="name" />
        <TextField label={t.auth.phone} value={phone} onChangeText={setPhone} error={errors.phone} keyboardType="phone-pad" autoComplete="tel" placeholder="+964 7xx xxx xxxx" />
        <TextField label={t.auth.email} value={email} editable={false} />
        {formError ? <Text variant="caption" color="red" align="center">{formError}</Text> : null}
      </ScreenScroll>
      <BottomBar>
        <Button label={t.common.save} style={styles.flex} onPress={submit} disabled={update.isPending} />
      </BottomBar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
