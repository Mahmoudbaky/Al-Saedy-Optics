import { useLocale } from '@/i18n';

/** Error codes emitted by the backend (`src/lib/errors.ts`) plus client-side ones. */
export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'ALREADY_EXISTS'
  | 'REFERENCE_ERROR'
  | 'MISSING_FIELD'
  | 'INVALID_INPUT'
  | 'INVALID_JSON'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'PARSE';

export interface ValidationIssue {
  in?: 'params' | 'query' | 'body';
  /** Dotted path, e.g. `od.sph`. */
  path: string;
  message: string;
}

export class ApiError extends Error {
  readonly name = 'ApiError';

  constructor(
    readonly code: ApiErrorCode | (string & {}),
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }

  /** Validation issues from a 422 response, empty otherwise. */
  get issues(): ValidationIssue[] {
    return Array.isArray(this.details) ? (this.details as ValidationIssue[]).filter((i) => typeof i?.path === 'string') : [];
  }

  /** `{ 'od.sph': 'Invalid …' }` for binding to form fields. */
  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const issue of this.issues) if (!(issue.path in out)) out[issue.path] = issue.message;
    return out;
  }

  static is(error: unknown, code?: string): error is ApiError {
    return error instanceof ApiError && (code === undefined || error.code === code);
  }
}

/**
 * Turns any error into a localized message. Backend messages are English-only,
 * so we map by `code` and pattern-match the handful of stable 400 messages.
 */
export function useApiErrorMessage(): (error: unknown) => string {
  const { t, tf, locale } = useLocale();
  const e = t.errors;

  return (error) => {
    if (!ApiError.is(error)) return e.unknown;
    switch (error.code) {
      case 'NETWORK':
        return e.network;
      case 'TIMEOUT':
        return e.timeout;
      case 'UNAUTHORIZED':
        return e.unauthorized;
      case 'FORBIDDEN':
        return e.forbidden;
      case 'NOT_FOUND':
        return e.notFound;
      case 'CONFLICT':
      case 'ALREADY_EXISTS':
        return e.conflict;
      case 'RATE_LIMITED':
        return e.rateLimited;
      case 'VALIDATION_ERROR':
      case 'MISSING_FIELD':
      case 'INVALID_INPUT':
        return error.issues[0]?.message && locale === 'en' ? error.issues[0].message : e.validation;
      case 'BAD_REQUEST': {
        const m = error.message;
        const left = /Only (\d+) left/i.exec(m);
        if (left) return tf(e.onlyLeft, { count: left[1]! });
        if (/out of stock/i.test(m)) return e.outOfStock;
        if (/prescription.*(not been verified|not verified)/i.test(m)) return e.rxNotVerified;
        if (/prescription.*expired/i.test(m)) return e.rxExpired;
        if (/prescription.*rejected/i.test(m)) return e.rxRejected;
        if (/prescription is required/i.test(m)) return e.rxRequired;
        if (/promo code/i.test(m)) return e.promoInvalid;
        if (/colou?r is not available/i.test(m)) return e.colorUnavailable;
        if (/lens add-?ons/i.test(m)) return e.addonsUnsupported;
        if (/slot/i.test(m)) return e.slotUnavailable;
        if (/unavailable/i.test(m)) return e.itemsUnavailable;
        if (/delivery address/i.test(m)) return e.addressRequired;
        if (/cart is empty/i.test(m)) return e.cartEmpty;
        return locale === 'en' ? m : e.badRequest;
      }
      default:
        return e.server;
    }
  };
}
