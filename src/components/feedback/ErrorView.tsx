import { StyleSheet, View } from 'react-native';

import { useApiErrorMessage } from '@/api/errors';
import { Button, Icon, Text } from '@/components/ui';
import { useLocale } from '@/i18n';
import { spacing, useTheme } from '@/theme';

export interface ErrorViewProps {
  error: unknown;
  onRetry?: () => void;
  compact?: boolean;
}

/** Localized error message with an optional retry button. */
export function ErrorView({ error, onRetry, compact = false }: ErrorViewProps) {
  const message = useApiErrorMessage();
  const { t } = useLocale();
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, compact ? styles.compact : styles.fill]}>
      <Icon name="info" size={28} color={colors.textMuted} />
      <Text variant="bodySm" color="textSecondary" align="center">{message(error)}</Text>
      {onRetry ? <Button label={t.common.retry} variant="outline" size="sm" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.xl },
  fill: { flex: 1, minHeight: 200 },
  compact: { paddingVertical: spacing.xl },
});
