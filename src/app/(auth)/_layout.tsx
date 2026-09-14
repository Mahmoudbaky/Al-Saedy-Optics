import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

/** Auth flow, presented as a modal over whatever screen asked for a session. */
export default function AuthLayout() {
  const { colors } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
