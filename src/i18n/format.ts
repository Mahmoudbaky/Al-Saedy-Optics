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
