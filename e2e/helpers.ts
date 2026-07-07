import { Page } from "@playwright/test";

// Mirrors @capacitor/preferences' web implementation (PreferencesWeb), which
// backs Preferences.get/set with `localStorage` under a fixed key prefix -
// see node_modules/@capacitor/preferences/dist/plugin.cjs.js. Seeding through
// this prefix lets tests jump past onboarding/premium state without driving
// every screen for setup that isn't the thing under test.
const CAPACITOR_STORAGE_PREFIX = "CapacitorStorage.";

export const seedStorage = async (page: Page, values: Record<string, unknown>) => {
  await page.addInitScript(
    ({ prefix, entries }) => {
      for (const [key, value] of entries as [string, unknown][]) {
        const stringValue = typeof value === "string" ? value : JSON.stringify(value);
        window.localStorage.setItem(prefix + key, stringValue);
      }
    },
    { prefix: CAPACITOR_STORAGE_PREFIX, entries: Object.entries(values) }
  );
};

// Fails fast (rather than timing out later on a stuck spinner) if the app
// makes an external translation call during a scenario that's expected to be
// fully served from the on-device dictionaries.
export const trackUnexpectedTranslationCalls = (page: Page) => {
  const calls: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("translate.googleapis.com") || url.includes("/api/translate")) {
      calls.push(url);
    }
  });
  return calls;
};
