"use client";

import { LanguageCode } from './types';
import { ALLERGEN_DICTIONARY, REGIONAL_OVERRIDES } from './allergen-dictionary';
import { languages } from './languages';

export interface SupportedLanguage {
  code: LanguageCode;
  name: string;
}

/**
 * Translates text using a local dictionary first, then falls back to the Google Translate API.
 */
export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text || !targetLanguage || targetLanguage === 'en') return text;

  // 1. Check local dictionary first (case-insensitive)
  const langDictionary = ALLERGEN_DICTIONARY[targetLanguage];
  if (langDictionary) {
    const normalizedText = text.toLowerCase().trim();
    if (langDictionary[normalizedText]) {
      // Preserve capitalization if the original text was capitalized
      const translation = langDictionary[normalizedText];
      if (text[0] === text[0].toUpperCase() && text[0] !== text[0].toLowerCase()) {
        return translation.charAt(0).toUpperCase() + translation.slice(1);
      }
      return translation;
    }
  }
  
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
  return languages;
};