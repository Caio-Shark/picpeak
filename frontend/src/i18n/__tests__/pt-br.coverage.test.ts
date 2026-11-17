import { describe, expect, it } from 'vitest';
import i18n from '../config';
import en from '../locales/en.json';
import ptUpstream from '../locales/pt.json';
import ptOverlay from '../locales-ptbr/pt.json';

type Tree = Record<string, unknown>;
const flatten = (obj: Tree, prefix = '', out: Record<string, string> = {}) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flatten(v as Tree, key, out);
    else out[key] = String(v);
  }
  return out;
};
const placeholders = (s: string) =>
  [...new Set([...s.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)].map((m) => m[1]))].sort();
const isPlural = (k: string) => /_(zero|one|two|few|many|other)$/.test(k);

const enFlat = flatten(en as Tree);
const ptFlat = { ...flatten(ptUpstream as Tree), ...flatten(ptOverlay as Tree) };

describe('pt-BR catalog', () => {
  it('translates every English key', () => {
    const missing = Object.keys(enFlat).filter((k) => !ptFlat[k]);
    expect(missing).toEqual([]);
  });

  it('keeps every {{variable}} of the English text', () => {
    const broken = Object.keys(enFlat).filter((k) => {
      if (!ptFlat[k]) return false;
      const drop = (list: string[]) => (isPlural(k) ? list.filter((p) => p !== 'count') : list);
      return JSON.stringify(drop(placeholders(enFlat[k]))) !== JSON.stringify(drop(placeholders(ptFlat[k])));
    });
    expect(broken).toEqual([]);
  });

  it('does not use European Portuguese vocabulary', () => {
    const ptPt = /\b(ficheiros?|utilizador(?:es)?|palavra-passe|ecrã|eliminad[oa]s?|eliminar|registo|definições|partilh\w*|guardar)\b/i;
    expect(Object.entries(ptFlat).filter(([, v]) => ptPt.test(v)).map(([k]) => k)).toEqual([]);
  });

  it('serves the merged catalog at runtime for pt', async () => {
    const previous = i18n.language;
    try {
      await i18n.changeLanguage('pt');
      expect(i18n.t('navigation.dashboard')).toBe('Painel de controle');
      expect(i18n.t('setup.title')).toBe('Bem-vindo ao PicPeak');
    } finally {
      await i18n.changeLanguage(previous || 'en');
    }
  });
});
