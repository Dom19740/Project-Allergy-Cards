import "@testing-library/jest-dom/vitest";
import { vi, beforeEach } from "vitest";

// This project only ships a `dist` web build behind Capacitor's native
// wrappers for actual devices - none of these plugins can run in jsdom.
// Every test that imports app code transitively pulls these in, so they're
// mocked once here (module-registry-wide) rather than per test file.

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: vi.fn(() => "web"),
    isNativePlatform: vi.fn(() => false),
  },
}));

const preferencesStore = new Map<string, string>();

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: vi.fn(async ({ key }: { key: string }) => ({
      value: preferencesStore.has(key) ? preferencesStore.get(key)! : null,
    })),
    set: vi.fn(async ({ key, value }: { key: string; value: string }) => {
      preferencesStore.set(key, value);
    }),
    remove: vi.fn(async ({ key }: { key: string }) => {
      preferencesStore.delete(key);
    }),
    clear: vi.fn(async () => {
      preferencesStore.clear();
    }),
  },
  __preferencesStore: preferencesStore,
}));

vi.mock("@capacitor/network", () => ({
  Network: {
    getStatus: vi.fn(async () => ({ connected: true, connectionType: "wifi" })),
    addListener: vi.fn(async () => ({ remove: vi.fn() })),
  },
}));

vi.mock("@capacitor/device", () => ({
  Device: {
    getInfo: vi.fn(async () => ({ platform: "web" })),
  },
}));

vi.mock("@capacitor/filesystem", () => ({
  Filesystem: {
    writeFile: vi.fn(async () => ({ uri: "mock://file" })),
  },
  Directory: { Documents: "DOCUMENTS", Cache: "CACHE" },
}));

vi.mock("@capacitor/share", () => ({
  Share: {
    share: vi.fn(async () => undefined),
  },
}));

vi.mock("@capacitor-community/text-to-speech", () => ({
  TextToSpeech: {
    speak: vi.fn(async () => undefined),
  },
}));

vi.mock("@capacitor-firebase/analytics", () => ({
  FirebaseAnalytics: {
    logEvent: vi.fn(async () => undefined),
    setEnabled: vi.fn(async () => undefined),
  },
}));

vi.mock("@capacitor-firebase/crashlytics", () => ({
  FirebaseCrashlytics: {
    recordException: vi.fn(async () => undefined),
    setEnabled: vi.fn(async () => undefined),
  },
}));

beforeEach(() => {
  preferencesStore.clear();
  sessionStorage.clear();
  // clearAllMocks (not restoreAllMocks) - these vi.fn()s have no "original"
  // implementation to restore to, so restoring would wipe the default
  // resolved-value behavior set up in the factories above.
  vi.clearAllMocks();
});
