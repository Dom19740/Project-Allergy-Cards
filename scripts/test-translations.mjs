// Allergen Translation Round-Trip Test
// Run with: node scripts/test-translations.mjs
// Requires Node 18+ (built-in fetch)

import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const LANGUAGES = [
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr',    name: 'French' },
  { code: 'ar',    name: 'Arabic' },
  { code: 'pt-BR', name: 'Portuguese (Brazilian)' },
  { code: 'ru',    name: 'Russian' },
  { code: 'de',    name: 'German' },
  { code: 'ja',    name: 'Japanese' },
  { code: 'hi',    name: 'Hindi' },
  { code: 'ko',    name: 'Korean' },
  { code: 'it',    name: 'Italian' },
  { code: 'nl',    name: 'Dutch' },
  { code: 'tr',    name: 'Turkish' },
  { code: 'pl',    name: 'Polish' },
  { code: 'vi',    name: 'Vietnamese' },
  { code: 'id',    name: 'Indonesian' },
  { code: 'th',    name: 'Thai' },
  { code: 'uk',    name: 'Ukrainian' },
  { code: 'ro',    name: 'Romanian' },
  { code: 'fa',    name: 'Persian' },
  { code: 'bn',    name: 'Bengali' },
  { code: 'el',    name: 'Greek' },
  { code: 'sv',    name: 'Swedish' },
  { code: 'iw',    name: 'Hebrew' },
  { code: 'ms',    name: 'Malay' },
];

const ALLERGENS = [
  'Milk',
  'Eggs',
  'Peanuts',
  'Tree nuts',
  'Gluten',
  'Soy',
  'Fish',
  'Crustaceans',
  'Sesame',
  'Molluscs',
  'Mustard',
  'Sulphites',
  'Celery',
  'Lupin',
];

const DELAY_MS = 200;

async function translate(text, sourceLang, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data?.[0] && Array.isArray(data[0])) {
    return data[0]
      .map(segment => segment[0])
      .filter(t => typeof t === 'string')
      .join('');
  }
  throw new Error('Unexpected API response format');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array(n + 1).fill(0).map((_, j) => j === 0 ? i : 0));
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
  const a = original.toLowerCase().trim();
  const b = backTranslated.toLowerCase().trim();
  if (a === b) return 'PASS';
  if (a.includes(b) || b.includes(a)) return 'FUZZY';
  if (levenshtein(a, b) <= 2) return 'FUZZY';
  return 'FAIL';
}

const STATUS_ICON = { PASS: '✅', FUZZY: '⚠️', FAIL: '❌' };

async function main() {
  const totalCalls = LANGUAGES.length * ALLERGENS.length * 2;
  const estimatedMins = Math.ceil(totalCalls * DELAY_MS / 60000);
  console.log('=== Allergen Translation Round-Trip Test ===');
  console.log(`${ALLERGENS.length} allergens × ${LANGUAGES.length} languages = ${totalCalls} API calls`);
  console.log(`Estimated time: ~${estimatedMins} minutes\n`);

  const results = [];

  for (const lang of LANGUAGES) {
    process.stdout.write(`[${String(results.length + 1).padStart(2)}/${LANGUAGES.length}] ${lang.name.padEnd(24)}`);
    const items = [];

    for (const allergen of ALLERGENS) {
      try {
        const forward = await translate(allergen, 'en', lang.code);
        await sleep(DELAY_MS);
        const back = await translate(forward, lang.code, 'en');
        await sleep(DELAY_MS);
        items.push({ allergen, forward, back, status: classify(allergen, back) });
      } catch (err) {
        items.push({ allergen, forward: 'API ERROR', back: 'API ERROR', status: 'FAIL' });
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

  // --- Build report ---
  const lines = [];
  lines.push('# Allergen Translation Accuracy Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toUTCString()}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('> Sorted by most failures first.');
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
  lines.push('## Details by Language');
  lines.push('');

  for (const { name, code, items } of results) {
    const failCount = items.filter(i => i.status !== 'PASS').length;
    const badge = failCount === 0 ? ' ✅ All correct' : ` ❌ ${failCount} issue(s)`;
    lines.push(`### ${name} (\`${code}\`)${badge}`);
    lines.push('');
    lines.push(`| Allergen | → ${name} | → Back to English | Status |`);
    lines.push('|----------|----------|-------------------|--------|');
    for (const { allergen, forward, back, status } of items) {
      lines.push(`| ${allergen} | ${forward} | ${back} | ${STATUS_ICON[status]} ${status} |`);
    }
    lines.push('');
  }

  const report = lines.join('\n');
  const outPath = join(__dirname, 'translation-report.md');
  await writeFile(outPath, report, 'utf8');

  console.log('\n===========================================');
  console.log('DONE');
  console.log(`✅ ${totals.pass} pass  ⚠️ ${totals.fuzzy} fuzzy  ❌ ${totals.fail} fail`);
  console.log(`Report saved → scripts/translation-report.md`);
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
