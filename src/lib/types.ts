"use client";

export interface Allergen {
  id: string;
  name: string;
  icon: string;
}

export interface CardData {
  id: string;
  name: string;
  allergens: Allergen[];
  createdAt: number;
}

export type LanguageCode = string;

export interface SelectedAllergens {
  [key: string]: boolean;
}

export interface CustomMessages {
  [key: string]: string;
}

export interface SavedCard {
  id: string;
  name: string;
  languageCode: string;
  selectedAllergens: SelectedAllergens;
  customMessages: CustomMessages;
  createdAt: number;
}

export interface TranslatedContent {
  title: string;
  alerts: string[];
  allergens: string[];
  // Added to support EmergencyPage structure
  ui?: {
    allergyAlert: string;
    iAmAllergicTo: string;
    pleaseBeCareful: string;
    thankYou: string;
    theyMakeMeSick: string;
  };
  emergency?: {
    title: string;
    subtitle: string;
    callEmergency: string;
    medicalInfo: string;
  };
}