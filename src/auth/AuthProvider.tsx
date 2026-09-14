import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type PropsWithChildren } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { api } from '@/api/client';
import { qk } from '@/api/query-keys';
import { useLocale, type Locale } from '@/i18n';

import { authClient, type SessionUser } from './auth-client';
import { throwIfAuthError } from './errors';

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  locale: Locale;
}

interface AuthContextValue {
  user: SessionUser | null;
  /** True while the stored session is being restored on cold start. */
  isPending: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, password: string) => Promise<void>;
  /** Re-reads the session from the server (after a profile edit). */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Hook for cleanup that must run right before the session is dropped (push token, etc.). */
type BeforeSignOut = () => Promise<void>;
const beforeSignOutHooks = new Set<BeforeSignOut>();
export function registerBeforeSignOut(hook: BeforeSignOut): () => void {
  beforeSignOutHooks.add(hook);
  return () => beforeSignOutHooks.delete(hook);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const { data, isPending, refetch } = authClient.useSession();
  const user = data?.user ?? null;
  const userId = user?.id ?? null;
  const qc = useQueryClient();
  const { locale } = useLocale();

  // Drop everything session-scoped when the account changes, so one user's cart never
  // shows for another on the same device. Skip the very first resolution.
  const lastUserId = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (isPending) return;
    if (lastUserId.current !== undefined && lastUserId.current !== userId) {
      qc.removeQueries({ queryKey: qk.me.all });
      qc.invalidateQueries({ queryKey: ['home'] });
    }
    lastUserId.current = userId;
  }, [userId, isPending, qc]);

  // Keep the server-side locale (used for push notification copy) in sync with the app.
  const userLocale = (user as { locale?: string } | null)?.locale;
  useEffect(() => {
    if (!userId || userLocale === locale) return;
    api.patch('/me', { locale }).catch(() => {});
  }, [userId, userLocale, locale]);

  const signIn = useCallback(async (email: string, password: string) => {
    throwIfAuthError(await authClient.signIn.email({ email: email.trim().toLowerCase(), password }));
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    throwIfAuthError(
      await authClient.signUp.email({
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
        phone: input.phone?.trim() || undefined,
        locale: input.locale,
      }),
    );
  }, []);

  const signOut = useCallback(async () => {
    await Promise.all([...beforeSignOutHooks].map((hook) => hook().catch(() => {})));
    throwIfAuthError(await authClient.signOut());
    qc.removeQueries({ queryKey: qk.me.all });
    qc.invalidateQueries({ queryKey: ['home'] });
  }, [qc]);

  const requestPasswordReset = useCallback(async (email: string) => {
    throwIfAuthError(await authClient.emailOtp.requestPasswordReset({ email: email.trim().toLowerCase() }));
  }, []);

  const resetPassword = useCallback(async (email: string, otp: string, password: string) => {
    throwIfAuthError(await authClient.emailOtp.resetPassword({ email: email.trim().toLowerCase(), otp: otp.trim(), password }));
  }, []);

  const refresh = useCallback(async () => {
    await refetch({ query: { disableCookieCache: true } });
  }, [refetch]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isPending, signIn, signUp, signOut, requestPasswordReset, resetPassword, refresh }),
    [user, isPending, signIn, signUp, signOut, requestPasswordReset, resetPassword, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
