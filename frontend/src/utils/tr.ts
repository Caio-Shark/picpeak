import i18next from 'i18next';

/**
 * Translate outside a component that already has `useTranslation()` in scope
 * (small render helpers, sub-components). Uses the global i18next instance set
 * up in i18n/config.ts and falls back to `defaultValue` when i18next has not
 * been initialised (e.g. isolated unit tests).
 */
export function tr(key: string, defaultValue: string, options: Record<string, unknown> = {}): string {
  if (!i18next.isInitialized) return defaultValue;
  return i18next.t(key, { defaultValue, ...options }) as string;
}

/**
 * Base code of the current UI language (e.g. "pt" for "pt-BR") when it is one
 * of `supported`, otherwise "en". Used to open translation editors on the
 * language the admin is working in instead of always on English.
 */
export function currentUiLanguage(supported: string[]): string {
  const base = String(i18next.language || '').split('-')[0];
  return supported.includes(base) ? base : 'en';
}
