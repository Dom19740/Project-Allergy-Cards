import { test, expect } from "@playwright/test";
import { seedStorage } from "./helpers";

// Full valid SavedCard fixture per src/lib/types.ts - only the fields the UI
// actually reads (name, languageCode, createdAt) are asserted on, the rest
// exist purely to satisfy the shape isValidSavedCard() checks in backup.ts.
const buildSavedCard = (overrides: Record<string, unknown> = {}) => ({
  id: "card-1",
  name: "My Thai Card",
  languageCode: "th",
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

const buildEmergencyCard = () => buildSavedCard({ id: "emergency-slot", name: "Emergency Card" });

test.describe("iOS Home Screen install banner", () => {
  test("is only shown on iOS Safari (WebKit), never on Chromium/Android", async ({ page }, testInfo) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      savedAllergyCards: [buildSavedCard()],
    });
    await page.goto("/");

    const banner = page.getByText("Protect your saved cards");
    if (testInfo.project.name === "mobile-safari") {
      await expect(banner).toBeVisible();
    } else {
      await expect(banner).toHaveCount(0);
    }
  });

  test("dismissal persists across reloads (mobile-safari only)", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-safari", "iOS-specific banner");

    await seedStorage(page, {
      hasSeenOnboarding: true,
      savedAllergyCards: [buildSavedCard()],
    });
    await page.goto("/");

    const banner = page.getByText("Protect your saved cards");
    await expect(banner).toBeVisible();

    await page.getByLabel("Dismiss").click();
    await expect(banner).toHaveCount(0);

    await page.reload();
    await expect(banner).toHaveCount(0);
  });

  test("the 'How do I do this?' link shows the Add to Home Screen steps (mobile-safari only)", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-safari", "iOS-specific banner");

    await seedStorage(page, {
      hasSeenOnboarding: true,
      savedAllergyCards: [buildSavedCard()],
    });
    await page.goto("/");

    await page.getByText("How do I do this?").click();
    await expect(page.getByText("Tap the 'Share' button in Safari")).toBeVisible();
    await expect(page.getByText("Scroll down and tap 'Add to Home Screen'")).toBeVisible();

    await page.getByRole("button", { name: "Got it" }).click();
    await expect(page.getByText("Protect your saved cards")).toHaveCount(0);
  });
});

test.describe("saved card backup & restore", () => {
  test("exports saved cards to a file and restores them from it after data loss", async ({ page }) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      savedAllergyCards: [buildSavedCard()],
      savedEmergencyCard: buildEmergencyCard(),
    });
    await page.goto("/");

    await expect(page.getByText("My Thai Card")).toBeVisible();

    await page.getByRole("button", { name: "Backup" }).click();
    await expect(page.getByRole("heading", { name: "Backup & Restore" })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export backup" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^allergy-cards-backup-.*\.json$/);

    const backupPath = await download.path();
    expect(backupPath).toBeTruthy();

    // Simulate the data-loss scenario this whole feature exists for: Safari
    // clears local storage, so the card that was visible above is gone.
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await expect(page.getByText("My Thai Card")).toHaveCount(0);

    await page.getByRole("button", { name: "Backup" }).click();
    await page.getByRole("button", { name: "Restore from backup" }).click();
    await page.locator('input[type="file"]').setInputFiles(backupPath!);

    await expect(page.getByText(/Restored 1 card and emergency card/i)).toBeVisible();
    await expect(page.getByText("My Thai Card")).toBeVisible();
  });

  test("rejects a file that isn't a valid backup", async ({ page }) => {
    // The "Saved Cards" section (and its Backup button) only renders when
    // there's at least one card, so seed one just to reach the entry point.
    await seedStorage(page, { hasSeenOnboarding: true, savedAllergyCards: [buildSavedCard()] });
    await page.goto("/");

    await page.getByRole("button", { name: "Backup" }).click();
    await page.getByRole("button", { name: "Restore from backup" }).click();

    await page.locator('input[type="file"]').setInputFiles({
      name: "not-a-backup.json",
      mimeType: "application/json",
      buffer: Buffer.from("{ this is not valid json"),
    });

    await expect(page.getByText(/not a valid backup/i)).toBeVisible();
  });
});
