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

test.describe("mobile install banner", () => {
  const isMobileProject = (projectName: string) => projectName === "mobile-safari" || projectName === "mobile-chrome";

  test("is shown on any mobile browser (iOS Safari, Android Chrome), never on desktop", async ({ page }, testInfo) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      savedAllergyCards: [buildSavedCard()],
    });
    await page.goto("/");

    const banner = page.getByText("Protect your saved cards");
    if (isMobileProject(testInfo.project.name)) {
      await expect(banner).toBeVisible();
    } else {
      await expect(banner).toHaveCount(0);
    }
  });

  test("dismissal persists across reloads (mobile only)", async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), "mobile-only banner");

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

  test("the 'How do I do this?' link shows iOS Safari-specific steps", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-safari", "iOS Safari-specific instructions");

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

  test("the 'How do I do this?' link shows Android-specific steps", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chrome", "Android-specific instructions");

    await seedStorage(page, {
      hasSeenOnboarding: true,
      savedAllergyCards: [buildSavedCard()],
    });
    await page.goto("/");

    await page.getByText("How do I do this?").click();
    await expect(page.getByText("Tap the menu button in your browser")).toBeVisible();
    await expect(page.getByText("Tap 'Add to Home screen' or 'Install app'")).toBeVisible();

    await page.getByRole("button", { name: "Got it" }).click();
    await expect(page.getByText("Protect your saved cards")).toHaveCount(0);
  });
});

test.describe("saved card backup & restore", () => {
  test("exports saved cards to a file and restores them on a clean install", async ({ page, browser }) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      savedAllergyCards: [buildSavedCard()],
      savedEmergencyCard: buildEmergencyCard(),
    });
    await page.goto("/");

    await expect(page.getByText("My Thai Card")).toBeVisible();

    await page.getByRole("button", { name: "Backup", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Backup & Restore" })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download backup" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^allergy-cards-backup-.*\.json$/);

    const backupPath = await download.path();
    expect(backupPath).toBeTruthy();

    // Simulate the scenario this feature exists for with a genuinely fresh
    // browser context (zero storage) rather than clearing + reloading the
    // same page - a reload would just replay this test's own seedStorage
    // init script and silently put the card right back.
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    await freshPage.goto("/");
    await expect(freshPage.getByText("My Thai Card")).toHaveCount(0);

    // With zero saved cards, the "Saved Cards" section (and its Backup
    // button) doesn't render at all - restoring has to go through the
    // standalone Home-screen "Restore from backup" link instead.
    await freshPage.getByRole("button", { name: "Restore from backup" }).click();
    await freshPage.locator('input[type="file"]').setInputFiles(backupPath!);

    await expect(freshPage.getByText(/Restored 1 card and emergency card/i)).toBeVisible();
    await expect(freshPage.getByText("My Thai Card")).toBeVisible();

    await freshContext.close();
  });

  test("a clean install with zero saved cards still exposes a restore entry point", async ({ page }) => {
    await seedStorage(page, { hasSeenOnboarding: true });
    await page.goto("/");

    await expect(page.getByRole("button", { name: "Restore from backup" })).toBeVisible();
    // The Saved Cards section only renders once there's at least one card,
    // so its own Backup button must not be present here.
    await expect(page.getByRole("button", { name: "Backup", exact: true })).toHaveCount(0);
  });

  test("rejects a file that isn't a valid backup", async ({ page }) => {
    // The "Saved Cards" section (and its Backup button) only renders when
    // there's at least one card, so seed one just to reach the entry point.
    await seedStorage(page, { hasSeenOnboarding: true, savedAllergyCards: [buildSavedCard()] });
    await page.goto("/");

    await page.getByRole("button", { name: "Backup", exact: true }).click();
    await page.getByRole("button", { name: "Restore from backup" }).click();

    await page.locator('input[type="file"]').setInputFiles({
      name: "not-a-backup.json",
      mimeType: "application/json",
      buffer: Buffer.from("{ this is not valid json"),
    });

    await expect(page.getByText(/not a valid backup/i)).toBeVisible();
  });
});
