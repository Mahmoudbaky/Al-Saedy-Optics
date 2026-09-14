import { useState } from 'react';
import { useRouter } from 'expo-router';

import { useAuth, useAuthErrorMessage } from '@/auth';
import { AuthScreen } from '@/components/auth';
import { isEmail } from '@/components/auth/validation';
import { Text, TextField } from '@/components/ui';
import { useLocale } from '@/i18n';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useLocale();
  const { requestPasswordReset } = useAuth();
  const authMessage = useAuthErrorMessage();

  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!isEmail(email)) return setFieldError(t.auth.invalidEmailFormat);
    setFieldError(undefined);
    setSubmitting(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      router.push({ pathname: '/(auth)/reset-password', params: { email: email.trim().toLowerCase() } });
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen title={t.auth.forgotTitle} error={error} submitLabel={t.auth.sendCode} onSubmit={submit} submitting={submitting}>
      <Text variant="bodySm" color="textSecondary">{t.auth.forgotBody}</Text>
      <TextField
        label={t.auth.email}
        value={email}
        onChangeText={setEmail}
        error={fieldError}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={submit}
      />
    </AuthScreen>
  );
}
