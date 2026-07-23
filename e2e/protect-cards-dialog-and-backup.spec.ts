import { test, expect } from "@playwright/test";
import { seedStorage } from "./helpers";

// Full valid SavedCard fixture per src/lib/types.ts - only the fields the UI
// actually reads (name, languageCode, createdAt) are asserted on, the rest
// exist purely to satisfy the shape isValidSavedCard() checks in backup.ts.
const buildSavedCard = (overrides: Record<string, unknown> = {}) => ({
  id: "card-1",
  name: "My Thai Card",
  // Deliberately a free language (see FREE_LANGUAGES in premium-config.ts) -
  // these tests are about the backup/restore round-trip itself, not premium
  // gating, and a non-free language would make backupRequiresPremium() gate
  // the restore instead of completing it.
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

const buildEmergencyCard = () => buildSavedCard({ id: "emergency-slot", name: "Emergency Card" });

test.describe("protect cards dialog", () => {
  const isMobileProject = (projectName: string) => projectName === "mobile-safari" || projectName === "mobile-chrome";

  test("auto-opens on any mobile browser (iOS Safari, Android Chrome), never on desktop", async ({ page }, testInfo) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      savedAllergyCards: [buildSavedCard()],
    });
    await page.goto("/");

    const heading = page.getByRole("heading", { name: "Protect your saved cards" });
    if (isMobileProject(testInfo.project.name)) {
      await expect(heading).toBeVisible();
    } else {
      await expect(heading).toHaveCount(0);
    }
  });

  test("dismissal persists across reloads (mobile only)", async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), "mobile-only dialog");

    await seedStorage(page, {
      hasSeenOnboarding: true,
      savedAllergyCards: [buildSavedCard()],
    });
    await page.goto("/");

    const heading = page.getByRole("heading", { name: "Protect your saved cards" });
    await expect(heading).toBeVisible();

    await page.getByRole("button", { name: "Got it" }).click();
    await expect(heading).toHaveCount(0);

    await page.reload();
    await expect(heading).toHaveCount(0);
  });

  test("shows the iOS Safari 'Add to Home Screen' step", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-safari", "iOS Safari-specific instructions");

    await seedStorage(page, {
      hasSeenOnboarding: true,
      savedAllergyCards: [buildSavedCard()],
    });
    await page.goto("/");

    await expect(page.getByText("2. Add to Home Screen")).toBeVisible();
    await expect(page.getByText(/Tap Share, scroll down to 'Add to Home Screen'/)).toBeVisible();
  });

  test("shows a 'switch to Safari' step for non-Safari iOS browsers", async ({ page }) => {
    // None of the configured projects represent a third-party iOS browser
    // (Chrome/Firefox/Brave/DuckDuckGo on iOS - all WebKit wrappers with
    // their own UA token), so spoof one directly regardless of project.
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, "userAgent", {
        value:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1",
        configurable: true,
      });
    });

    await seedStorage(page, {
      hasSeenOnboarding: true,
      savedAllergyCards: [buildSavedCard()],
    });
    await page.goto("/");

    await expect(page.getByText("2. Switch to Safari")).toBeVisible();
  });

  test("shows a working Google Play link on Android", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chrome", "Android-specific instructions");

    await seedStorage(page, {
      hasSeenOnboarding: true,
      savedAllergyCards: [buildSavedCard()],
    });
    await page.goto("/");

    await expect(page.getByText("2. Get the app from Google Play")).toBeVisible();
    const playLink = page.getByRole("link", { name: "Get it on Google Play" });
    await expect(playLink).toHaveAttribute(
      "href",
      "https://play.google.com/store/apps/details?id=com.dpbcreative.simpleallergyalert"
    );
  });

});

