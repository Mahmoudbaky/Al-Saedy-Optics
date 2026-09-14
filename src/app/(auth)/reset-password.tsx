import { useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuth, useAuthErrorMessage } from '@/auth';
import { AuthScreen } from '@/components/auth';
import { MIN_PASSWORD } from '@/components/auth/validation';
import { Pressable, Text, TextField } from '@/components/ui';
import { useLocale } from '@/i18n';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const { t, tf } = useLocale();
  const { resetPassword, requestPasswordReset, signIn } = useAuth();
  const authMessage = useAuthErrorMessage();

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldError, setFieldError] = useState<{ otp?: string; password?: string; confirm?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const errors: typeof fieldError = {};
    if (otp.trim().length !== 6) errors.otp = t.auth.errors.invalidOtp;
    if (password.length < MIN_PASSWORD) errors.password = t.auth.passwordRule;
    if (confirm !== password) errors.confirm = t.auth.passwordsMismatch;
    setFieldError(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    setError(null);
    try {
      await resetPassword(email, otp, password);
      // Resetting revokes existing sessions; sign the user straight back in.
      await signIn(email, password);
      Alert.alert(t.auth.resetDone);
      if (router.canGoBack()) router.dismissAll();
      else router.replace('/(tabs)');
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    try {
      await requestPasswordReset(email);
      Alert.alert(tf(t.auth.codeSent, { email }));
    } catch (err) {
      setError(authMessage(err));
    }
  };

  return (
    <AuthScreen
      title={t.auth.resetTitle}
      subtitle={tf(t.auth.codeSent, { email })}
      error={error}
      submitLabel={t.auth.resetPassword}
      onSubmit={submit}
      submitting={submitting}
      footer={
        <Pressable onPress={resend} accessibilityRole="button">
          <Text variant="label" color="navy">{t.auth.resendCode}</Text>
        </Pressable>
      }
    >
      <TextField
        label={t.auth.otp}
        value={otp}
        onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
        error={fieldError.otp}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={6}
        returnKeyType="next"
      />
      <TextField
        label={t.auth.newPassword}
        hint={t.auth.passwordRule}
        value={password}
        onChangeText={setPassword}
        error={fieldError.password}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
      />
      <TextField
        label={t.auth.confirmPassword}
        value={confirm}
        onChangeText={setConfirm}
        error={fieldError.confirm}
        secureTextEntry
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
    </AuthScreen>
  );
}
