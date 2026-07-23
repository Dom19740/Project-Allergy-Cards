import { test, expect } from "@playwright/test";
import { seedStorage } from "./helpers";

const buildSavedCard = (overrides: Record<string, unknown> = {}) => ({
  id: "card-1",
  name: "My Card",
  languageCode: "en",
  selectedAllergens: { standard: ["milk"], custom: {}, ids: ["milk"] },
  customMessages: { iAmAllergicTo: "I am allergic to", theyMakeMeSick: "They make me sick" },
  translatedContent: {
    ui: { allergyAlert: "", iAmAllergicTo: "", pleaseBeCareful: "", thankYou: "", theyMakeMeSick: "" },
    allergens: {},
    emergency: { attention: "", emergency: "", needHelp: "", callServices: "", dial112: "" },
  },
  createdAt: Date.now(),
  ...overrides,
});

test.describe("card menu", () => {
  test("lists items in the expected order: Home, Edit Allergens, Edit Alerts, Change Language, Understand Your Card, Disclaimer, Report an Issue", async ({
    page,
  }) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      selectedAllergens: { standard: ["milk"], custom: [], ids: ["milk"] },
    });
    await page.goto("/alert/en");
    await expect(page.locator("h1")).toBeVisible();

    await page.getByTitle("Menu", { exact: true }).click();

    const labels = await page.locator("div.w-64 button span").allTextContents();
    expect(labels).toEqual([
      "Home",
      "Edit Allergens",
      "Edit Alerts",
      "Change Language",
      "Understand Your Card",
      "Disclaimer",
      "Report an Issue",
    ]);
  });

  test("Understand Your Card has no corner close button (Ok button dismisses it instead)", async ({ page }) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      selectedAllergens: { standard: ["milk"], custom: [], ids: ["milk"] },
    });
    await page.goto("/alert/en");
    await expect(page.locator("h1")).toBeVisible();

    await page.getByTitle("Menu", { exact: true }).click();
    await page.getByText("Understand Your Card").click();

    const dialog = page.getByRole("heading", { name: "Understand Your Card" });
    await expect(dialog).toBeVisible();
    await expect(page.locator('button:has(span:text("Close"))')).toHaveCount(0);

    await page.getByRole("button", { name: "Ok" }).click();
    await expect(dialog).toHaveCount(0);
  });

  test("Disclaimer has no corner close button (I Understand button dismisses it instead)", async ({ page }) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      selectedAllergens: { standard: ["milk"], custom: [], ids: ["milk"] },
    });
    await page.goto("/alert/en");
    await expect(page.locator("h1")).toBeVisible();

    await page.getByTitle("Menu", { exact: true }).click();
    await page.getByText("Disclaimer", { exact: true }).click();

    const dialog = page.getByRole("heading", { name: "Safety Disclaimer" });
    await expect(dialog).toBeVisible();
    await expect(page.locator('button:has(span:text("Close"))')).toHaveCount(0);

    await page.getByRole("button", { name: "I Understand" }).click();
    await expect(dialog).toHaveCount(0);
  });
});

test.describe("card selector", () => {
  test("the switch-card action bar button is hidden with only one saved card", async ({ page }) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      selectedAllergens: { standard: ["milk"], custom: [], ids: ["milk"] },
      savedAllergyCards: [buildSavedCard()],
    });
    await page.goto("/alert/en");
    await expect(page.locator("h1")).toBeVisible();

    await expect(page.getByTitle("Switch Card")).toHaveCount(0);
  });

  test("appears with multiple saved cards and lists their names for switching", async ({ page }) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      selectedAllergens: { standard: ["milk"], custom: [], ids: ["milk"] },
      savedAllergyCards: [
        buildSavedCard({ id: "card-1", name: "Soy Card" }),
        buildSavedCard({ id: "card-2", name: "Peanut Card" }),
      ],
    });
    await page.goto("/alert/en");
    await expect(page.locator("h1")).toBeVisible();

    await page.getByTitle("Switch Card").click();

    await expect(page.getByText("Soy Card")).toBeVisible();
    await expect(page.getByText("Peanut Card")).toBeVisible();
  });

  test("selecting a different card from the switcher loads its allergens", async ({ page }) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      selectedAllergens: { standard: ["milk"], custom: [], ids: ["milk"] },
      savedAllergyCards: [
        buildSavedCard({ id: "card-1", name: "Milk Card", selectedAllergens: { standard: ["milk"], custom: {}, ids: ["milk"] } }),
        buildSavedCard({ id: "card-2", name: "Soy Card", selectedAllergens: { standard: ["soy"], custom: {}, ids: ["soy"] } }),
      ],
    });
    await page.goto("/alert/en");
    await expect(page.locator("h1")).toBeVisible();

    await page.getByTitle("Switch Card").click();
    await page.getByText("Soy Card").click();

    await expect(page).toHaveURL(/\/alert\/en/);
    await expect(page.getByText("Soy", { exact: true })).toBeVisible();
  });
});

test.describe("custom allergen protection", () => {
  test("a custom allergen used on a saved card cannot be removed from Select Allergens", async ({ page }) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      isPremium: "true",
      savedAllergyCards: [
        buildSavedCard({
          name: "Nut Card",
          selectedAllergens: { standard: [], custom: {}, ids: ["MyNut"] },
        }),
      ],
      customAllergenNames: ["MyNut"],
    });
    await page.goto("/select-allergens");

    await expect(page.getByText("MyNut", { exact: true })).toBeVisible();

    // The X button sits at the top-right corner of the MyNut chip.
    const chip = page.locator("div").filter({ hasText: /^MyNut$/ }).last();
    await chip.locator("button").first().click();

    await expect(page.getByText(/Can't remove "MyNut"/i)).toBeVisible();
    await expect(page.getByText("MyNut", { exact: true })).toBeVisible(); // still there
  });

  test("a custom allergen not used on any saved card can be removed normally", async ({ page }) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      isPremium: "true",
      customAllergenNames: ["FreeNut"],
    });
    await page.goto("/select-allergens");

    await expect(page.getByText("FreeNut", { exact: true })).toBeVisible();

    const chip = page.locator("div").filter({ hasText: /^FreeNut$/ }).last();
    await chip.locator("button").first().click();

    await expect(page.getByText(/"FreeNut" removed/i)).toBeVisible();
    await expect(page.getByText("FreeNut", { exact: true })).toHaveCount(0);
  });

  test("custom allergens registered on the device appear immediately without loading any card", async ({ page }) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      isPremium: "true",
      customAllergenNames: ["Kiwi", "Mango"],
    });
    await page.goto("/select-allergens");

    await expect(page.getByText("Kiwi", { exact: true })).toBeVisible();
    await expect(page.getByText("Mango", { exact: true })).toBeVisible();
  });
});
