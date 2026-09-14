import Storage from 'expo-sqlite/kv-store';

const TOKEN_KEY = 'push.token';

/** Last Expo push token we registered with the backend, so sign-out can revoke it. */
export function readStoredPushToken(): string | null {
  try {
    return Storage.getItemSync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function writeStoredPushToken(token: string | null): Promise<void> {
  if (token) await Storage.setItem(TOKEN_KEY, token);
  else await Storage.removeItem(TOKEN_KEY);
}
