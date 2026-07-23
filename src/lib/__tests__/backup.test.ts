import { describe, it, expect, vi } from "vitest";
import { storage, STORAGE_KEYS } from "../storage";
import { SavedCard, CustomAlertPreset } from "../types";
import { PREMIUM_LIMITS } from "../premium-config";
import { MAX_CUSTOM_ALERT_PRESETS } from "../customAlertPresets";
import { getCustomAllergenImages, getCustomAllergenNames } from "../customAllergenImages";
import {
  parseBackupPayload,
  applyParsedBackup,
  backupRequiresPremium,
  stashPendingBackupRestore,
  takePendingBackupRestore,
  ParsedBackup,
} from "../backup";

const makeCard = (overrides: Partial<SavedCard> = {}): SavedCard => ({
  id: "card-1",
  name: "My Card",
  languageCode: "en",
  selectedAllergens: { standard: ["soy"], custom: {}, ids: ["soy"] },
  customMessages: { iAmAllergicTo: "I am allergic to", theyMakeMeSick: "they make me sick" },
  translatedContent: {
    ui: { allergyAlert: "", iAmAllergicTo: "", pleaseBeCareful: "", thankYou: "", theyMakeMeSick: "" },
    allergens: {},
    emergency: { attention: "", emergency: "", needHelp: "", callServices: "", dial112: "" },
  },
  createdAt: 1000,
  ...overrides,
});

const makePreset = (overrides: Partial<CustomAlertPreset> = {}): CustomAlertPreset => ({
  id: "preset-1",
  name: "Me",
  iAmAllergicTo: "I am allergic to",
  theyMakeMeSick: "they make me sick",
  ...overrides,
});

const makeParsed = (overrides: Partial<ParsedBackup> = {}): ParsedBackup => ({
  savedCards: [],
  emergencyCard: null,
  customAllergenImages: {},
  customAllergenNames: [],
  customAlertPresets: [],
  wasPremiumAtBackup: false,
  ...overrides,
});

describe("parseBackupPayload", () => {
  it("throws a user-facing error on invalid JSON", () => {
    expect(() => parseBackupPayload("not json {{{")).toThrow("That is not a valid backup (invalid JSON).");
  });

  it("throws when the payload has no cards, images, names, or presets at all", () => {
    expect(() => parseBackupPayload(JSON.stringify({ version: 1 }))).toThrow(
      "That doesn't contain any saved cards."
    );
  });

  it("does not throw when the only content is custom allergen names (no cards)", () => {
    const parsed = parseBackupPayload(JSON.stringify({ customAllergenNames: ["Kiwi"] }));
    expect(parsed.customAllergenNames).toEqual(["Kiwi"]);
    expect(parsed.savedCards).toEqual([]);
  });

  it("parses a fully-formed backup payload correctly", () => {
    const card = makeCard();
    const preset = makePreset();
    const text = JSON.stringify({
      version: 1,
      exportedAt: "2026-01-01T00:00:00.000Z",
      wasPremiumAtBackup: true,
      savedCards: [card],
      emergencyCard: null,
      customAllergenImages: { Kiwi: "data:image/png;base64,abc" },
      customAllergenNames: ["Kiwi"],
      customAlertPresets: [preset],
    });

    const parsed = parseBackupPayload(text);

    expect(parsed).toEqual({
      savedCards: [card],
      emergencyCard: null,
      customAllergenImages: { Kiwi: "data:image/png;base64,abc" },
      customAllergenNames: ["Kiwi"],
      customAlertPresets: [preset],
      wasPremiumAtBackup: true,
    });
  });

  it("defaults wasPremiumAtBackup to false when the field is missing (backups made before the marker existed)", () => {
    const parsed = parseBackupPayload(JSON.stringify({ savedCards: [makeCard()] }));
    expect(parsed.wasPremiumAtBackup).toBe(false);
  });

  it("filters out malformed entries from savedCards instead of failing the whole parse", () => {
    const valid = makeCard();
    const text = JSON.stringify({
      savedCards: [valid, { id: "bad", name: "missing fields" }, null, "garbage"],
    });

    const parsed = parseBackupPayload(text);

    expect(parsed.savedCards).toEqual([valid]);
  });

  it("filters out malformed entries from customAlertPresets", () => {
    const valid = makePreset();
    const text = JSON.stringify({
      savedCards: [makeCard()],
      customAlertPresets: [valid, { id: "bad" }, 42],
    });

    const parsed = parseBackupPayload(text);

    expect(parsed.customAlertPresets).toEqual([valid]);
  });

  it("ignores a non-array customAllergenNames field rather than throwing", () => {
    const text = JSON.stringify({ savedCards: [makeCard()], customAllergenNames: "not-an-array" });
    const parsed = parseBackupPayload(text);
    expect(parsed.customAllergenNames).toEqual([]);
  });

  it("ignores a malformed customAllergenImages field (e.g. an array) rather than throwing", () => {
    const text = JSON.stringify({ savedCards: [makeCard()], customAllergenImages: ["not", "a", "map"] });
    const parsed = parseBackupPayload(text);
    expect(parsed.customAllergenImages).toEqual({});
  });

  it("drops an invalid emergencyCard but keeps the rest of the payload", () => {
    const text = JSON.stringify({ savedCards: [makeCard()], emergencyCard: { incomplete: true } });
    const parsed = parseBackupPayload(text);
    expect(parsed.emergencyCard).toBeNull();
  });
});

