const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Mirrors the backend address/profile phone rule. */
const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/;

export const isEmail = (value: string) => EMAIL_RE.test(value.trim());
export const isPhone = (value: string) => PHONE_RE.test(value.trim());
export const MIN_PASSWORD = 8;
