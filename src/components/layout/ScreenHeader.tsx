import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Icon, Pressable, Text } from '@/components/ui';
import { useLocale } from '@/i18n';
import { spacing } from '@/theme';

export interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  /** Renders a back chevron pointing to the reading start (right in RTL). */
  showBack?: boolean;
  /** Size of the title: `lg` for tab roots, `md` for pushed screens. */
  size?: 'lg' | 'md';
  trailing?: ReactNode;
  children?: ReactNode;
}

export function ScreenHeader({ title, subtitle, showBack = false, size = 'md', trailing, children }: ScreenHeaderProps) {
  const router = useRouter();
  const { t } = useLocale();

  return (
    <View style={styles.row}>
      {showBack ? (
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" accessibilityLabel={t.common.back}>
          <Icon name="back" size={22} strokeWidth={1.8} />
        </Pressable>
      ) : null}
      <View style={styles.titleBlock}>
        {title ? <Text variant={size === 'lg' ? 'headline' : 'screenTitle'}>{title}</Text> : null}
        {subtitle ? <Text variant="caption" color="textSecondary">{subtitle}</Text> : null}
        {children}
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingTop: 6,
    paddingBottom: 14,
  },
  titleBlock: { flex: 1, gap: 2 },
});
