import Constants from 'expo-constants';

/**
 * Base URL of the backend (no trailing slash). Lives alone in this module so both
 * the auth client and the API client can import it without a cycle.
 *
 * `EXPO_PUBLIC_API_URL` wins. In development we fall back to the Metro host,
 * which is the machine's LAN IP on a device and works on emulators too.
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (fromEnv) return fromEnv;

  const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (__DEV__ && metroHost) return `http://${metroHost}:3000`;

  throw new Error('EXPO_PUBLIC_API_URL is not set');
}

export const API_URL = resolveApiUrl();
export const API_V1 = `${API_URL}/api/v1`;