describe("backupRequiresPremium", () => {
  it("is false for a plain single free-language card with no custom content", () => {
    expect(backupRequiresPremium(makeParsed({ savedCards: [makeCard({ languageCode: "en" })] }))).toBe(false);
  });

  it("is true when wasPremiumAtBackup is true, even with otherwise plain content", () => {
    expect(backupRequiresPremium(makeParsed({ savedCards: [makeCard()], wasPremiumAtBackup: true }))).toBe(true);
  });

  it("is true when the backup has more cards than the free plan allows", () => {
    const cards = Array.from({ length: PREMIUM_LIMITS.FREE_MAX_SAVED_CARDS + 1 }, (_, i) =>
      makeCard({ id: `card-${i}` })
    );
    expect(backupRequiresPremium(makeParsed({ savedCards: cards }))).toBe(true);
  });

  it("is false at exactly the free plan's card limit", () => {
    const cards = Array.from({ length: PREMIUM_LIMITS.FREE_MAX_SAVED_CARDS }, (_, i) => makeCard({ id: `card-${i}` }));
    expect(backupRequiresPremium(makeParsed({ savedCards: cards }))).toBe(false);
  });

  it("is true when any saved card uses a non-free language", () => {
    expect(backupRequiresPremium(makeParsed({ savedCards: [makeCard({ languageCode: "ja" })] }))).toBe(true);
  });

  it("is true when the emergency card (not just a saved card) uses a non-free language", () => {
    const parsed = makeParsed({
      savedCards: [],
      emergencyCard: makeCard({ id: "emergency-slot", languageCode: "ja" }),
    });
    expect(backupRequiresPremium(parsed)).toBe(true);
  });

  it("is true when there are any custom alert presets", () => {
    expect(backupRequiresPremium(makeParsed({ savedCards: [makeCard()], customAlertPresets: [makePreset()] }))).toBe(
      true
    );
  });

  it("is true when there are custom allergen names even with just one free-language card", () => {
    expect(
      backupRequiresPremium(makeParsed({ savedCards: [makeCard()], customAllergenNames: ["Kiwi"] }))
    ).toBe(true);
  });

  it("is true when there are custom allergen images even with no names registered", () => {
    expect(
      backupRequiresPremium(
        makeParsed({ savedCards: [makeCard()], customAllergenImages: { Kiwi: "data:image/png;base64,abc" } })
      )
    ).toBe(true);
  });

  it("is false for an empty backup with no cards and no premium content", () => {
    expect(backupRequiresPremium(makeParsed())).toBe(false);
  });
});

