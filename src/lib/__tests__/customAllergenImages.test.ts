import { describe, it, expect } from "vitest";
import { storage, STORAGE_KEYS } from "../storage";
import { SavedCard } from "../types";
import {
  getSavedCardNamesUsingAllergen,
  getCustomAllergenImages,
  setCustomAllergenImage,
  removeCustomAllergenImage,
  getCustomAllergenNames,
  addCustomAllergenName,
  removeCustomAllergenName,
  mergeCustomAllergenNames,
} from "../customAllergenImages";

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
  createdAt: Date.now(),
  ...overrides,
});

describe("custom allergen image map (per-allergen photo storage)", () => {
  it("returns an empty map when nothing has been set", async () => {
    expect(await getCustomAllergenImages()).toEqual({});
  });

  it("setCustomAllergenImage stores and getCustomAllergenImages reads it back", async () => {
    await setCustomAllergenImage("Kiwi", "data:image/png;base64,abc");
    expect(await getCustomAllergenImages()).toEqual({ Kiwi: "data:image/png;base64,abc" });
  });

  it("setCustomAllergenImage on an existing name overwrites just that entry", async () => {
    await setCustomAllergenImage("Kiwi", "data:image/png;base64,old");
    await setCustomAllergenImage("Mango", "data:image/png;base64,mango");
    await setCustomAllergenImage("Kiwi", "data:image/png;base64,new");

    expect(await getCustomAllergenImages()).toEqual({
      Kiwi: "data:image/png;base64,new",
      Mango: "data:image/png;base64,mango",
    });
  });

  it("removeCustomAllergenImage deletes only the named entry", async () => {
    await setCustomAllergenImage("Kiwi", "data:image/png;base64,kiwi");
    await setCustomAllergenImage("Mango", "data:image/png;base64,mango");

    await removeCustomAllergenImage("Kiwi");

    expect(await getCustomAllergenImages()).toEqual({ Mango: "data:image/png;base64,mango" });
  });

  it("removeCustomAllergenImage is a no-op for a name that was never set", async () => {
    await setCustomAllergenImage("Mango", "data:image/png;base64,mango");
    await removeCustomAllergenImage("DoesNotExist");
    expect(await getCustomAllergenImages()).toEqual({ Mango: "data:image/png;base64,mango" });
  });
});

describe("getSavedCardNamesUsingAllergen (guards deletion of an in-use custom allergen)", () => {
  it("returns an empty array when there are no saved cards at all", async () => {
    expect(await getSavedCardNamesUsingAllergen("Kiwi")).toEqual([]);
  });

  it("finds a standard saved card referencing the allergen by id", async () => {
    const card = makeCard({ name: "Thai Trip", selectedAllergens: { standard: [], custom: {}, ids: ["Kiwi"] } });
    await storage.set(STORAGE_KEYS.SAVED_CARDS, [card]);

    expect(await getSavedCardNamesUsingAllergen("Kiwi")).toEqual(["Thai Trip"]);
  });

  it("also checks the emergency card slot", async () => {
    const emergencyCard = makeCard({
      id: "emergency-slot",
      name: "Emergency Card",
      selectedAllergens: { standard: [], custom: {}, ids: ["Kiwi"] },
    });
    await storage.set(STORAGE_KEYS.SAVED_EMERGENCY_CARD, emergencyCard);

    expect(await getSavedCardNamesUsingAllergen("Kiwi")).toEqual(["Emergency Card"]);
  });

  it("returns every matching card's name, not just the first", async () => {
    const cardA = makeCard({ id: "a", name: "Card A", selectedAllergens: { standard: [], custom: {}, ids: ["Kiwi"] } });
    const cardB = makeCard({ id: "b", name: "Card B", selectedAllergens: { standard: [], custom: {}, ids: ["Mango"] } });
    const cardC = makeCard({ id: "c", name: "Card C", selectedAllergens: { standard: [], custom: {}, ids: ["Kiwi", "Mango"] } });
    await storage.set(STORAGE_KEYS.SAVED_CARDS, [cardA, cardB, cardC]);

    expect(await getSavedCardNamesUsingAllergen("Kiwi")).toEqual(["Card A", "Card C"]);
  });

  it("does not match a card that doesn't reference the allergen", async () => {
    const card = makeCard({ selectedAllergens: { standard: ["soy"], custom: {}, ids: ["soy"] } });
    await storage.set(STORAGE_KEYS.SAVED_CARDS, [card]);

    expect(await getSavedCardNamesUsingAllergen("Kiwi")).toEqual([]);
  });
});

describe("custom allergen name registry (device-wide, independent of any single card)", () => {
  it("starts empty", async () => {
    expect(await getCustomAllergenNames()).toEqual([]);
  });

  it("addCustomAllergenName appends a new name", async () => {
    await addCustomAllergenName("Kiwi");
    expect(await getCustomAllergenNames()).toEqual(["Kiwi"]);
  });

  it("addCustomAllergenName is idempotent - adding the same name twice doesn't duplicate it", async () => {
    await addCustomAllergenName("Kiwi");
    await addCustomAllergenName("Kiwi");
    expect(await getCustomAllergenNames()).toEqual(["Kiwi"]);
  });

  it("addCustomAllergenName preserves previously added names", async () => {
    await addCustomAllergenName("Kiwi");
    await addCustomAllergenName("Mango");
    expect(await getCustomAllergenNames()).toEqual(["Kiwi", "Mango"]);
  });

  it("removeCustomAllergenName removes only the named entry", async () => {
    await addCustomAllergenName("Kiwi");
    await addCustomAllergenName("Mango");
    await removeCustomAllergenName("Kiwi");
    expect(await getCustomAllergenNames()).toEqual(["Mango"]);
  });

  it("removeCustomAllergenName is a no-op for a name that isn't registered", async () => {
    await addCustomAllergenName("Mango");
    await removeCustomAllergenName("DoesNotExist");
    expect(await getCustomAllergenNames()).toEqual(["Mango"]);
  });

  it("mergeCustomAllergenNames unions new names with the existing registry without dropping anything", async () => {
    await addCustomAllergenName("Kiwi");

    const merged = await mergeCustomAllergenNames(["Mango", "Kiwi", "Papaya"]);

    // Order isn't semantically important, so compare as sets.
    expect(new Set(merged)).toEqual(new Set(["Kiwi", "Mango", "Papaya"]));
    expect(new Set(await getCustomAllergenNames())).toEqual(new Set(["Kiwi", "Mango", "Papaya"]));
  });

  it("mergeCustomAllergenNames on an empty registry just adopts the given names", async () => {
    const merged = await mergeCustomAllergenNames(["Kiwi", "Mango"]);
    expect(new Set(merged)).toEqual(new Set(["Kiwi", "Mango"]));
  });
});
