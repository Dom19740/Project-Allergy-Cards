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
  ui: {
    allergyAlert: string;
    iAmAllergicTo: string;
    pleaseBeCareful: string;
    thankYou: string;
    theyMakeMeSick: string;
  };
  allergens: { [key: string]: string };
  emergency: {
    attention: string;
    emergency: string;
    needHelp: string;
    callServices: string;
    dial112: string;
  };
}

export interface SavedCard {
  id: string;
  name: string;
  languageCode: string;
  selectedAllergens: SelectedAllergens;
  customMessages: CustomMessages;
  translatedContent: TranslatedContent;
  createdAt: number;
}