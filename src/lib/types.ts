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
}