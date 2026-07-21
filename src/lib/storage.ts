import { Preferences } from '@capacitor/preferences';

// Matches @capacitor/preferences' web implementation (PreferencesWeb), which
// backs Preferences.get/set with localStorage under this fixed key prefix -
// see node_modules/@capacitor/preferences/dist/plugin.cjs.js.
const CAPACITOR_STORAGE_PREFIX = 'CapacitorStorage.';

export const STORAGE_KEYS = {
  SAVED_CARDS: 'savedAllergyCards',
  SAVED_EMERGENCY_CARD: 'savedEmergencyCard',
  SELECTED_ALLERGENS: 'selectedAllergens',
  CUSTOM_MESSAGES: 'customAlertMessages',
  SELECTED_LANGUAGE: 'selectedLanguageCode',
  SESSION_TRANSLATIONS: 'currentSessionTranslations',
  HAS_MIGRATED: 'hasMigratedToPreferences',
  LAST_EMERGENCY_LANG: 'lastEmergencyLangCode',
  HAS_SEEN_ONBOARDING: 'hasSeenOnboarding',
  PREFERENCES_LOCK: 'preferencesLock',
  VERIFIED_EMERGENCY_NUMBER: 'verifiedEmergencyNumber',
  OPEN_EMERGENCY_DIALOG_FLAG: 'openEmergencyDialogFlag',
  IOS_BANNER_DISMISSED: 'iosInstallBannerDismissed',
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
  },

  // Reads localStorage directly and synchronously, bypassing Preferences'
  // async bridge entirely. Web only (native Preferences doesn't back onto
  // localStorage at all) - for callers that must not await anything before
  // an immediately-following browser API call that consumes transient user
  // activation (e.g. navigator.share()), where even one microtask of delay
  // is enough for the browser to reject the call.
  getSyncWeb<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    const value = window.localStorage.getItem(`${CAPACITOR_STORAGE_PREFIX}${key}`);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      return value as unknown as T;
    }
  }
};