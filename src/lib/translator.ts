"use client";

import { LanguageCode } from './types';
import { ALLERGEN_DICTIONARY, REGIONAL_OVERRIDES } from './allergen-dictionary';
import { UI_TEXT_DICTIONARY } from './ui-text-dictionary';

export interface SupportedLanguage {
  code: LanguageCode;
  name: string;
}

// Preserve capitalization if the original text was capitalized
const applyCapitalization = (text: string, translation: string): string => {
  if (text[0] === text[0].toUpperCase() && text[0] !== text[0].toLowerCase()) {
    return translation.charAt(0).toUpperCase() + translation.slice(1);
  }
  return translation;
};

/**
 * Translates text using local dictionaries first, then falls back to the Google Translate API.
 */
export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text || !targetLanguage || targetLanguage === 'en') return text;

  const normalizedText = text.toLowerCase().trim();

  // 1. Check local dictionaries first (case-insensitive)
  const allergenEntry = ALLERGEN_DICTIONARY[targetLanguage]?.[normalizedText];
  if (allergenEntry) return applyCapitalization(text, allergenEntry);

  const uiTextEntry = UI_TEXT_DICTIONARY[targetLanguage]?.[normalizedText];
  if (uiTextEntry) return applyCapitalization(text, uiTextEntry);

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`
    );
    
    if (!response.ok) throw new Error('Translation request failed');
    
    const data = await response.json();
    
    let translated = text;
    if (data && data[0] && Array.isArray(data[0])) {
      translated = data[0]
        .map((segment: any) => segment[0])
        .filter((text: any) => typeof text === 'string')
        .join('');
    }
    
    // Apply regional overrides if they exist for this language
    if (REGIONAL_OVERRIDES[targetLanguage]) {
      Object.entries(REGIONAL_OVERRIDES[targetLanguage]).forEach(([latin, european]) => {
        // Use a more robust replacement that handles accented characters correctly.
        const escaped = latin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(^|[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])${escaped}(?![a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])`, 'g');
        translated = translated.replace(regex, (match, p1) => (p1 || '') + european);
      });
    }
    
    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

export const getAllGoogleLanguages = async (): Promise<SupportedLanguage[]> => {
  const languages: SupportedLanguage[] = [
    { code: 'af', name: 'Afrikaans' },
    { code: 'sq', name: 'Albanian' },
    { code: 'am', name: 'Amharic' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hy', name: 'Armenian' },
    { code: 'az', name: 'Azerbaijani' },
    { code: 'eu', name: 'Basque' },
    { code: 'be', name: 'Belarusian' },
    { code: 'bn', name: 'Bengali' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'ca', name: 'Catalan' },
    { code: 'ceb', name: 'Cebuano' },
    { code: 'ny', name: 'Chichewa' },
    { code: 'zh-CN', name: 'Chinese' },
    { code: 'yue', name: 'Cantonese' },
    { code: 'co', name: 'Corsican' },
    { code: 'hr', name: 'Croatian' },
    { code: 'cs', name: 'Czech' },
    { code: 'da', name: 'Danish' },
    { code: 'nl', name: 'Dutch' },
    { code: 'en', name: 'English' },
    { code: 'eo', name: 'Esperanto' },
    { code: 'et', name: 'Estonian' },
    { code: 'es-ES', name: 'Spanish (European)' },
    { code: 'es-419', name: 'Spanish (Latin)' },
    { code: 'tl', name: 'Filipino' },
    { code: 'fi', name: 'Finnish' },
    { code: 'fr', name: 'French' },
    { code: 'fy', name: 'Frisian' },
    { code: 'gl', name: 'Galician' },
    { code: 'ka', name: 'Georgian' },
    { code: 'de', name: 'German' },
    { code: 'el', name: 'Greek' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'ht', name: 'Haitian Creole' },
    { code: 'iw', name: 'Hebrew' },
    { code: 'hi', name: 'Hindi' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'is', name: 'Icelandic' },
    { code: 'id', name: 'Indonesian' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'jw', name: 'Javanese' },
    { code: 'kn', name: 'Kannada' },
    { code: 'kk', name: 'Kazakh' },
    { code: 'km', name: 'Khmer (Cambodian)' },
    { code: 'ko', name: 'Korean' },
    { code: 'ku', name: 'Kurdish (Kurmanji)' },
    { code: 'ky', name: 'Kyrgyz' },
    { code: 'lo', name: 'Lao' },
    { code: 'la', name: 'Latin' },
    { code: 'lv', name: 'Latvian' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'lb', name: 'Luxembourgish' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'mg', name: 'Malagasy' },
    { code: 'ms', name: 'Malay' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mt', name: 'Maltese' },
    { code: 'mi', name: 'Maori' },
    { code: 'mr', name: 'Marathi' },
    { code: 'mn', name: 'Mongolian' },
    { code: 'my', name: 'Myanmar (Burmese)' },
    { code: 'ne', name: 'Nepali' },
    { code: 'no', name: 'Norwegian' },
    { code: 'ps', name: 'Pashto' },
    { code: 'fa', name: 'Persian' },
    { code: 'pl', name: 'Polish' },
    { code: 'pt-BR', name: 'Portuguese (Brazilian)' },
    { code: 'pt-PT', name: 'Portuguese (European)' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'ro', name: 'Romanian' },
    { code: 'ru', name: 'Russian' },
    { code: 'sm', name: 'Samoan' },
    { code: 'sr', name: 'Serbian' },
    { code: 'sd', name: 'Sindhi' },
    { code: 'si', name: 'Sinhala' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'so', name: 'Somali' },
    { code: 'su', name: 'Sundanese' },
    { code: 'sw', name: 'Swahili' },
    { code: 'sv', name: 'Swedish' },
    { code: 'tg', name: 'Tajik' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'th', name: 'Thai' },
    { code: 'tr', name: 'Turkish' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ur', name: 'Urdu' },
    { code: 'uz', name: 'Uzbek' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'yi', name: 'Yiddish' }
  ];
  
  return languages;
};