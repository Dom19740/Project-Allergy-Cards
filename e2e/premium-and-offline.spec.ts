import { test, expect } from "@playwright/test";
import { seedStorage } from "./helpers";

test.describe("premium gating", () => {
  test("custom allergens are locked for a free user, and the upsell link routes to the paywall", async ({ page }) => {
    await seedStorage(page, { hasSeenOnboarding: true });
    await page.goto("/select-allergens");

    const input = page.getByPlaceholder("Add custom allergens");
    await expect(input).toBeDisabled();
    // The Add button renders a Crown icon instead of text while locked, so
    // it has no accessible name - find it via its shared parent container.
    const addButton = input.locator("xpath=..").locator("button");
    await expect(addButton).toBeDisabled();

    await page.getByRole("button", { name: "Unlock custom allergens" }).click();
    await expect(page).toHaveURL(/\/premium-onboarding/);
  });

  test("non-free languages are locked for a free user and show an upgrade prompt instead of being selected", async ({ page }) => {
    await seedStorage(page, { hasSeenOnboarding: true });
    await page.goto("/select-language");

    const trigger = page.getByRole("combobox");
    await expect(trigger).toContainText("Spanish (European)"); // es-ES is free, and the default

    await trigger.click();
    await page.getByRole("option", { name: "Albanian" }).click(); // sq is not in FREE_LANGUAGES

    await expect(page.getByText(/premium feature/i)).toBeVisible();
    // Selection must not have changed to the locked language.
    await expect(trigger).toContainText("Spanish (European)");
  });
});

test.describe("offline handling", () => {
  test("a premium user's custom allergens block continuing while offline, and unblock when back online", async ({
    page,
    context,
  }) => {
    await seedStorage(page, { hasSeenOnboarding: true, isPremium: "true" });
    await page.goto("/select-allergens");

    const input = page.getByPlaceholder("Add custom allergens");
    await expect(input).toBeEnabled({ timeout: 10_000 }); // waits for the premium cache read to resolve

    await input.fill("Kiwi");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("Kiwi", { exact: true })).toBeVisible();

    const continueButton = page.getByRole("button", { name: "Continue" });
    await expect(continueButton).toBeEnabled();

    await context.setOffline(true);
    await expect(page.getByText(/Custom allergens require an internet connection/i)).toBeVisible();
    await expect(continueButton).toBeDisabled();

    await context.setOffline(false);
    await expect(page.getByText(/Custom allergens require an internet connection/i)).toBeHidden();
    await expect(continueButton).toBeEnabled();
  });

  test("a premium user's custom alert text blocks continuing while offline", async ({ page, context }) => {
    await seedStorage(page, { hasSeenOnboarding: true, isPremium: "true" });
    await page.goto("/select-alert");

    const primaryField = page.locator("#allergic-to");
    await expect(primaryField).toBeEnabled({ timeout: 10_000 });
    await primaryField.fill("I cannot eat any of the following");

    const continueButton = page.getByRole("button", { name: "Continue" });
    await expect(continueButton).toBeEnabled();

    await context.setOffline(true);
    await expect(page.getByText(/Custom alert text requires an internet connection/i)).toBeVisible();
    await expect(continueButton).toBeDisabled();
    await context.setOffline(false);
  });
});
