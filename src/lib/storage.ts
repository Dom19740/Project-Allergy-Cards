"use client";

export const STORAGE_KEYS = {
  SAVED_CARDS: 'saved_cards',
  SAVED_EMERGENCY_CARD: 'saved_emergency_card',
  SELECTED_ALLERGENS: 'selected_allergens',
  CUSTOM_MESSAGES: 'custom_messages',
  SELECTED_LANGUAGE: 'selected_language',
  SESSION_TRANSLATIONS: 'session_translations',
  HAS_MIGRATED: 'has_migrated',
  LAST_EMERGENCY_LANG: 'last_emergency_lang',
  HAS_SEEN_ONBOARDING: 'has_seen_onboarding',
  IS_PREMIUM: 'is_premium',
  LANGUAGE: 'selected_language',
};

export const storage = {
  get: <T = any>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as unknown as T;
    }
  },
  set: (key: string, value: any): void => {
    if (typeof window === 'undefined') return;
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
};