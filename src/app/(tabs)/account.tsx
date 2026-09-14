import { Alert, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { useProfile, type Profile } from '@/api';
import { SignInPrompt, useAuth } from '@/auth';
import { Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { Card, ImageSlot, ListRow, Pressable, Text } from '@/components/ui';
import { useLocale } from '@/i18n';
import { THEME_PREFERENCES, radius, spacing, useTheme, type ThemePreference } from '@/theme';

const mark = require('@/assets/brand/mark.png');

export default function AccountScreen() {
  const { colors, preference, setPreference } = useTheme();
  const router = useRouter();
  const { t, n, locale, setLocale } = useLocale();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();

  const appearanceLabel: Record<ThemePreference, string> = {
    system: t.account.appearanceSystem,
    light: t.account.appearanceLight,
    dark: t.account.appearanceDark,
  };
  const cycleAppearance = () => {
    const next = THEME_PREFERENCES[(THEME_PREFERENCES.indexOf(preference) + 1) % THEME_PREFERENCES.length];
    setPreference(next);
  };

  const confirmSignOut = () =>
    Alert.alert(t.account.logout, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.signOut, style: 'destructive', onPress: () => signOut().catch(() => {}) },
    ]);

  const trailing = (text: string, color: 'textMuted' | 'textSecondary' | 'red' = 'textMuted') => (
    <Text variant={color === 'red' ? 'caption' : 'label'} color={color}>{text}</Text>
  );
  const count = (value: number | undefined) => (value ? trailing(n(value)) : undefined);

  return (
    <Screen>
      <ScreenHeader size="lg" title={t.account.title} />
      <ScreenScroll gap={spacing.lg - 2}>
        {user ? <ProfileCard profile={profile} name={user.name} /> : <SignInPrompt />}

        {user ? (
          <Card padding={0}>
            <ListRow icon="bookmark" label={t.account.prescriptions} trailing={count(profile?.stats.prescriptions)} onPress={() => router.push('/prescription')} />
            <ListRow icon="bag" label={t.account.orders} trailing={count(profile?.stats.orders)} onPress={() => router.push('/orders')} />
            <ListRow icon="pin" label={t.account.addresses} onPress={() => router.push('/addresses')} />
            <ListRow icon="heart" label={t.account.wishlist} trailing={count(profile?.stats.wishlist)} onPress={() => router.push('/wishlist')} />
            <ListRow
              icon="calendar"
              label={t.account.appointments}
              trailing={profile?.stats.nextAppointmentAt ? trailing(t.account.upcoming, 'red') : undefined}
              onPress={() => router.push('/appointments')}
              showDivider={false}
            />
          </Card>
        ) : null}

        <Card padding={0}>
          <ListRow icon="globe" label={t.account.language} trailing={trailing(t.account.languageValue, 'textSecondary')} onPress={() => setLocale(locale === 'ar' ? 'en' : 'ar')} />
          <ListRow icon="moon" label={t.account.appearance} trailing={trailing(appearanceLabel[preference], 'textSecondary')} onPress={cycleAppearance} />
          {user ? <ListRow icon="bell" label={t.account.notifications} trailing={count(profile?.stats.unreadNotifications)} onPress={() => router.push('/notifications')} /> : null}
          <ListRow icon="help" label={t.account.help} showDivider={false} />
        </Card>

        {user ? (
          <Card padding={0}>
            <ListRow icon="tag" label={t.account.offers} trailing={trailing(t.common.newBadge, 'red')} />
            <ListRow icon="logout" iconColor={colors.red} label={t.account.logout} labelColor="red" onPress={confirmSignOut} showDivider={false} />
          </Card>
        ) : null}

        <View style={styles.footer}>
          <Image source={mark} style={styles.footerMark} contentFit="contain" />
          <Text variant="caption" color="textMuted">{`${t.common.clinicName} · ${t.common.version}`}</Text>
        </View>
      </ScreenScroll>
    </Screen>
  );
}

function ProfileCard({ profile, name }: { profile: Profile | undefined; name: string }) {
  const router = useRouter();
  const { t, n } = useLocale();
  return (
    <Card tone="navy" padding={16} style={styles.profile}>
      <ImageSlot tone="navy" source={profile?.image ? { uri: profile.image } : undefined} style={styles.avatar} />
      <View style={styles.profileBody}>
        <Text variant="body" color="onNavy" weight="bold">{profile?.name ?? name}</Text>
        <Text variant="caption" color="onNavyMuted">{profile?.phone ? n(profile.phone) : (profile?.email ?? '')}</Text>
      </View>
      <Pressable style={styles.editPill} accessibilityRole="button" rippleColor="rgba(255,255,255,0.2)" onPress={() => router.push('/profile-edit')}>
        <Text variant="label" color="onNavy">{t.common.edit}</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.hero },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  profileBody: { flex: 1, gap: 3 },
  editPill: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 12, overflow: 'hidden' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingTop: 4 },
  footerMark: { width: 18, height: 20 },
});
