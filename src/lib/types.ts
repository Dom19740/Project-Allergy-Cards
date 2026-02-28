"use client";

export type LanguageCode = string;

export interface Allergen {
  id: string;
  name: string;
  image: string;
}

export interface SelectedAllergens {
  standard: string[];
  custom: {
    [key: string]: {
      [lang: string]: string;
    };
  };
  ids: string[];
}

export interface CustomMessages {
  iAmAllergicTo: string;
  theyMakeMeSick: string;
}

export interface SavedCard {
  id: string;
  name: string;
  languageCode: string;
  selectedAllergens: SelectedAllergens;
  customMessages: CustomMessages;
  createdAt: number;
}