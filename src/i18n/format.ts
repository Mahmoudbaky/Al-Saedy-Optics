import type { Locale } from './locale';

const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

/**
 * Converts Western digits to Arabic-Indic digits for Arabic UI copy
 * (counts, dates, times). Prices intentionally keep Western digits, as in the design.
 */
export function localizeDigits(value: string | number, locale: Locale): string {
  const text = String(value);
  if (locale !== 'ar') return text;
  return text.replace(/\d/g, (d) => ARABIC_INDIC_DIGITS[Number(d)]);
}

/** Formats an IQD amount: `85,000 د.ع` in Arabic, `IQD 85,000` in English. */
export function formatPrice(amount: number, locale: Locale, currency: string): string {
  const grouped = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount);
  return locale === 'ar' ? `${grouped} ${currency}` : `${currency} ${grouped}`;
}

/** Compact price without the currency label, e.g. for "VC 210 · 69,000". */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount);
}

/** Replaces `{key}` placeholders in a translation string. */
export function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
}

/* ── Dates ─────────────────────────────────────────────────────────── */

/** The clinic and all customers are in Iraq; the API returns UTC instants. */
export const TIME_ZONE = 'Asia/Baghdad';

/** `ar-IQ` with Arabic-Indic digits keeps dates consistent with `localizeDigits`. */
const tagFor = (locale: Locale) => (locale === 'ar' ? 'ar-IQ-u-nu-arab' : 'en-IQ');

/**
 * Parses an ISO instant or a date-only `YYYY-MM-DD`. Date-only values are pinned to
 * noon Baghdad so they never shift a day when formatted in the clinic timezone.
 */
export function parseApiDate(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00+03:00`) : new Date(value);
}

function fmt(value: string, locale: Locale, options: Intl.DateTimeFormatOptions): string {
  const date = parseApiDate(value);
  if (Number.isNaN(date.getTime())) return value;
  try {
    return new Intl.DateTimeFormat(tagFor(locale), { timeZone: TIME_ZONE, ...options }).format(date);
  } catch {
    return new Intl.DateTimeFormat(locale, { timeZone: TIME_ZONE, ...options }).format(date);
  }
}

/** `12 August 2026` / `١٢ آب ٢٠٢٦` (or short: `12 Aug`). */
export function formatDate(value: string, locale: Locale, style: 'long' | 'short' = 'long'): string {
  return style === 'long' ? fmt(value, locale, { day: 'numeric', month: 'long', year: 'numeric' }) : fmt(value, locale, { day: 'numeric', month: 'short' });
}

/** `Wed, 13 Aug · 4:00 PM` */
export function formatDateTime(value: string, locale: Locale): string {
  return fmt(value, locale, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

/** `4:00 PM` / `٤:٠٠ م` */
export function formatTime(value: string, locale: Locale): string {
  return fmt(value, locale, { hour: 'numeric', minute: '2-digit' });
}

/** `Wed` / `الأربعاء` */
export function formatWeekday(value: string, locale: Locale, width: 'short' | 'long' = 'short'): string {
  return fmt(value, locale, { weekday: width });
}

/** Day of month only: `13` / `١٣`. */
export function formatDayNumber(value: string, locale: Locale): string {
  return fmt(value, locale, { day: 'numeric' });
}
