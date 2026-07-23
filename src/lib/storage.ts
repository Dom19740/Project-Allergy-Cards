import { Preferences } from '@capacitor/preferences';

export const STORAGE_KEYS = {
  SAVED_CARDS: 'savedAllergyCards',
  SAVED_EMERGENCY_CARD: 'savedEmergencyCard',
  SELECTED_ALLERGENS: 'selectedAllergens',
  CUSTOM_MESSAGES: 'customAlertMessages',
  SELECTED_LANGUAGE: 'selectedLanguageCode',
  SESSION_TRANSLATIONS: 'currentSessionTranslations',
  HAS_MIGRATED: 'hasMigratedToPreferences',
  LAST_EMERGENCY_LANG: 'lastEmergencyLangCode',
  PREFERENCES_LOCK: 'preferencesLock',
  VERIFIED_EMERGENCY_NUMBER: 'verifiedEmergencyNumber',
  OPEN_EMERGENCY_DIALOG_FLAG: 'openEmergencyDialogFlag',
  INSTALL_BANNER_DISMISSED: 'installBannerDismissed',
  HAS_COMPLETED_ONBOARDING: 'hasCompletedOnboarding',
  CUSTOM_ALLERGEN_IMAGES: 'customAllergenImages',
  CUSTOM_ALLERGEN_NAMES: 'customAllergenNames',
  CUSTOM_ALERT_PRESETS: 'customAlertPresets',
  PENDING_BACKUP_RESTORE: 'pendingBackupRestore',
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
  },

  async setEphemeral(key: string, value: any): Promise<void> {
    if (typeof window === 'undefined') return;
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    sessionStorage.setItem(key, stringValue);
  },

  async getEphemeral<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null;
    const value = sessionStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      return value as unknown as T;
    }
  },

  async removeEphemeral(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  }
};