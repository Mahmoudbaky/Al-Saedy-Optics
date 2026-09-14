import { useLocale } from '@/i18n';

/** Wraps a Better Auth client error (`{ code, message, status }`). */
export class AuthError extends Error {
  readonly name = 'AuthError';

  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
  }

  static is(error: unknown): error is AuthError {
    return error instanceof AuthError;
  }
}

/** Converts `{ error }` from an auth call into a thrown `AuthError`. */
export function throwIfAuthError(result: { error: { code?: string; message?: string; status: number; statusText?: string } | null }): void {
  const { error } = result;
  if (!error) return;
  throw new AuthError(error.code ?? (error.status === 0 ? 'NETWORK' : 'UNKNOWN'), error.message ?? error.statusText ?? 'Auth error', error.status);
}

export function useAuthErrorMessage(): (error: unknown) => string {
  const { t } = useLocale();
  const e = t.auth.errors;
  return (error) => {
    if (!AuthError.is(error)) return e.generic;
    if (error.status === 0 || error.code === 'NETWORK') return t.errors.network;
    switch (error.code) {
      case 'INVALID_EMAIL_OR_PASSWORD':
      case 'INVALID_PASSWORD':
      case 'CREDENTIAL_ACCOUNT_NOT_FOUND':
        return e.invalidCredentials;
      case 'USER_NOT_FOUND':
        return e.userNotFound;
      case 'USER_ALREADY_EXISTS':
      case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
        return e.userExists;
      case 'INVALID_EMAIL':
        return e.invalidEmail;
      case 'PASSWORD_TOO_SHORT':
      case 'PASSWORD_TOO_LONG':
        return e.weakPassword;
      case 'INVALID_OTP':
        return e.invalidOtp;
      case 'OTP_EXPIRED':
        return e.otpExpired;
      case 'TOO_MANY_ATTEMPTS':
        return e.tooManyAttempts;
      case 'BANNED_USER':
        return e.banned;
      default:
        return error.status === 429 ? t.errors.rateLimited : e.generic;
    }
  };
}
