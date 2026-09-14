import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { spacing } from '@/theme';

export interface AuthScreenProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  /** Form-level error shown above the submit button. */
  error?: string | null;
  submitLabel: string;
  onSubmit: () => void;
  submitting?: boolean;
  submitDisabled?: boolean;
  footer?: ReactNode;
}

/** Shared chrome for the sign-in / sign-up / reset screens. */
export function AuthScreen({ title, subtitle, error, submitLabel, onSubmit, submitting, submitDisabled, footer, children }: AuthScreenProps) {
  return (
    <Screen edges={Platform.OS === 'android' ? ['top', 'bottom'] : ['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader showBack title={title} subtitle={subtitle} />
        <ScreenScroll gap={spacing.md} contentContainerStyle={styles.body}>
          {children}
          {error ? (
            <Text variant="bodySm" color="red" align="center">{error}</Text>
          ) : null}
          <Button label={submitLabel} variant="navy" onPress={onSubmit} disabled={submitting || submitDisabled} style={styles.submit} />
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScreenScroll>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingTop: spacing.sm },
  submit: { marginTop: spacing.sm },
  footer: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
});
