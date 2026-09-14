import { useState } from 'react';
import { useRouter } from 'expo-router';

import { useAuth, useAuthErrorMessage } from '@/auth';
import { AuthScreen } from '@/components/auth';
import { isEmail } from '@/components/auth/validation';
import { Pressable, Text, TextField } from '@/components/ui';
import { useLocale } from '@/i18n';

export default function SignInScreen() {
  const router = useRouter();
  const { t } = useLocale();
  const { signIn } = useAuth();
  const authMessage = useAuthErrorMessage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const closeModal = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  const submit = async () => {
    const errors: typeof fieldError = {};
    if (!isEmail(email)) errors.email = t.auth.invalidEmailFormat;
    if (!password) errors.password = t.auth.required;
    setFieldError(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
      closeModal();
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen
      title={t.auth.signInTitle}
      subtitle={t.auth.signInSubtitle}
      error={error}
      submitLabel={t.common.signIn}
      onSubmit={submit}
      submitting={submitting}
      footer={
        <>
          <Pressable onPress={() => router.push('/(auth)/forgot-password')} accessibilityRole="link">
            <Text variant="label" color="navy">{t.auth.forgotPassword}</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/(auth)/sign-up')} accessibilityRole="link">
            <Text variant="label" color="textSecondary">
              {t.auth.noAccount} <Text variant="label" color="navy" weight="bold">{t.common.signUp}</Text>
            </Text>
          </Pressable>
        </>
      }
    >
      <TextField
        label={t.auth.email}
        value={email}
        onChangeText={setEmail}
        error={fieldError.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <TextField
        label={t.auth.password}
        value={password}
        onChangeText={setPassword}
        error={fieldError.password}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
    </AuthScreen>
  );
}
