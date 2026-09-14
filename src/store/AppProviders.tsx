import { useEffect, type PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/auth';
import { LocaleProvider } from '@/i18n';
import { usePushRegistration } from '@/notifications';
import { ThemeProvider } from '@/theme';

import { queryClient, subscribeFocusManager } from './query-client';

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(subscribeFocusManager, []);

  return (
    <ThemeProvider>
      <LocaleProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PushRegistrar />
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

/** Runs inside AuthProvider so it can react to sign-in / sign-out. */
function PushRegistrar() {
  usePushRegistration();
  return null;
}
