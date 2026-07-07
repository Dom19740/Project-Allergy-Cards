import { describe, it, expect } from "vitest";
import { emergencyNumbers } from "../emergencyNumbers";

describe("emergencyNumbers", () => {
  it("has an English fallback list, since 'en' is used as the default/unknown-language fallback", () => {
    expect(emergencyNumbers.en).toBeDefined();
    expect(emergencyNumbers.en.length).toBeGreaterThan(0);
  });

  it("every language has at least one number, and every number is a non-empty digit string", () => {
    for (const [lang, entries] of Object.entries(emergencyNumbers)) {
      expect(entries.length, `${lang} has no emergency numbers`).toBeGreaterThan(0);
      for (const entry of entries) {
        expect(entry.number, `${lang} has an entry with no number`).toMatch(/^\d+$/);
      }
    }
  });

  it("has no duplicate numbers within the same language's list", () => {
    for (const [lang, entries] of Object.entries(emergencyNumbers)) {
      const numbers = entries.map((e) => `${e.number}|${e.region ?? ""}`);
      const unique = new Set(numbers);
      expect(unique.size, `${lang} has duplicate (number, region) entries`).toBe(numbers.length);
    }
  });
});
