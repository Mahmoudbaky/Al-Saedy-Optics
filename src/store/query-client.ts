import { AppState, type AppStateStatus } from 'react-native';
import { focusManager, QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/errors';

const MINUTE = 60_000;

/** Single QueryClient for the app (module singleton – safe with the React Compiler). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: MINUTE,
      gcTime: 10 * MINUTE,
      // 4xx responses won't change on retry; network blips might.
      retry: (failureCount, error) => !(ApiError.is(error) && error.status >= 400 && error.status < 500) && failureCount < 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: { retry: 0 },
  },
});

/** React Query only knows browser focus; map React Native's AppState onto it. */
export function subscribeFocusManager(): () => void {
  const onChange = (status: AppStateStatus) => focusManager.setFocused(status === 'active');
  const sub = AppState.addEventListener('change', onChange);
  return () => sub.remove();
}
