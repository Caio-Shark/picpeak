/**
 * Maps a document/UI language code to the Intl locale used to format money,
 * numbers and dates in PDFs and emails.
 *
 * The original code used `locale === 'de' ? 'de-CH' : 'en-GB'`, which made
 * every other language (including pt / pt-BR) render as en-GB
 * (1,234.56 and English month names). Unknown languages keep en-GB.
 */
const INTL_LOCALES = {
  de: 'de-CH',
  pt: 'pt-BR',
};

// Issuer country → Intl locale. DACH keeps the upstream de-CH rule.
const COUNTRY_LOCALES = {
  CH: 'de-CH', LI: 'de-CH', DE: 'de-CH', AT: 'de-CH',
  BR: 'pt-BR',
};

function intlLocaleFor(locale) {
  const base = String(locale || '').split(/[-_]/)[0].toLowerCase();
  return INTL_LOCALES[base] || 'en-GB';
}

function intlLocaleForCountry(countryCode) {
  return COUNTRY_LOCALES[String(countryCode || '').toUpperCase()] || null;
}

module.exports = { intlLocaleFor, intlLocaleForCountry };
