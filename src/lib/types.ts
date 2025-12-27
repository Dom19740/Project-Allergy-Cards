// Define types based on the actual translations object
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh-Hans' | 'zh-Hant' | 'ar' | 'ru' | 'ja' | 'ko';
export type AllergenId = 'milk' | 'eggs' | 'peanut' | 'treeNuts' | 'fish' | 'shellfish' | 'wheat' | 'soy' | 'sesame' | 'peanutOil';

// Combined TranslationKey type for both general phrases and specific allergens
export type TranslationKey =
  | 'eggs'
  | 'fish'
  | 'milk'
  | 'peanut'
  | 'sesame'
  | 'shellfish'
  | 'soy'
  | 'treeNuts'
  | 'wheat'
  | 'allergenId'
  | 'Title'
  | 'Description'
  | 'ButtonTitle'
  | 'Input'
  | 'Placeholder'
  | 'Checkbox';