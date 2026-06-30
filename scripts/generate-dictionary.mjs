// Generates src/lib/allergen-dictionary.ts from Google Translate + manual overrides.
// Run with: node scripts/generate-dictionary.mjs
// Requires Node 18+. Takes ~5 minutes (102 languages × 14 allergens).

import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ALLERGENS = [
  'Milk', 'Eggs', 'Peanuts', 'Tree nuts', 'Gluten', 'Soy',
  'Fish', 'Crustaceans', 'Sesame', 'Molluscs', 'Mustard',
  'Sulphites', 'Celery', 'Lupin',
];

// All languages from translator.ts, excluding English
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
  { code: 'ha',     name: 'Hausa' },
  { code: 'haw',    name: 'Hawaiian' },
  { code: 'iw',     name: 'Hebrew' },
  { code: 'hi',     name: 'Hindi' },
  { code: 'hu',     name: 'Hungarian' },
  { code: 'is',     name: 'Icelandic' },
  { code: 'id',     name: 'Indonesian' },
  { code: 'ga',     name: 'Irish' },
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
  { code: 'gd',     name: 'Scots Gaelic' },
  { code: 'sr',     name: 'Serbian' },
  { code: 'st',     name: 'Sesotho' },
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
  { code: 'cy',     name: 'Welsh' },
  { code: 'yi',     name: 'Yiddish' },
  { code: 'yo',     name: 'Yoruba' },
  { code: 'zu',     name: 'Zulu' },
];

