import { test, expect } from "@playwright/test";
import { seedStorage, trackUnexpectedTranslationCalls } from "./helpers";

test.describe("full allergy card creation flow (free user, dictionary-covered language)", () => {
  test("creates a card end-to-end without any network translation call", async ({ page }) => {
    await seedStorage(page, { hasSeenOnboarding: true });
    const translationCalls = trackUnexpectedTranslationCalls(page);

    // Onboarding now shows on every "Get Started" click (not just the
    // first), so this test - which is about the card-creation flow, not
    // onboarding - navigates straight to the step it actually cares about.
    await page.goto("/select-allergens");

    await page.getByText("Milk", { exact: true }).click();
    await page.getByText("Peanuts", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page).toHaveURL(/\/select-alert/);
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page).toHaveURL(/\/select-language/);
    // The page defaults selectedLanguageCode to "es-ES" before the language
    // list even finishes loading, so Continue is already actionable.
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page).toHaveURL(/\/alert\/es-ES/);

    const heading = page.locator("h1");
    await expect(heading).toHaveText("¡alerta de alergia!", { timeout: 10_000 });
    await expect(page.getByText("No puedo comer:")).toBeVisible();
    await expect(page.getByText("Leche", { exact: true })).toBeVisible();
    await expect(page.getByText("Cacahuetes", { exact: true })).toBeVisible();
    await expect(page.getByText("Me enferman mucho y puedo morir")).toBeVisible();
    await expect(page.getByText("¡gracias!")).toBeVisible();
    await expect(page.getByText("Translated to Spanish (European)")).toBeVisible();

    // The allergen names and every fixed UI/emergency string for es-ES live
    // in the local dictionaries (see src/lib/__tests__/dictionaries.test.ts),
    // so this whole flow should never have reached the network.
    expect(translationCalls).toEqual([]);
  });

  test("the read-aloud control toggles without crashing the page, online or offline", async ({ page, context }) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      selectedAllergens: { standard: ["milk"], custom: [], ids: ["milk"] },
    });

    await page.goto("/alert/es-ES");
    await expect(page.locator("h1")).toHaveText("¡alerta de alergia!", { timeout: 10_000 });

    const readAloudButton = page.getByTitle("Read Aloud").or(page.getByTitle("Stop Reading"));
    await readAloudButton.click();
    // Whether the browser's speech synthesis actually has a Spanish voice
    // installed is environment-dependent (headless CI often has none) - the
    // only thing this asserts is that neither outcome (speaking or the
    // "not supported" toast) leaves the page in a broken state.
    await expect(page.locator("h1")).toBeVisible();

    await context.setOffline(true);
    await readAloudButton.click();
    await expect(page.locator("h1")).toBeVisible();
    await context.setOffline(false);
  });
});
