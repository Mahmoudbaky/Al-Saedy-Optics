import { useState } from 'react';
import { useRouter } from 'expo-router';

import { useAuth, useAuthErrorMessage } from '@/auth';
import { AuthScreen } from '@/components/auth';
import { isEmail, isPhone, MIN_PASSWORD } from '@/components/auth/validation';
import { Pressable, Text, TextField } from '@/components/ui';
import { useLocale } from '@/i18n';

type Field = 'name' | 'email' | 'phone' | 'password' | 'confirm';

export default function SignUpScreen() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { signUp } = useAuth();
  const authMessage = useAuthErrorMessage();

  const [form, setForm] = useState<Record<Field, string>>({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [fieldError, setFieldError] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (field: Field) => (value: string) => setForm((f) => ({ ...f, [field]: value }));

  const submit = async () => {
    const errors: Partial<Record<Field, string>> = {};
    if (form.name.trim().length < 2) errors.name = t.auth.required;
    if (!isEmail(form.email)) errors.email = t.auth.invalidEmailFormat;
    if (form.phone.trim() && !isPhone(form.phone)) errors.phone = t.errors.validation;
    if (form.password.length < MIN_PASSWORD) errors.password = t.auth.passwordRule;
    if (form.confirm !== form.password) errors.confirm = t.auth.passwordsMismatch;
    setFieldError(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    setError(null);
    try {
      await signUp({ name: form.name, email: form.email, password: form.password, phone: form.phone || undefined, locale });
      if (router.canGoBack()) router.dismissAll();
      else router.replace('/(tabs)');
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen
      title={t.auth.signUpTitle}
      subtitle={t.auth.signUpSubtitle}
      error={error}
      submitLabel={t.common.signUp}
      onSubmit={submit}
      submitting={submitting}
      footer={
        <Pressable onPress={() => router.replace('/(auth)/sign-in')} accessibilityRole="link">
          <Text variant="label" color="textSecondary">
            {t.auth.haveAccount} <Text variant="label" color="navy" weight="bold">{t.common.signIn}</Text>
          </Text>
        </Pressable>
      }
    >
      <TextField label={t.auth.name} value={form.name} onChangeText={set('name')} error={fieldError.name} autoComplete="name" textContentType="name" returnKeyType="next" />
      <TextField
        label={t.auth.email}
        value={form.email}
        onChangeText={set('email')}
        error={fieldError.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <TextField
        label={t.auth.phone}
        hint={t.auth.phoneHint}
        value={form.phone}
        onChangeText={set('phone')}
        error={fieldError.phone}
        placeholder="+964 7xx xxx xxxx"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        returnKeyType="next"
      />
      <TextField
        label={t.auth.password}
        hint={t.auth.passwordRule}
        value={form.password}
        onChangeText={set('password')}
        error={fieldError.password}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
      />
      <TextField
        label={t.auth.confirmPassword}
        value={form.confirm}
        onChangeText={set('confirm')}
        error={fieldError.confirm}
        secureTextEntry
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
    </AuthScreen>
  );
}
