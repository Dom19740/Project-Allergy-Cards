import { test, expect, Page } from "@playwright/test";

// "Keep Your Cards Safe" is step 1, right after "Safety First" (step 0):
// 0 Safety First -> "I Understand" -> 1 Keep Your Cards Safe.
//
// Embla keeps every slide mounted simultaneously (just translated out of
// view), so a plain toBeVisible() check on this step's heading would pass
// even if navigation never actually reached it - toBeInViewport() checks
// real on-screen position instead. The wait after clicking gives embla's
// scroll transition time to settle before asserting.
const goToInstallChoiceStep = async (page: Page) => {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "I Understand" }).click();
  await page.waitForTimeout(500);
  await expect(page.getByRole("heading", { name: "Keep Your Cards Safe" })).toBeInViewport();
};

test.describe("onboarding install-choice step", () => {
  test("shows the Android install CTA with a working Play Store link", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chrome", "Android-specific");

    await goToInstallChoiceStep(page);

    const playLink = page.getByRole("link", { name: "Get it on Google Play" });
    await expect(playLink).toHaveAttribute(
      "href",
      "https://play.google.com/store/apps/details?id=com.dpbcreative.simpleallergyalert"
    );
  });

  test("shows the iOS Safari 'Add to Home Screen' steps", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-safari", "iOS Safari-specific");

    await goToInstallChoiceStep(page);

    await expect(page.getByText("Tap the Share button in Safari")).toBeVisible();
    await expect(page.getByText("Scroll down and tap 'Add to Home Screen'")).toBeVisible();
  });

  test("shows a 'switch to Safari' note for non-Safari iOS browsers", async ({ page }) => {
    // None of the configured projects represent a third-party iOS browser,
    // so spoof one directly regardless of project (mirrors the same pattern
    // used for ProtectCardsDialog's equivalent test).
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, "userAgent", {
        value:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1",
        configurable: true,
      });
    });

    await goToInstallChoiceStep(page);

    await expect(page.getByText(/Only Safari supports adding this app/)).toBeVisible();
  });

  test("desktop shows the privacy explanation without an install CTA", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop-only");

    await goToInstallChoiceStep(page);

    await expect(page.getByText(/Everything stays local to this browser/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Get it on Google Play" })).toHaveCount(0);
  });
});
