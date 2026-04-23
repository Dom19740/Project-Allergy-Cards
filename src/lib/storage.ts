"use client";

export const STORAGE_KEYS = {
  SAVED_CARDS: 'saved_cards',
  SAVED_EMERGENCY_CARD: 'saved_emergency_card',
  SELECTED_ALLERGENS: 'selected_allergens',
  SELECTED_ALERT_TYPE: 'selected_alert_type',
  SELECTED_LANGUAGES: 'selected_languages',
  CUSTOM_MESSAGES: 'custom_messages',
  SELECTED_LANGUAGE: 'selected_language',
  SESSION_TRANSLATIONS: 'session_translations',
  HAS_MIGRATED: 'has_migrated',
  LAST_EMERGENCY_LANG: 'last_emergency_lang',
  HAS_SEEN_ONBOARDING: 'has_seen_onboarding'
} as const;

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key} from storage:`, error);
      return null;
    }
  },

  async set(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new Event('storage-update'));
    } catch (error) {
      console.error(`Error setting item ${key} in storage:`, error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
      window.dispatchEvent(new Event('storage-update'));
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      localStorage.clear();
      window.dispatchEvent(new Event('storage-update'));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};