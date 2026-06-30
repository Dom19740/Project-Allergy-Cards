// Round-trip accuracy test for fixed UI/emergency strings (non-allergen).
// Run with: node scripts/test-ui-text-translations.mjs
// Requires Node 18+. PASS results are omitted from detail tables.

import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Must match the full language set in src/lib/translator.ts exactly.
const LANGUAGES = [
  { code: 'af',     name: 'Afrikaans' },
  { code: 'sq',     name: 'Albanian' },
  { code: 'am',     name: 'Amharic' },
  { code: 'ar',     name: 'Arabic' },
  { code: 'hy',     name: 'Armenian' },
  { code: 'az',     name: 'Azerbaijani' },
  { code: 'eu',     name: 'Basque' },
  { code: 'be',     name: 'Belarusian' },
  { code: 'bn',     name: 'Bengali' },
  { code: 'bs',     name: 'Bosnian' },
  { code: 'bg',     name: 'Bulgarian' },
  { code: 'ca',     name: 'Catalan' },
  { code: 'ceb',    name: 'Cebuano' },
  { code: 'ny',     name: 'Chichewa' },
  { code: 'zh-CN',  name: 'Chinese (Simplified)' },
  { code: 'yue',    name: 'Cantonese' },
  { code: 'co',     name: 'Corsican' },
  { code: 'hr',     name: 'Croatian' },
  { code: 'cs',     name: 'Czech' },
  { code: 'da',     name: 'Danish' },
  { code: 'nl',     name: 'Dutch' },
  { code: 'eo',     name: 'Esperanto' },
  { code: 'et',     name: 'Estonian' },
  { code: 'es-ES',  name: 'Spanish (European)' },
  { code: 'es-419', name: 'Spanish (Latin America)' },
  { code: 'tl',     name: 'Filipino' },
  { code: 'fi',     name: 'Finnish' },
  { code: 'fr',     name: 'French' },
  { code: 'fy',     name: 'Frisian' },
  { code: 'gl',     name: 'Galician' },
  { code: 'ka',     name: 'Georgian' },
  { code: 'de',     name: 'German' },
  { code: 'el',     name: 'Greek' },
  { code: 'gu',     name: 'Gujarati' },
  { code: 'ht',     name: 'Haitian Creole' },
  { code: 'iw',     name: 'Hebrew' },
  { code: 'hi',     name: 'Hindi' },
  { code: 'hu',     name: 'Hungarian' },
  { code: 'is',     name: 'Icelandic' },
  { code: 'id',     name: 'Indonesian' },
  { code: 'it',     name: 'Italian' },
  { code: 'ja',     name: 'Japanese' },
  { code: 'jw',     name: 'Javanese' },
  { code: 'kn',     name: 'Kannada' },
  { code: 'kk',     name: 'Kazakh' },
  { code: 'km',     name: 'Khmer (Cambodian)' },
  { code: 'ko',     name: 'Korean' },
  { code: 'ku',     name: 'Kurdish (Kurmanji)' },
  { code: 'ky',     name: 'Kyrgyz' },
  { code: 'lo',     name: 'Lao' },
  { code: 'la',     name: 'Latin' },
  { code: 'lv',     name: 'Latvian' },
  { code: 'lt',     name: 'Lithuanian' },
  { code: 'lb',     name: 'Luxembourgish' },
  { code: 'mk',     name: 'Macedonian' },
  { code: 'mg',     name: 'Malagasy' },
  { code: 'ms',     name: 'Malay' },
  { code: 'ml',     name: 'Malayalam' },
  { code: 'mt',     name: 'Maltese' },
  { code: 'mi',     name: 'Maori' },
  { code: 'mr',     name: 'Marathi' },
  { code: 'mn',     name: 'Mongolian' },
  { code: 'my',     name: 'Myanmar (Burmese)' },
  { code: 'ne',     name: 'Nepali' },
  { code: 'no',     name: 'Norwegian' },
  { code: 'ps',     name: 'Pashto' },
  { code: 'fa',     name: 'Persian' },
  { code: 'pl',     name: 'Polish' },
  { code: 'pt-BR',  name: 'Portuguese (Brazilian)' },
  { code: 'pt-PT',  name: 'Portuguese (European)' },
  { code: 'pa',     name: 'Punjabi' },
  { code: 'ro',     name: 'Romanian' },
  { code: 'ru',     name: 'Russian' },
  { code: 'sm',     name: 'Samoan' },
  { code: 'sr',     name: 'Serbian' },
  { code: 'sd',     name: 'Sindhi' },
  { code: 'si',     name: 'Sinhala' },
  { code: 'sk',     name: 'Slovak' },
  { code: 'sl',     name: 'Slovenian' },
  { code: 'so',     name: 'Somali' },
  { code: 'su',     name: 'Sundanese' },
  { code: 'sw',     name: 'Swahili' },
  { code: 'sv',     name: 'Swedish' },
  { code: 'tg',     name: 'Tajik' },
  { code: 'ta',     name: 'Tamil' },
  { code: 'te',     name: 'Telugu' },
  { code: 'th',     name: 'Thai' },
  { code: 'tr',     name: 'Turkish' },
  { code: 'uk',     name: 'Ukrainian' },
  { code: 'ur',     name: 'Urdu' },
  { code: 'uz',     name: 'Uzbek' },
  { code: 'vi',     name: 'Vietnamese' },
  { code: 'yi',     name: 'Yiddish' },
];

