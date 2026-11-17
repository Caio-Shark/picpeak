#!/usr/bin/env node
/**
 * Ferramenta de manutenção da tradução pt-BR (português brasileiro).
 *
 * O catálogo efetivo de `pt` é: locales/pt.json (upstream) sobreposto por
 * locales-ptbr/pt.json (traduções e correções pt-BR desta instalação).
 * Mantê-los separados evita conflitos de merge quando o upstream atualiza o pt.json.
 *
 * Uso (a partir de frontend/):
 *   node scripts/i18n-ptbr.mjs check            -> relatório; sai com código 1 se houver falhas
 *   node scripts/i18n-ptbr.mjs export <dir> [n] -> exporta chaves sem tradução em lotes de ~n caracteres
 *   node scripts/i18n-ptbr.mjs merge <arquivos> -> mescla JSONs planos {"chave":"texto"} no catálogo pt-BR
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const LOCALES = path.join(here, '..', 'src', 'i18n', 'locales');
const OVERLAY = path.join(here, '..', 'src', 'i18n', 'locales-ptbr', 'pt.json');

const readJson = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {});
const flatten = (obj, prefix = '', out = {}) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
};
const setDeep = (obj, key, value) => {
  const parts = key.split('.');
  let cur = obj;
  for (const p of parts.slice(0, -1)) {
    if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[parts.at(-1)] = value;
};
// Reconstrói um objeto aninhado seguindo a ordem de chaves do en.json.
const buildOrdered = (flatMap, enFlat) => {
  const out = {};
  for (const k of Object.keys(enFlat)) if (k in flatMap) setDeep(out, k, flatMap[k]);
  for (const k of Object.keys(flatMap)) if (!(k in enFlat)) setDeep(out, k, flatMap[k]);
  return out;
};

const placeholders = (s) => [...String(s).matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)].map((m) => m[1]).sort();
const tags = (s) => [...String(s).matchAll(/<\/?([a-zA-Z0-9]+)[^>]*>/g)].map((m) => m[0].replace(/\s.*>/, '>')).sort();
const nesting = (s) => [...String(s).matchAll(/\$t\(([^)]+)\)/g)].map((m) => m[1]).sort();
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Termos típicos de português europeu que não devem aparecer na interface pt-BR.
const PT_PT_TERMS = /\b(ficheiros?|utilizador(?:es)?|palavra-passe|ecrã|eliminad[oa]s?|eliminar|registo|contacto|equipa|telemóvel|definições|partilh\w*|aceder|actualiz\w*|selecção|guardar)\b/i;

function load() {
  const en = flatten(readJson(path.join(LOCALES, 'en.json')));
  const upstream = flatten(readJson(path.join(LOCALES, 'pt.json')));
  const overlay = flatten(readJson(OVERLAY));
  const effective = { ...upstream, ...overlay };
  return { en, upstream, overlay, effective };
}

// Chave plural de i18next (v4): a base "x" é coberta por "x_one"/"x_other".
const pluralBase = (k) => k.replace(/_(zero|one|two|few|many|other)$/, '');

function check() {
  const { en, overlay, effective } = load();
  const missing = [], badPh = [], badTags = [], badNest = [], euTerms = [], empty = [];
  for (const [k, v] of Object.entries(en)) {
    const pt = effective[k];
    if (pt === undefined) { missing.push(k); continue; }
    if (pt === '') { empty.push(k); continue; }
    const isPlural = k !== pluralBase(k);
    // Em plurais o "{{count}}" pode ser omitido na forma singular ("Uma foto").
    const phEn = placeholders(v).filter((p) => !(isPlural && p === 'count'));
    const phPt = placeholders(pt).filter((p) => !(isPlural && p === 'count'));
    if (!same([...new Set(phEn)], [...new Set(phPt)])) badPh.push([k, v, pt]);
    if (!same(tags(v), tags(pt))) badTags.push([k, v, pt]);
    if (!same(nesting(v), nesting(pt))) badNest.push([k, v, pt]);
    if (PT_PT_TERMS.test(String(pt))) euTerms.push([k, pt]);
  }
  const unknownOverlay = Object.keys(overlay).filter((k) => !(k in en) && !(pluralBase(k) + '_other' in en));
  const total = Object.keys(en).length;
  console.log(`Chaves no en.json:               ${total}`);
  console.log(`Traduzidas (pt efetivo):         ${total - missing.length} (${(((total - missing.length) / total) * 100).toFixed(2)}%)`);
  console.log(`  - vindas da sobreposição pt-BR: ${Object.keys(overlay).length}`);
  const report = (title, arr, fmt) => {
    console.log(`${title}: ${arr.length}`);
    arr.slice(0, 25).forEach((x) => console.log('   ' + fmt(x)));
  };
  report('Sem tradução', missing, (k) => k);
  report('Vazias', empty, (k) => k);
  report('Variáveis {{...}} divergentes', badPh, ([k, a, b]) => `${k}\n      en: ${a}\n      pt: ${b}`);
  report('Tags HTML/JSX divergentes', badTags, ([k, a, b]) => `${k}\n      en: ${a}\n      pt: ${b}`);
  report('Referências $t() divergentes', badNest, ([k]) => k);
  report('Termos de português europeu', euTerms, ([k, v]) => `${k}: ${v}`);
  report('Chaves da sobreposição inexistentes no en.json', unknownOverlay, (k) => k);
  const fail = missing.length + empty.length + badPh.length + badTags.length + badNest.length + euTerms.length;
  process.exitCode = fail ? 1 : 0;
}

function exportMissing(dir, maxChars = 9000) {
  const { en, effective } = load();
  fs.mkdirSync(dir, { recursive: true });
  let chunk = {}, size = 0, n = 0;
  const flush = () => {
    if (!Object.keys(chunk).length) return;
    const file = path.join(dir, `en-${String(++n).padStart(2, '0')}.json`);
    fs.writeFileSync(file, JSON.stringify(chunk, null, 1) + '\n');
    chunk = {}; size = 0;
  };
  for (const [k, v] of Object.entries(en)) {
    if (effective[k] !== undefined && effective[k] !== '') continue;
    const len = k.length + String(v).length + 8;
    if (size + len > maxChars) flush();
    chunk[k] = v; size += len;
  }
  flush();
  console.log(`${n} lote(s) exportado(s) para ${dir}`);
}

function merge(files) {
  const { en } = load();
  const overlay = flatten(readJson(OVERLAY));
  let added = 0;
  for (const f of files) {
    const data = flatten(readJson(f));
    for (const [k, v] of Object.entries(data)) {
      if (typeof v !== 'string') throw new Error(`${f}: valor não textual em ${k}`);
      overlay[k] = v; added++;
    }
  }
  fs.mkdirSync(path.dirname(OVERLAY), { recursive: true });
  fs.writeFileSync(OVERLAY, JSON.stringify(buildOrdered(overlay, en), null, 2) + '\n');
  console.log(`${added} entrada(s) mesclada(s) em ${path.relative(process.cwd(), OVERLAY)}`);
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'check') check();
else if (cmd === 'export') exportMissing(args[0], Number(args[1]) || 9000);
else if (cmd === 'merge') merge(args);
else {
  console.log('Uso: node scripts/i18n-ptbr.mjs check | export <dir> [maxChars] | merge <arquivos...>');
  process.exitCode = 2;
}
