import { test, expect, Page } from "@playwright/test";
import { seedStorage } from "./helpers";

// Steps: 0 Safety First -> "I Understand" -> 1 Keep Your Cards Safe ->
// 2 Intro (Back/Skip) -> 3 Select Your Allergens -> 4 Choose a Language ->
// 5 Share & Save -> 6 Emergency Ready -> 7 Add a Widget -> 8 Know Your Card ->
// 9 Unlock Premium (last - "Continue" navigates to /select-allergens).
//
// Unlock Premium is a real slide in this same carousel, not a separate
// route - /premium-onboarding just redirects here with `jumpToEnd`.
//
// Embla keeps every slide mounted simultaneously (just translated out of
// view), so toBeInViewport() (not toBeVisible()) is what actually confirms
// navigation reached the right slide - see the install-choice spec for the
// same pattern. Clicks are paced with a wait for embla's transition to settle.
const goToIntroStep = async (page: Page) => {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "I Understand" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(500);
  // Step titles aren't rendered as visible headings for normal slides (only
  // used internally + as image alt text), so assert on the description text.
  await expect(page.getByText("Create personalized allergy alerts")).toBeInViewport();
};

const goToLastStep = async (page: Page) => {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "I Understand" }).click();
  await page.waitForTimeout(500);
  for (let i = 0; i < 8; i++) {
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForTimeout(500);
  }
  await expect(page.getByRole("heading", { name: "Unlock Premium" })).toBeInViewport();
};

test.describe("onboarding completion flow", () => {
  test("a first-time visitor sees Back (not Skip) on the Intro step", async ({ page }) => {
    await seedStorage(page, {}); // no hasCompletedOnboarding flag at all
    await goToIntroStep(page);

    await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Skip" })).toHaveCount(0);
  });

  test("a returning visitor who has completed onboarding before sees Skip on the Intro step", async ({ page }) => {
    await seedStorage(page, { hasCompletedOnboarding: true });
    await goToIntroStep(page);

    await expect(page.getByRole("button", { name: "Skip" })).toBeVisible();
  });

  test("Skip on the Intro step goes straight to card creation", async ({ page }) => {
    await seedStorage(page, { hasCompletedOnboarding: true });
    await goToIntroStep(page);

    await page.getByRole("button", { name: "Skip" }).click();
    await expect(page).toHaveURL(/\/select-allergens/);
  });

  test("the last step (Unlock Premium) says Continue and marks onboarding completed", async ({ page }) => {
    await seedStorage(page, {});
    await goToLastStep(page);

    await expect(page.getByRole("button", { name: "Get Started" })).toHaveCount(0);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL(/\/select-allergens/);

    // Completing the carousel once should have persisted the flag, so a
    // fresh visit now offers Skip instead of Back on the Intro step.
    await goToIntroStep(page);
    await expect(page.getByRole("button", { name: "Skip" })).toBeVisible();
  });

  test("swiping back from Unlock Premium returns to Know Your Card", async ({ page }) => {
    await seedStorage(page, {});
    await goToLastStep(page);

    await page.getByRole("button", { name: "Back" }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText("Open the menu on any card to understand all the features.")).toBeInViewport();
  });
});

test.describe("premium onboarding as a continuation of the carousel", () => {
  test("visiting /premium-onboarding redirects into the carousel at Unlock Premium, with working Back and Continue", async ({ page }) => {
    await seedStorage(page, {});
    await page.goto("/premium-onboarding");

    await expect(page).toHaveURL(/\/onboarding/);
    // The redirect plus embla's jump-to-slide both need a beat to settle
    // before asserting - WebKit in particular can be slow here.
    await page.waitForTimeout(800);
    await expect(page.getByRole("heading", { name: "Unlock Premium" })).toBeInViewport({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();

    await page.getByRole("button", { name: "Back" }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText("Open the menu on any card to understand all the features.")).toBeInViewport();
  });

  test("Continue navigates to card creation", async ({ page }) => {
    await seedStorage(page, {});
    await page.goto("/premium-onboarding");
    await expect(page).toHaveURL(/\/onboarding/);

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL(/\/select-allergens/);
  });
});
