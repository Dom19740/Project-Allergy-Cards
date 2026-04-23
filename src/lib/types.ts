"use client";

export interface Allergen {
  id: string;
  name: string;
  icon: string;
  image?: string; // Added to support both icon and image properties
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

export interface TranslatedContent {
  title: string;
  alerts: string[];
  allergens: string[];
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
    dial112?: string;
    attention?: string;
    emergency?: string;
    needHelp?: string;
    callServices?: string;
    dialText?: string;
  };
}

export interface SavedCard {
  id: string;
  name: string;
  languageCode: string;
  selectedAllergens: SelectedAllergens;
  customMessages: CustomMessages;
  translatedContent?: TranslatedContent; // Added missing property
  createdAt: number;
}