import { Preferences } from '@capacitor/preferences';

export const STORAGE_KEYS = {
  SAVED_CARDS: 'savedAllergyCards',
  SELECTED_ALLERGENS: 'selectedAllergens',
  CUSTOM_MESSAGES: 'customAlertMessages',
  SELECTED_LANGUAGE: 'selectedLanguageCode',
  SESSION_TRANSLATIONS: 'currentSessionTranslations',
  HAS_MIGRATED: 'hasMigratedToPreferences',
  LAST_EMERGENCY_LANG: 'lastEmergencyLangCode',
};

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      return value as unknown as T;
    }
  },

  async set(key: string, value: any): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await Preferences.set({ key, value: stringValue });
  },

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  },

  async clear(): Promise<void> {
    await Preferences.clear();
  }
};