test.describe("saved card backup & restore", () => {
  test("exports saved cards to a file and restores them on a clean install", async ({ page, browser }) => {
    await seedStorage(page, {
      hasSeenOnboarding: true,
      savedAllergyCards: [buildSavedCard()],
      savedEmergencyCard: buildEmergencyCard(),
      // Not testing the protect-cards dialog here - dismiss it upfront so it
      // doesn't cover the Backup button on mobile projects.
      installBannerDismissed: "true",
    });
    await page.goto("/");

    await expect(page.getByText("My Thai Card")).toBeVisible();

    await page.getByRole("button", { name: "Backup", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Backup & Restore" })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Backup to file" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^simple-allergy-alert-.*\.json$/);

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
    // Home-screen burger menu instead.
    await freshPage.getByRole("button", { name: "Menu" }).click();
    await freshPage.getByRole("button", { name: "Restore Backup" }).click();
    await freshPage.getByRole("button", { name: "Restore from file" }).click();
    await freshPage.locator('input[type="file"]').setInputFiles(backupPath!);

    await expect(freshPage.getByText(/Restored 1 card and emergency card/i)).toBeVisible();
    await expect(freshPage.getByText("My Thai Card")).toBeVisible();

    await freshContext.close();
  });

  test("a clean install with zero saved cards still exposes a restore entry point", async ({ page }) => {
    await seedStorage(page, { hasSeenOnboarding: true });
    await page.goto("/");

    // The Saved Cards section only renders once there's at least one card,
    // so its own Backup button must not be present here - restoring has to
    // go through the Home-screen burger menu instead.
    await expect(page.getByRole("button", { name: "Backup", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("button", { name: "Restore Backup" })).toBeVisible();
  });

  test("rejects a file that isn't a valid backup", async ({ page }) => {
    // The "Saved Cards" section (and its Backup button) only renders when
    // there's at least one card, so seed one just to reach the entry point.
    await seedStorage(page, {
      hasSeenOnboarding: true,
      savedAllergyCards: [buildSavedCard()],
      installBannerDismissed: "true",
    });
    await page.goto("/");

    await page.getByRole("button", { name: "Backup", exact: true }).click();
    await page.getByRole("button", { name: "Restore from file" }).click();

    await page.locator('input[type="file"]').setInputFiles({
      name: "not-a-backup.json",
      mimeType: "application/json",
      buffer: Buffer.from("{ this is not valid json"),
    });

    await expect(page.getByText(/not a valid backup/i)).toBeVisible();
  });
});

test.describe("clipboard backup & restore", () => {
  // Playwright's WebKit engine (the mobile-safari project) has historically
  // limited/no support for granting clipboard permissions in automated
  // tests - which may itself be representative of real Safari's stricter
  // clipboard behavior. Chromium-based projects only, per the plan.
  const isClipboardTestable = (projectName: string) => projectName === "chromium" || projectName === "mobile-chrome";

  test("'Copy backup' in the protect-cards dialog writes valid backup JSON to the clipboard", async ({
    page,
    context,
  }, testInfo) => {
    // ProtectCardsDialog only ever shows on mobile web (isMobileWeb() gate) -
    // desktop chromium is clipboard-testable but not a valid target for it.
    test.skip(testInfo.project.name !== "mobile-chrome", "clipboard permissions not reliably grantable here, and this dialog is mobile-only");

    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await seedStorage(page, {
      hasSeenOnboarding: true,
      savedAllergyCards: [buildSavedCard()],
    });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Protect your saved cards" })).toBeVisible();
    await page.getByRole("button", { name: "Copy backup" }).click();
    await expect(page.getByText(/Backup copied/i)).toBeVisible();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    const parsed = JSON.parse(clipboardText);
    expect(parsed.savedCards).toHaveLength(1);
    expect(parsed.savedCards[0].name).toBe("My Thai Card");
  });

  test("'Paste from clipboard' in Backup & Restore reads a backup back in", async ({ page, context }, testInfo) => {
    test.skip(!isClipboardTestable(testInfo.project.name), "clipboard permissions not reliably grantable here");

    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    // Zero saved cards - reaches the dialog via the Home-screen burger menu,
    // same as the file-based clean-install test.
    await seedStorage(page, { hasSeenOnboarding: true });
    await page.goto("/");

    const backupPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      savedCards: [buildSavedCard()],
      emergencyCard: null,
    };
    await page.evaluate((json) => navigator.clipboard.writeText(json), JSON.stringify(backupPayload));

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("button", { name: "Restore Backup" }).click();
    await page.getByRole("button", { name: "Paste from clipboard" }).click();

    await expect(page.getByText(/Restored 1 card/i)).toBeVisible();
    await expect(page.getByText("My Thai Card")).toBeVisible();
  });
});
