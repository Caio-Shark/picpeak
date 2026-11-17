import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

const localeFiles = import.meta.glob<Record<string, string>>('./locales/*.json', { eager: true, import: 'default' });

// Locale overlays (e.g. locales-ptbr/pt.json) are deep-merged over the
// upstream catalog of the same language. Keeping them in a separate file lets
// the upstream locale be updated without merge conflicts, while the overlay
// completes and corrects it. Overlay values win.
const overlayFiles = import.meta.glob<Record<string, unknown>>('./locales-*/*.json', { eager: true, import: 'default' });

type Catalog = Record<string, unknown>;
const isObject = (v: unknown): v is Catalog => !!v && typeof v === 'object' && !Array.isArray(v);
const deepMerge = (base: Catalog, overlay: Catalog): Catalog => {
  const out: Catalog = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    out[key] = isObject(value) && isObject(out[key]) ? deepMerge(out[key] as Catalog, value) : value;
  }
  return out;
};

const resources: Record<string, { translation: Catalog }> = Object.fromEntries(
  Object.entries(localeFiles).map(([path, translations]) => {
    const lang = path.match(/\/(\w+)\.json$/)?.[1];
    return [lang, { translation: translations }];
  })
);

for (const [path, overlay] of Object.entries(overlayFiles)) {
  const lang = path.match(/\/(\w+)\.json$/)?.[1];
  if (!lang) continue;
  resources[lang] = { translation: deepMerge(resources[lang]?.translation ?? {}, overlay) };
}

// Optional installation default (build-time), e.g. VITE_DEFAULT_LANGUAGE=pt.
// It is consulted after an explicit user choice (localStorage/cookie) and
// before the browser language, so a visitor's own selection always wins.
const defaultLanguage = (import.meta.env.VITE_DEFAULT_LANGUAGE as string | undefined)?.trim();
const detector = new LanguageDetector();
detector.addDetector({
  name: 'installDefault',
  lookup: () => (defaultLanguage && defaultLanguage in resources ? defaultLanguage : undefined),
});

i18n
  .use(HttpBackend)
  .use(detector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,

    // i18next defaults this to `true`, which makes an empty-string translation
    // a *valid* lookup — it renders as blank UI instead of falling through to
    // `fallbackLng`. nl/pt/ru/fr/sl/es are deliberately partial locales, so an
    // empty value landing in one of them must fail safe to English rather than
    // silently blanking the label. No managed locale has one today; this keeps
    // it true by construction rather than by vigilance.
    returnEmptyString: false,

    resources,

    interpolation: {
      escapeValue: false,
    },

    // Use v4 format for pluralization (_one/_other instead of _plural suffix)
    compatibilityJSON: 'v4',

    detection: {
      order: ['localStorage', 'cookie', 'installDefault', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
      // Browsers report regional tags (pt-BR, de-DE). The catalogs and the
      // language selectors are keyed by base code, so normalise detected
      // values to it; otherwise a pt-BR browser shows the selector as English.
      convertDetectedLanguage: (lng: string) => lng.split('-')[0],
    },
  });

export default i18n;
