import { DevSettings } from 'react-native';
import * as Updates from 'expo-updates';

/**
 * Restarts the JS app. `expo-updates` handles release builds; it rejects in
 * development (and Expo Go), where the dev-menu reload is used instead.
 */
export async function reloadApp(): Promise<void> {
  try {
    await Updates.reloadAsync();
  } catch {
    if (__DEV__) DevSettings.reload();
  }
}
