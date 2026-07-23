import { test, expect } from "@playwright/test";
import { seedStorage } from "./helpers";

test.describe("home screen menu", () => {
  test("lists Redeem Promo Code, Restore Purchase, and Restore Backup for a free user", async ({ page }) => {
    await seedStorage(page, { hasSeenOnboarding: true });
    await page.goto("/");

    await page.getByRole("button", { name: "Menu" }).click();

    const labels = await page.locator("div.w-64 button span").allTextContents();
    expect(labels).toEqual(["Redeem Promo Code", "Restore Purchase", "Restore Backup"]);
  });

  test("hides Restore Purchase once Premium is already unlocked", async ({ page }) => {
    await seedStorage(page, { hasSeenOnboarding: true, isPremium: "true" });
    await page.goto("/");

    await page.getByRole("button", { name: "Menu" }).click();

    const labels = await page.locator("div.w-64 button span").allTextContents();
    expect(labels).toEqual(["Redeem Promo Code", "Restore Backup"]);
  });

  test("Redeem Promo Code opens the promo code dialog", async ({ page }) => {
    await seedStorage(page, { hasSeenOnboarding: true });
    await page.goto("/");

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByText("Redeem Promo Code").click();

    await expect(page.getByRole("heading", { name: "Enter Promo Code" })).toBeVisible();
  });
});

test.describe("returning to the previous screen after unlocking Premium", () => {
  test("unlocking Premium from the Allergen screen returns there afterward", async ({ page }) => {
    await seedStorage(page, { hasSeenOnboarding: true });
    await page.goto("/select-allergens");

    await page.getByRole("button", { name: "Unlock custom allergens" }).click();
    await expect(page).toHaveURL(/\/onboarding/);
    await page.waitForTimeout(800);

    await page.getByText("Redeem Promo Code").click();
    await page.getByPlaceholder("ENTER CODE").fill("SAADEV");
    await page.getByRole("button", { name: "Redeem Code" }).click();

    await expect(page).toHaveURL(/\/select-allergens/);
  });

  test("unlocking Premium from the Language screen returns there afterward", async ({ page }) => {
    await seedStorage(page, { hasSeenOnboarding: true });
    await page.goto("/select-language");

    await page.getByRole("button", { name: "Unlock all languages" }).click();
    await expect(page).toHaveURL(/\/onboarding/);
    await page.waitForTimeout(800);

    await page.getByText("Redeem Promo Code").click();
    await page.getByPlaceholder("ENTER CODE").fill("SAADEV");
    await page.getByRole("button", { name: "Redeem Code" }).click();

    await expect(page).toHaveURL(/\/select-language/);
  });

  test("swiping through onboarding while already Premium does not bounce away from the carousel", async ({ page }) => {
    await seedStorage(page, { hasSeenOnboarding: true, isPremium: "true" });
    await page.goto("/onboarding");

    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/onboarding/);
  });
});
