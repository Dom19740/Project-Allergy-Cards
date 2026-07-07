import { describe, it, expect } from "vitest";
import { SUPPORTED_LANGUAGES } from "../supportedLanguages";
import { ALLERGEN_DICTIONARY } from "../allergen-dictionary";
import { UI_TEXT_DICTIONARY } from "../ui-text-dictionary";
import { ALLERGEN_OPTIONS } from "../allergens";

// The card falls back to a live translation call whenever a dictionary is
// missing an entry - which on native throws a hard TranslationError (see
// translator.ts) rather than showing a broken card. These are regression
// tests: they don't guarantee the *translation quality* of 94 languages,
// but they guarantee no language silently lost its offline coverage.

const nonEnglishLanguages = SUPPORTED_LANGUAGES.filter((l) => l.code !== "en");

const ALLERGEN_KEYS = ALLERGEN_OPTIONS.map((a) => a.name.toLowerCase());

const UI_TEXT_KEYS = [
  "allergy alert!",
  "please be careful with my food.",
  "thank you!",
  "i can not eat:",
  "they make me very sick and i could die",
  "attention",
  "i am having a severe allergic reaction.",
  "i need medical help immediately.",
  "please call emergency services.",
  "dial 112",
  "call",
];

describe("ALLERGEN_DICTIONARY completeness", () => {
  it("has an entry for every supported non-English language", () => {
    const missing = nonEnglishLanguages.filter((l) => !ALLERGEN_DICTIONARY[l.code]);
    expect(missing.map((l) => l.code)).toEqual([]);
  });

  it("has no stale entries for language codes that are no longer supported", () => {
    const supportedCodes = new Set(SUPPORTED_LANGUAGES.map((l) => l.code));
    const stale = Object.keys(ALLERGEN_DICTIONARY).filter((code) => !supportedCodes.has(code));
    expect(stale).toEqual([]);
  });

  it.each(nonEnglishLanguages)("$name ($code) has a non-empty translation for every standard allergen", (lang) => {
    const entries = ALLERGEN_DICTIONARY[lang.code] ?? {};
    for (const key of ALLERGEN_KEYS) {
      expect(entries[key], `${lang.code} is missing allergen "${key}"`).toBeTruthy();
      expect(entries[key].trim().length, `${lang.code}["${key}"] is blank`).toBeGreaterThan(0);
    }
  });
});

describe("UI_TEXT_DICTIONARY completeness", () => {
  it("has an entry for every supported non-English language", () => {
    const missing = nonEnglishLanguages.filter((l) => !UI_TEXT_DICTIONARY[l.code]);
    expect(missing.map((l) => l.code)).toEqual([]);
  });

  it("has no stale entries for language codes that are no longer supported", () => {
    const supportedCodes = new Set(SUPPORTED_LANGUAGES.map((l) => l.code));
    const stale = Object.keys(UI_TEXT_DICTIONARY).filter((code) => !supportedCodes.has(code));
    expect(stale).toEqual([]);
  });

  it.each(nonEnglishLanguages)("$name ($code) has a non-empty translation for every fixed UI string", (lang) => {
    const entries = UI_TEXT_DICTIONARY[lang.code] ?? {};
    for (const key of UI_TEXT_KEYS) {
      expect(entries[key], `${lang.code} is missing UI text "${key}"`).toBeTruthy();
      expect(entries[key].trim().length, `${lang.code}["${key}"] is blank`).toBeGreaterThan(0);
    }
  });
});
