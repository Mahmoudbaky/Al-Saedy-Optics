import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { LoadingView } from '@/components/feedback';
import { Button, Card, Icon, Text } from '@/components/ui';
import { useLocale } from '@/i18n';
import { spacing, useTheme } from '@/theme';

import { useAuth } from './AuthProvider';

interface SignInPromptProps {
  title?: string;
  body?: string;
}

/** Inline card shown to guests where a session is required. */
export function SignInPrompt({ title, body }: SignInPromptProps) {
  const router = useRouter();
  const { t } = useLocale();
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Card style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: colors.surfaceMuted }]}>
          <Icon name="person" size={26} />
        </View>
        <Text variant="sectionTitle" align="center">{title ?? t.auth.signInPromptTitle}</Text>
        <Text variant="bodySm" color="textSecondary" align="center">{body ?? t.auth.signInPromptBody}</Text>
        <Button label={t.common.signIn} variant="navy" size="md" style={styles.button} onPress={() => router.push('/(auth)/sign-in')} />
        <Button label={t.auth.createAccount} variant="outline" size="md" style={styles.button} onPress={() => router.push('/(auth)/sign-up')} />
      </Card>
    </View>
  );
}

/**
 * Renders `children` for signed-in users and a sign-in card for guests.
 * Used inside screens (not as a redirect) so tabs stay tappable and the screen
 * simply re-renders once the auth modal closes.
 */
export function RequireAuth({ children, title, body }: PropsWithChildren<SignInPromptProps>) {
  const { user, isPending } = useAuth();
  if (user) return <>{children}</>;
  if (isPending) return <LoadingView />;
  return <SignInPrompt title={title} body={body} />;
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.screen, paddingTop: spacing.lg },
  card: { alignItems: 'center', gap: spacing.md },
  iconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  button: { alignSelf: 'stretch' },
});