// Fixed strings actually used in AllergyCard.tsx and EmergencyPage.tsx.
// Keys are short labels for the report; "text" is the exact source string passed to translateText().
const STRINGS = [
  { label: 'AllergyAlert',    text: 'ALLERGY ALERT!' },
  { label: 'PleaseBeCareful', text: 'Please be careful with my food.' },
  { label: 'ThankYou',        text: 'Thank you!' },
  { label: 'IAmAllergicTo',   text: 'I can not eat:' },
  { label: 'TheyMakeMeSick',  text: 'They make me very sick and I could die' },
  { label: 'Attention',       text: 'ATTENTION' },
  { label: 'Emergency',       text: 'I am having a severe allergic reaction.' },
  { label: 'NeedHelp',        text: 'I need medical help immediately.' },
  { label: 'CallServices',    text: 'Please call emergency services.' },
  { label: 'Dial112',         text: 'DIAL 112' },
  { label: 'Call',            text: 'CALL' },
];

const DELAY_MS = 200;

async function translate(text, sourceLang, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data?.[0] && Array.isArray(data[0])) {
    return data[0].map(s => s[0]).filter(t => typeof t === 'string').join('');
  }
  throw new Error('Unexpected API response format');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array(n + 1).fill(0).map((_, j) => (j === 0 ? i : 0)));
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function classify(original, backTranslated) {
  const a = original.toLowerCase().trim().replace(/[.!:,]/g, '');
  const b = backTranslated.toLowerCase().trim().replace(/[.!:,]/g, '');
  if (a === b) return 'PASS';
  if (a.includes(b) || b.includes(a)) return 'FUZZY';
  const dist = levenshtein(a, b);
  const threshold = Math.max(3, Math.floor(a.length * 0.2));
  if (dist <= threshold) return 'FUZZY';
  return 'FAIL';
}

const STATUS_ICON = { PASS: '✅', FUZZY: '⚠️', FAIL: '❌' };

async function main() {
  const totalCalls = LANGUAGES.length * STRINGS.length * 2;
  const estimatedMins = Math.ceil(totalCalls * DELAY_MS / 60000);
  console.log('=== UI/Emergency Text Round-Trip Test ===');
  console.log(`${STRINGS.length} strings × ${LANGUAGES.length} languages = ${totalCalls} API calls`);
  console.log(`Estimated time: ~${estimatedMins} minutes\n`);

  const results = [];

  for (const lang of LANGUAGES) {
    process.stdout.write(`[${String(results.length + 1).padStart(3)}/${LANGUAGES.length}] ${lang.name.padEnd(28)}`);
    const items = [];

    for (const { label, text } of STRINGS) {
      try {
        const forward = await translate(text, 'en', lang.code);
        await sleep(DELAY_MS);
        const back = await translate(forward, lang.code, 'en');
        await sleep(DELAY_MS);
        items.push({ label, text, forward, back, status: classify(text, back) });
      } catch (err) {
        items.push({ label, text, forward: 'API ERROR', back: 'API ERROR', status: 'FAIL' });
      }
    }

    const counts = {
      pass:  items.filter(i => i.status === 'PASS').length,
      fuzzy: items.filter(i => i.status === 'FUZZY').length,
      fail:  items.filter(i => i.status === 'FAIL').length,
    };
    console.log(`✅ ${counts.pass}  ⚠️ ${counts.fuzzy}  ❌ ${counts.fail}`);
    results.push({ ...lang, items, ...counts });
  }

  const lines = [];
  lines.push('# UI/Emergency Text Translation Accuracy Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toUTCString()}`);
  lines.push('');
  lines.push('> PASS results are omitted from detail tables. Only ⚠️ FUZZY and ❌ FAIL rows are shown.');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Language | Code | ✅ Pass | ⚠️ Fuzzy | ❌ Fail |');
  lines.push('|----------|------|:-------:|:--------:|:-------:|');

  const sorted = [...results].sort((a, b) => b.fail - a.fail || b.fuzzy - a.fuzzy);
  for (const r of sorted) {
    lines.push(`| ${r.name} | \`${r.code}\` | ${r.pass} | ${r.fuzzy} | ${r.fail} |`);
  }

  const allItems = results.flatMap(r => r.items);
  const totals = {
    pass:  allItems.filter(i => i.status === 'PASS').length,
    fuzzy: allItems.filter(i => i.status === 'FUZZY').length,
    fail:  allItems.filter(i => i.status === 'FAIL').length,
  };
  lines.push(`| **TOTAL** | — | **${totals.pass}** | **${totals.fuzzy}** | **${totals.fail}** |`);

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Issues by Language');
  lines.push('');
  lines.push('> Languages where every string was a PASS are not listed here.');
  lines.push('');

  for (const { name, code, items } of results) {
    const issues = items.filter(i => i.status !== 'PASS');
    if (issues.length === 0) continue;

    lines.push(`### ${name} (\`${code}\`) — ${issues.length} issue(s)`);
    lines.push('');
    lines.push(`| String | Source | → ${name} | → Back to English | Status |`);
    lines.push('|--------|--------|----------|-------------------|--------|');
    for (const { label, text, forward, back, status } of issues) {
      lines.push(`| ${label} | ${text} | ${forward} | ${back} | ${STATUS_ICON[status]} ${status} |`);
    }
    lines.push('');
  }

  const report = lines.join('\n');
  const outPath = join(__dirname, 'ui-text-report.md');
  await writeFile(outPath, report, 'utf8');

  console.log('\n===========================================');
  console.log('DONE');
  console.log(`✅ ${totals.pass} pass  ⚠️ ${totals.fuzzy} fuzzy  ❌ ${totals.fail} fail`);
  console.log(`Report saved → scripts/ui-text-report.md`);
}

main().catch(err => {
  console.error('\nFatal:', err.message);
  process.exit(1);
});
