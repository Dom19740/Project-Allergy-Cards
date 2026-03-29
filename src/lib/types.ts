"use client";

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
  selectedAllergens: SelectedAllergens;
  customMessages: CustomMessages;
  languageCode: string;
  createdAt: string;
}

export type LanguageCode = string;