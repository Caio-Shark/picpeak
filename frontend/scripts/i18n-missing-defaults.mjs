#!/usr/bin/env node
/**
 * Lista chamadas t('chave', 'texto padrão') cuja chave NÃO existe no en.json.
 * Nesses casos o i18next sempre mostra o texto padrão (em inglês), mesmo com a
 * interface em pt-BR, porque não há tradução a procurar.
 *
 * Uso (a partir de frontend/):
 *   node scripts/i18n-missing-defaults.mjs          -> relatório
 *   node scripts/i18n-missing-defaults.mjs --json   -> {"chave": "texto padrão"} para tradução
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const flatten = (o, p = '', r = {}) => {
  for (const [k, v] of Object.entries(o)) {
    const kk = p ? `${p}.${k}` : k;
    if (v && typeof v === 'object') flatten(v, kk, r); else r[kk] = v;
  }
  return r;
};
const en = flatten(JSON.parse(fs.readFileSync(path.join(root, 'i18n', 'locales', 'en.json'), 'utf8')));
const has = (k) => k in en || `${k}_other` in en || `${k}_one` in en;

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  if (e.isDirectory()) return e.name === '__tests__' ? [] : walk(path.join(d, e.name));
  return /\.tsx?$/.test(e.name) && !/\.test\./.test(e.name) ? [path.join(d, e.name)] : [];
});

const STR = String.raw`(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")`;
const re = new RegExp(String.raw`\bt\(\s*['"]([a-zA-Z][\w.-]*)['"]\s*,\s*(?:${STR}|\{[^}]*?defaultValue:\s*${STR})`, 'g');

const missing = {};
for (const file of walk(root)) {
  const src = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = re.exec(src))) {
    const key = m[1];
    if (!key.includes('.') || has(key)) continue;
    const def = (m[2] ?? m[3] ?? m[4] ?? m[5] ?? '').replace(/\\(['"\\])/g, '$1');
    if (!missing[key]) missing[key] = { def, file: path.relative(root, file).split(path.sep).join('/') };
  }
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(Object.fromEntries(Object.entries(missing).map(([k, v]) => [k, v.def])), null, 1));
} else {
  const keys = Object.keys(missing);
  console.log(`Chaves com texto padrão ausentes no en.json: ${keys.length}`);
  for (const k of keys) console.log(`${k}\t${missing[k].def}\t${missing[k].file}`);
  process.exitCode = keys.length ? 1 : 0;
}
