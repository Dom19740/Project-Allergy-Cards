"use client";

// This file previously contained hardcoded translations, but we now use live translation
// through the Google Translate API via the translator.ts module.
// All translation functionality has been moved to the live translation system.

export type TranslationKey =
  | 'eggs'
  | 'fish'
  | 'milk'
  | 'peanut'
  | 'sesame'
  | 'crustaceans'
  | 'soy'
  | 'treeNuts'
  | 'gluten'
  | 'molluscs'
  | 'celery'
  | 'mustard'
  | 'sulphites'
  | 'lupin'
  | 'allergenId'
  | 'Title'
  | 'Description'
  | 'ButtonTitle'
  | 'Input'
  | 'Placeholder'
  | 'Checkbox';

export type LanguageCode = 'en' | 'fr' | 'de' | 'it' | 'pt' | 'es-ES' | 'es-419' | 'zh-Hans' | 'zh-Hant' | 'ar' | 'ru' | 'ja' | 'ko';

export const translations: Record<LanguageCode, Record<TranslationKey, string>> = {
  en: {
    eggs: 'Eggs',
    fish: 'Fish',
    milk: 'Milk',
    peanut: 'Peanuts',
    sesame: 'Sesame',
    crustaceans: 'Crustaceans',
    soy: 'Soy',
    treeNuts: 'Tree nuts',
    gluten: 'Gluten',
    molluscs: 'Molluscs',
    celery: 'Celery',
    mustard: 'Mustard',
    sulphites: 'Sulphites',
    lupin: 'Lupin',
    allergenId: 'Allergen ID',
    Title: 'Title',
    Description: 'Description',
    ButtonTitle: 'Button Title',
    Input: 'Input',
    Placeholder: 'Placeholder',
    Checkbox: 'Checkbox',
  },
  // Other languages will be handled by live translation, but keeping the structure for type safety
  'es-ES': {} as any,
  'es-419': {} as any,
  fr: {} as any,
  pt: {} as any,
  de: {} as any,
  it: {} as any,
  'zh-Hans': {} as any,
  'zh-Hant': {} as any,
  ar: {} as any,
  ru: {} as any,
  ja: {} as any,
  ko: {} as any,
};

// This function is deprecated - use translateText from translator.ts instead
export const getTranslation = (langCode: LanguageCode | undefined, key: string): string => {
  console.warn('getTranslation is deprecated - use live translation via translateText instead');
  return key; // Return original text since no hardcoded translations exist
};