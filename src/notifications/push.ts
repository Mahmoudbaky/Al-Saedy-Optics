import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { registerDevice, unregisterDevice } from '@/api/notifications';
import { registerBeforeSignOut, useAuth } from '@/auth/AuthProvider';

import { readStoredPushToken, writeStoredPushToken } from './storage';

/** Expo Go on Android can't receive remote pushes since SDK 53; everything here is best-effort. */
async function fetchExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice || Platform.OS === 'web') return null;
  const { status: existing } = await Notifications.getPermissionsAsync();
  const status = existing === 'granted' ? existing : (await Notifications.requestPermissionsAsync()).status;
  if (status !== 'granted') return null;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', { name: 'default', importance: Notifications.AndroidImportance.DEFAULT });
  }
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  const { data } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  return data;
}

/**
 * Registers the device's Expo push token with `POST /me/devices` once a user is
 * signed in, and revokes it right before sign-out. Never throws into the UI.
 */
export function usePushRegistration(): void {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await fetchExpoPushToken();
        if (!token || cancelled) return;
        await registerDevice(token, Platform.OS === 'ios' ? 'ios' : 'android');
        await writeStoredPushToken(token);
      } catch {
        // Missing permission, Expo Go, or offline – push simply stays off.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(
    () =>
      registerBeforeSignOut(async () => {
        const token = readStoredPushToken();
        if (!token) return;
        await unregisterDevice(token).catch(() => {});
        await writeStoredPushToken(null);
      }),
    [],
  );
}
