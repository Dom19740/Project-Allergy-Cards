"use client";

export type LanguageCode = string;

export interface Allergen {
  id: string;
  name: string;
  image: string;
}

export interface SelectedAllergens {
  standard: string[];
  custom: string[];
  ids: string[];
}

export interface CustomMessages {
  iAmAllergicTo: string;
  theyMakeMeSick: string;
}

export interface TranslatedContent {
  allergyAlert: string;
  iAmAllergicTo: string;
  pleaseBeCareful: string;
  thankYou: string;
  languageName: string;
  theyMakeMeSick: string;
  allergens: { [key: string]: string };
}

export interface SavedCard {
  id: string;
  name: string;
  languageCode: string;
  selectedAllergens: SelectedAllergens;
  customMessages: CustomMessages;
  translatedContent?: TranslatedContent;
  createdAt: number;
}