// Verified manual corrections — these override whatever Google Translate returns.
// Keys are lowercase English allergen names.
const MANUAL_OVERRIDES = {
  'es-ES': {
    'peanuts':    'cacahuetes',
    'peanut':     'cacahuete',
  },
  'es-419': {
    'peanuts':    'maníes',
    'peanut':     'maní',
  },
  'hi': {
    'sesame':     'तिल',
    'lupin':      'ल्यूपिन बीन्स',
  },
  'ko': {
    'peanuts':    '땅콩',
  },
  'id': {
    'gluten':     'Gluten',
  },
  'th': {
    'crustaceans': 'กุ้ง กุ้งทะเล ปู',
    'molluscs':    'มอลลัสก์',
  },
  'el': {
    'lupin':      'λούπινο',
  },
  'ny': {
    'crustaceans': 'shirimpi nkhanu',
    'mustard':     'mpiru',
  },
  'yue': {
    'gluten':     '麵筋',
  },
  'et': {
    'crustaceans': 'Koorikloomad',
  },
  'fi': {
    'eggs':       'Kananmunat',
  },
  'ht': {
    'molluscs':   'molusks',
  },
  'haw': {
    'tree nuts':  "hua kumulā'au",
    'celery':     'kālere',
  },
  'kn': {
    'crustaceans': 'ಕಠಿಣಚರ್ಮಿ ಪ್ರಾಣಿಗಳು',
  },
  'km': {
    'gluten':      'គ្លូតែន',
    'molluscs':    'សត្វមានសែក',
    'crustaceans': 'សត្វក្តាម',
  },
  'lo': {
    'tree nuts':  'ໝາກໄມ້ເປືອກແຂງ',
    'molluscs':   'ສັດທີ່ມີເປືອກ',
    'mustard':    'ມັດສະຕາດ',
    'sulphites':  'ຊັນໄຟດ໌',
  },
  'la': {
    'peanuts':    'arachides',
    'tree nuts':  'nuces arboreae',
    'gluten':     'gluten',
    'celery':     'apium',
    'lupin':      'lupinum',
  },
  'mg': {
    'crustaceans': 'Hazandrano akorandriaka',
  },
  'mi': {
    'soy':        'Hōiā',
    'sesame':     'Kākano hēhami',
    'sulphites':  'Ngā pūkawa whanariki',
    'celery':     'Herewi',
    'lupin':      'Lūpini',
  },
  'my': {
    'molluscs':   'ခရုနှင့် အခွံမာရေသတ္တဝါများ',
  },
  'pa': {
    'soy':        'ਸੋਇਆਬੀਨ',
    'celery':     'ਸੈਲਰੀ',
  },
  'gd': {
    'soy':        'pònair soighe',
    'celery':     'soilire',
  },
  'sd': {
    'eggs':       'آنا',
    'sesame':     'تل',
    'mustard':    'سرسوں',
  },
  'su': {
    'peanuts':    'kacang tanah',
    'fish':       'lauk ikan',
  },
  'tg': {
    'soy':        'лубиё',
  },
  'uz': {
    'peanuts':    "yeryong'oq",
    'gluten':     'kleykovina',
    'soy':        'soya',
    'sesame':     'kunjut',
  },
};

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
  const total = LANGUAGES.length * ALLERGENS.length;
  const estimatedMins = Math.ceil(total * DELAY_MS / 60000);
  console.log('=== Allergen Dictionary Generator ===');
  console.log(`${ALLERGENS.length} allergens × ${LANGUAGES.length} languages = ${total} API calls`);
  console.log(`Estimated time: ~${estimatedMins} minutes\n`);

  const dictionary = {};
  let done = 0;

  for (const lang of LANGUAGES) {
    process.stdout.write(`[${String(done / ALLERGENS.length + 1).padStart(3)}/${LANGUAGES.length}] ${lang.name.padEnd(28)}`);
    const entries = {};
    const overrides = MANUAL_OVERRIDES[lang.code] || {};

    for (const allergen of ALLERGENS) {
      const key = allergen.toLowerCase();
      if (overrides[key]) {
        entries[key] = overrides[key];
      } else {
        const result = await translateWithRetry(allergen, lang.code);
        if (result && result.toLowerCase() !== allergen.toLowerCase()) {
          entries[key] = result;
        } else if (result) {
          // Translation same as English — still store it so the dictionary is complete
          entries[key] = result;
        }
        await sleep(DELAY_MS);
      }
      done++;
    }

    dictionary[lang.code] = entries;
    process.stdout.write(`✓\n`);
  }

  // Build TypeScript source
  const lines = [];
  lines.push('// Auto-generated by scripts/generate-dictionary.mjs');
  lines.push('// Manual corrections are marked inline. Do not edit the generated sections by hand —');
  lines.push('// update MANUAL_OVERRIDES in generate-dictionary.mjs and re-run the script.');
  lines.push('');
  lines.push('export const ALLERGEN_DICTIONARY: Record<string, Record<string, string>> = {');

  for (const lang of LANGUAGES) {
    const entries = dictionary[lang.code];
    const overrides = MANUAL_OVERRIDES[lang.code] || {};
    lines.push(`  // ${lang.name}`);
    lines.push(`  '${lang.code}': {`);
    for (const allergen of ALLERGENS) {
      const key = allergen.toLowerCase();
      const value = entries[key];
      if (!value) continue;
      const tag = overrides[key] ? ' // verified' : '';
      // Lowercased for storage consistency — translateText() re-capitalizes the
      // first letter on display. toLowerCase() is a no-op on scripts without case
      // (CJK, Arabic, Thai, Devanagari, etc.), so this only affects Latin/Cyrillic/
      // Greek/Armenian-script entries.
      lines.push(`    '${escapeTs(key)}': '${escapeTs(value.toLowerCase())}',${tag}`);
    }
    lines.push(`  },`);
  }

  lines.push('};');
  lines.push('');
  lines.push('// Regional overrides for sentence-level dialect corrections.');
  lines.push('// These patch Google Translate output for custom allergen and free-text fields.');
  lines.push('export const REGIONAL_OVERRIDES: Record<string, Record<string, string>> = {');
  lines.push("  'es-ES': {");
  lines.push("    'Maní': 'Cacahuete',");
  lines.push("    'maní': 'cacahuete',");
  lines.push("    'Maníes': 'Cacahuetes',");
  lines.push("    'maníes': 'cacahuetes',");
  lines.push("    'Miseria': 'Cacahuetes',");
  lines.push("    'miseria': 'cacahuetes',");
  lines.push("    'Soya': 'Soja',");
  lines.push("    'soya': 'soja',");
  lines.push("    'Frutos secos': 'Frutos de cáscara',");
  lines.push("    'frutos secos': 'frutos de cáscara',");
  lines.push("    'Durazno': 'Melocotón',");
  lines.push("    'durazno': 'melocotón',");
  lines.push("    'Duraznos': 'Melocotones',");
  lines.push("    'duraznos': 'melocotones',");
  lines.push("    'Frutilla': 'Fresa',");
  lines.push("    'frutilla': 'fresa',");
  lines.push("    'Frutillas': 'Fresas',");
  lines.push("    'frutillas': 'fresas',");
  lines.push("    'Papa': 'Patata',");
  lines.push("    'papa': 'patata',");
  lines.push("    'Papas': 'Patatas',");
  lines.push("    'papas': 'patatas',");
  lines.push("    'Jugo': 'Zumo',");
  lines.push("    'jugo': 'zumo',");
  lines.push("    'Jugos': 'Zumos',");
  lines.push("    'jugos': 'zumos',");
  lines.push("    'Celular': 'Móvil',");
  lines.push("    'celular': 'móvil',");
  lines.push("    'Maracuyá': 'Fruta de la pasión',");
  lines.push("    'maracuyá': 'fruta de la pasión',");
  lines.push("    'Camote': 'Batata',");
  lines.push("    'camote': 'batata',");
  lines.push("    'Frijol verde': 'Judía verde',");
  lines.push("    'frijol verde': 'judía verde',");
  lines.push("    'Frijoles verdes': 'Judías verdes',");
  lines.push("    'frijoles verdes': 'judías verdes',");
  lines.push("    'Frijol': 'Judía',");
  lines.push("    'frijol': 'judía',");
  lines.push("    'Frijoles': 'Judías',");
  lines.push("    'frijoles': 'judías',");
  lines.push('  },');
  lines.push('};');
  lines.push('');

  const output = lines.join('\n');
  const outPath = join(__dirname, '..', 'src', 'lib', 'allergen-dictionary.ts');
  await writeFile(outPath, output, 'utf8');

  console.log('\n=====================================');
  console.log('DONE');
  console.log(`Written → src/lib/allergen-dictionary.ts`);
  console.log(`${LANGUAGES.length} languages × ${ALLERGENS.length} allergens`);
}

main().catch(err => {
  console.error('\nFatal:', err.message);
  process.exit(1);
});