describe("applyParsedBackup", () => {
  it("writes saved cards to storage and reports the imported count", async () => {
    const card = makeCard();
    const result = await applyParsedBackup(makeParsed({ savedCards: [card] }), 10);

    expect(await storage.get(STORAGE_KEYS.SAVED_CARDS)).toEqual([card]);
    expect(result.importedCards).toBe(1);
    expect(result.skippedCards).toBe(0);
  });

  it("caps saved cards at maxSavedCards and reports how many were skipped", async () => {
    const cards = [makeCard({ id: "1" }), makeCard({ id: "2" }), makeCard({ id: "3" })];
    const result = await applyParsedBackup(makeParsed({ savedCards: cards }), 2);

    const stored = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS);
    expect(stored).toHaveLength(2);
    expect(result.importedCards).toBe(2);
    expect(result.skippedCards).toBe(1);
  });

  it("writes the emergency card when present and reports it", async () => {
    const emergencyCard = makeCard({ id: "emergency-slot", name: "Emergency" });
    const result = await applyParsedBackup(makeParsed({ emergencyCard }), 10);

    expect(await storage.get(STORAGE_KEYS.SAVED_EMERGENCY_CARD)).toEqual(emergencyCard);
    expect(result.importedEmergency).toBe(true);
  });

  it("does not touch the emergency card slot when the backup has none", async () => {
    await applyParsedBackup(makeParsed(), 10);
    expect(await storage.get(STORAGE_KEYS.SAVED_EMERGENCY_CARD)).toBeNull();
  });

  it("merges custom allergen images rather than replacing the existing map", async () => {
    await storage.set(STORAGE_KEYS.CUSTOM_ALLERGEN_IMAGES, { Existing: "data:image/png;base64,existing" });

    const result = await applyParsedBackup(
      makeParsed({ customAllergenImages: { Kiwi: "data:image/png;base64,kiwi" } }),
      10
    );

    expect(await getCustomAllergenImages()).toEqual({
      Existing: "data:image/png;base64,existing",
      Kiwi: "data:image/png;base64,kiwi",
    });
    expect(result.importedImages).toBe(1);
  });

  it("an incoming image for a name that already exists locally overwrites just that entry", async () => {
    await storage.set(STORAGE_KEYS.CUSTOM_ALLERGEN_IMAGES, { Kiwi: "data:image/png;base64,old" });

    await applyParsedBackup(makeParsed({ customAllergenImages: { Kiwi: "data:image/png;base64,new" } }), 10);

    expect(await getCustomAllergenImages()).toEqual({ Kiwi: "data:image/png;base64,new" });
  });

  it("merges the custom allergen name registry from the explicit customAllergenNames field", async () => {
    await applyParsedBackup(makeParsed({ customAllergenNames: ["Kiwi", "Mango"] }), 10);
    expect(new Set(await getCustomAllergenNames())).toEqual(new Set(["Kiwi", "Mango"]));
  });

  it("backfills the name registry from custom allergen image keys, for backups made before the registry existed", async () => {
    await applyParsedBackup(
      makeParsed({ customAllergenNames: [], customAllergenImages: { Papaya: "data:image/png;base64,x" } }),
      10
    );
    expect(await getCustomAllergenNames()).toEqual(["Papaya"]);
  });

  it("backfills the name registry from non-standard allergen ids still referenced by cards in the backup", async () => {
    const card = makeCard({ selectedAllergens: { standard: ["soy"], custom: {}, ids: ["soy", "Durian"] } });
    await applyParsedBackup(makeParsed({ savedCards: [card] }), 10);
    expect(await getCustomAllergenNames()).toEqual(["Durian"]);
  });

  it("backfills allergen names from a card that got capped out of the import - it's still a real allergen the user owns", async () => {
    const cappedOutCard = makeCard({
      id: "capped",
      selectedAllergens: { standard: [], custom: {}, ids: ["Lychee"] },
    });
    const keptCard = makeCard({ id: "kept" });
    // cappedOutCard is second, and maxSavedCards is 1, so only keptCard is actually written -
    // but Lychee should still register.
    await applyParsedBackup(makeParsed({ savedCards: [keptCard, cappedOutCard] }), 1);

    expect(await getCustomAllergenNames()).toEqual(["Lychee"]);
  });

  it("does not register the built-in standard allergen ids as custom names", async () => {
    const card = makeCard({ selectedAllergens: { standard: ["soy"], custom: {}, ids: ["soy"] } });
    await applyParsedBackup(makeParsed({ savedCards: [card] }), 10);
    expect(await getCustomAllergenNames()).toEqual([]);
  });

  it("merges custom alert presets, keeping the existing preset on an id collision", async () => {
    const existing = makePreset({ id: "1", name: "Local Version" });
    await storage.set(STORAGE_KEYS.CUSTOM_ALERT_PRESETS, [existing]);

    const incomingSameId = makePreset({ id: "1", name: "Backup Version" });
    const incomingNew = makePreset({ id: "2", name: "New From Backup" });
    const result = await applyParsedBackup(
      makeParsed({ customAlertPresets: [incomingSameId, incomingNew] }),
      10
    );

    const stored = await storage.get<CustomAlertPreset[]>(STORAGE_KEYS.CUSTOM_ALERT_PRESETS);
    expect(stored).toEqual([existing, incomingNew]); // local "1" wins, only the new "2" gets added
    expect(result.importedPresets).toBe(1);
  });

  it("does not import more presets than MAX_CUSTOM_ALERT_PRESETS allows in total", async () => {
    const existing = Array.from({ length: MAX_CUSTOM_ALERT_PRESETS - 1 }, (_, i) => makePreset({ id: `existing-${i}` }));
    await storage.set(STORAGE_KEYS.CUSTOM_ALERT_PRESETS, existing);

    const incoming = [makePreset({ id: "new-1" }), makePreset({ id: "new-2" })];
    const result = await applyParsedBackup(makeParsed({ customAlertPresets: incoming }), 10);

    const stored = await storage.get<CustomAlertPreset[]>(STORAGE_KEYS.CUSTOM_ALERT_PRESETS);
    expect(stored).toHaveLength(MAX_CUSTOM_ALERT_PRESETS);
    expect(result.importedPresets).toBe(1); // only room for one more
  });

  it("dispatches a storage-update event so any listening UI refreshes", async () => {
    const handler = vi.fn();
    window.addEventListener("storage-update", handler);
    try {
      await applyParsedBackup(makeParsed({ savedCards: [makeCard()] }), 10);
      expect(handler).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener("storage-update", handler);
    }
  });
});

describe("stashPendingBackupRestore / takePendingBackupRestore", () => {
  it("returns null when nothing has been stashed", async () => {
    expect(await takePendingBackupRestore()).toBeNull();
  });

  it("round-trips the exact raw backup text, unmodified", async () => {
    // Regression guard: the text itself is valid JSON, and storage.getEphemeral
    // runs JSON.parse on whatever it reads back - stashing it as a bare string
    // would come back as a parsed object instead of the original string. The
    // real implementation guards against this by wrapping it in { text }.
    const rawText = JSON.stringify({ version: 1, savedCards: [makeCard()] });

    await stashPendingBackupRestore(rawText);
    const taken = await takePendingBackupRestore();

    expect(taken).toBe(rawText);
    expect(typeof taken).toBe("string");
  });

  it("clears the stashed backup after it's taken - a second take returns null", async () => {
    await stashPendingBackupRestore("some raw text");

    await takePendingBackupRestore();
    const secondTake = await takePendingBackupRestore();

    expect(secondTake).toBeNull();
  });
});
