// Generates src/lib/ui-text-dictionary.ts from Google Translate.
// Covers the fixed UI/emergency strings used in AllergyCard.tsx and EmergencyPage.tsx.
// Run with: node scripts/generate-ui-dictionary.mjs
// Requires Node 18+. Takes ~4 minutes (93 languages × 11 strings).

import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// label: short identifier for readability in the generated file/comments.
// text: exact source string passed to translateText() in the app — must match exactly.
const STRINGS = [
  { label: 'allergyAlert',    text: 'ALLERGY ALERT!' },
  { label: 'pleaseBeCareful', text: 'Please be careful with my food.' },
  { label: 'thankYou',        text: 'Thank you!' },
  { label: 'iAmAllergicTo',   text: 'I can not eat:' },
  { label: 'theyMakeMeSick',  text: 'They make me very sick and I could die' },
  { label: 'attention',       text: 'ATTENTION' },
  { label: 'emergency',       text: 'I am having a severe allergic reaction.' },
  { label: 'needHelp',        text: 'I need medical help immediately.' },
  { label: 'callServices',    text: 'Please call emergency services.' },
  { label: 'dial112',         text: 'DIAL 112' },
  { label: 'call',            text: 'CALL' },
];

// Must match the language list in src/lib/translator.ts / allergen-dictionary.ts exactly.
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

// Verified manual corrections — same mechanism as generate-dictionary.mjs.
// Empty for now; add entries here (keyed by language code, then lowercase source text)
// if a specific translation needs fixing, then re-run this script.
const MANUAL_OVERRIDES = {};

const DELAY_MS = 200;

async function translate(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data?.[0] && Array.isArray(data[0])) {
    return data[0].map(s => s[0]).filter(t => typeof t === 'string').join('');
  }
  throw new Error('Unexpected response');
}

async function translateWithRetry(text, langCode, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await translate(text, langCode);
    } catch (err) {
      if (i < retries - 1) {
        await sleep(1000 * (i + 1));
      } else {
        console.warn(`\n  ⚠ Failed to translate "${text}" → ${langCode}: ${err.message}`);
        return null;
      }
    }
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function escapeTs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function main() {
  const total = LANGUAGES.length * STRINGS.length;
  const estimatedMins = Math.ceil(total * DELAY_MS / 60000);
  console.log('=== UI Text Dictionary Generator ===');
  console.log(`${STRINGS.length} strings × ${LANGUAGES.length} languages = ${total} API calls`);
  console.log(`Estimated time: ~${estimatedMins} minutes\n`);

  const dictionary = {};
  let done = 0;

  for (const lang of LANGUAGES) {
    process.stdout.write(`[${String(done / STRINGS.length + 1).padStart(3)}/${LANGUAGES.length}] ${lang.name.padEnd(28)}`);
    const entries = {};
    const overrides = MANUAL_OVERRIDES[lang.code] || {};

    for (const { label, text } of STRINGS) {
      const key = text.toLowerCase();
      if (overrides[key]) {
        entries[key] = overrides[key];
      } else {
        const result = await translateWithRetry(text, lang.code);
        if (result) entries[key] = result;
        await sleep(DELAY_MS);
      }
      done++;
    }

    dictionary[lang.code] = entries;
    process.stdout.write(`✓\n`);
  }

  // Build TypeScript source
  const lines = [];
  lines.push('// Auto-generated by scripts/generate-ui-dictionary.mjs');
  lines.push('// Manual corrections are marked inline. Do not edit the generated sections by hand —');
  lines.push('// update MANUAL_OVERRIDES in generate-ui-dictionary.mjs and re-run the script.');
  lines.push('//');
  lines.push('// Keys are the exact fixed strings (lowercased) passed to translateText() in');
  lines.push('// AllergyCard.tsx and EmergencyPage.tsx — ALLERGY ALERT!, ATTENTION, etc.');
  lines.push('');
  lines.push('export const UI_TEXT_DICTIONARY: Record<string, Record<string, string>> = {');

  for (const lang of LANGUAGES) {
    const entries = dictionary[lang.code];
    const overrides = MANUAL_OVERRIDES[lang.code] || {};
    lines.push(`  // ${lang.name}`);
    lines.push(`  '${lang.code}': {`);
    for (const { text } of STRINGS) {
      const key = text.toLowerCase();
      const value = entries[key];
      if (!value) continue;
      const tag = overrides[key] ? ' // verified' : '';
      // Lowercased for storage consistency — translateText() re-capitalizes the
      // first letter on display. toLowerCase() is a no-op on scripts without case.
      lines.push(`    '${escapeTs(key)}': '${escapeTs(value.toLowerCase())}',${tag}`);
    }
    lines.push(`  },`);
  }

  lines.push('};');
  lines.push('');

  const output = lines.join('\n');
  const outPath = join(__dirname, '..', 'src', 'lib', 'ui-text-dictionary.ts');
  await writeFile(outPath, output, 'utf8');

  console.log('\n=====================================');
  console.log('DONE');
  console.log(`Written → src/lib/ui-text-dictionary.ts`);
  console.log(`${LANGUAGES.length} languages × ${STRINGS.length} strings`);
}

main().catch(err => {
  console.error('\nFatal:', err.message);
  process.exit(1);
});
