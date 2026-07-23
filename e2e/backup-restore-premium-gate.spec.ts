import { test, expect } from "@playwright/test";
import { seedStorage } from "./helpers";

const isClipboardTestable = (projectName: string) => projectName === "chromium" || projectName === "mobile-chrome";

const buildSavedCard = (overrides: Record<string, unknown> = {}) => ({
  id: "card-1",
  name: "Card 1",
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

const buildBackup = (overrides: Record<string, unknown> = {}) => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  wasPremiumAtBackup: false,
  savedCards: [buildSavedCard()],
  emergencyCard: null,
  customAllergenImages: {},
  customAllergenNames: [],
  customAlertPresets: [],
  ...overrides,
});

const openBackupDialogFromEmptyHome = async (page: import("@playwright/test").Page) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("button", { name: "Restore Backup" }).click();
};

test.describe("backup restore - premium content gate", () => {
  test("a plain single-card, free-language backup with no premium content restores immediately", async ({
    page,
    context,
  }, testInfo) => {
    test.skip(!isClipboardTestable(testInfo.project.name), "clipboard permissions not reliably grantable here");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await seedStorage(page, { hasSeenOnboarding: true });
    await openBackupDialogFromEmptyHome(page);

    await page.evaluate((json) => navigator.clipboard.writeText(json), JSON.stringify(buildBackup()));
    await page.getByRole("button", { name: "Paste from clipboard" }).click();

    await expect(page.getByText(/Restored 1 card/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Restore Your Purchase First" })).toHaveCount(0);
  });

  test("a backup with a non-free language is blocked, even though it's only a single card", async ({
    page,
    context,
  }, testInfo) => {
    test.skip(!isClipboardTestable(testInfo.project.name), "clipboard permissions not reliably grantable here");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await seedStorage(page, { hasSeenOnboarding: true });
    await openBackupDialogFromEmptyHome(page);

    const backup = buildBackup({ savedCards: [buildSavedCard({ languageCode: "ja" })] });
    await page.evaluate((json) => navigator.clipboard.writeText(json), JSON.stringify(backup));
    await page.getByRole("button", { name: "Paste from clipboard" }).click();

    await expect(page.getByRole("heading", { name: "Restore Your Purchase First" })).toBeVisible();
    await expect(page.getByText(/Restored 1 card/i)).toHaveCount(0);
  });

  test("a backup with a custom allergen is blocked, even with just one card", async ({ page, context }, testInfo) => {
    test.skip(!isClipboardTestable(testInfo.project.name), "clipboard permissions not reliably grantable here");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await seedStorage(page, { hasSeenOnboarding: true });
    await openBackupDialogFromEmptyHome(page);

    const backup = buildBackup({ customAllergenNames: ["Kiwi"] });
    await page.evaluate((json) => navigator.clipboard.writeText(json), JSON.stringify(backup));
    await page.getByRole("button", { name: "Paste from clipboard" }).click();

    await expect(page.getByRole("heading", { name: "Restore Your Purchase First" })).toBeVisible();
  });

  test("a backup with a custom alert preset is blocked, even with just one card", async ({ page, context }, testInfo) => {
    test.skip(!isClipboardTestable(testInfo.project.name), "clipboard permissions not reliably grantable here");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await seedStorage(page, { hasSeenOnboarding: true });
    await openBackupDialogFromEmptyHome(page);

    const backup = buildBackup({
      customAlertPresets: [{ id: "p1", name: "Kid", iAmAllergicTo: "x", theyMakeMeSick: "y" }],
    });
    await page.evaluate((json) => navigator.clipboard.writeText(json), JSON.stringify(backup));
    await page.getByRole("button", { name: "Paste from clipboard" }).click();

    await expect(page.getByRole("heading", { name: "Restore Your Purchase First" })).toBeVisible();
  });

  test("the gate has no partial-import option - only Restore Purchase and Cancel", async ({
    page,
    context,
  }, testInfo) => {
    test.skip(!isClipboardTestable(testInfo.project.name), "clipboard permissions not reliably grantable here");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await seedStorage(page, { hasSeenOnboarding: true });
    await openBackupDialogFromEmptyHome(page);

    const backup = buildBackup({ customAllergenNames: ["Kiwi"] });
    await page.evaluate((json) => navigator.clipboard.writeText(json), JSON.stringify(backup));
    await page.getByRole("button", { name: "Paste from clipboard" }).click();

    const gate = page.getByRole("heading", { name: "Restore Your Purchase First" });
    await expect(gate).toBeVisible();
    await expect(page.getByRole("button", { name: "Restore Purchase" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(page.getByText(/Continue with/i)).toHaveCount(0);
  });

  test("cannot be dismissed via Escape or a backdrop click - only the explicit buttons close it", async ({
    page,
    context,
  }, testInfo) => {
    test.skip(!isClipboardTestable(testInfo.project.name), "clipboard permissions not reliably grantable here");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await seedStorage(page, { hasSeenOnboarding: true });
    await openBackupDialogFromEmptyHome(page);

    const backup = buildBackup({ customAllergenNames: ["Kiwi"] });
    await page.evaluate((json) => navigator.clipboard.writeText(json), JSON.stringify(backup));
    await page.getByRole("button", { name: "Paste from clipboard" }).click();

    const gate = page.getByRole("heading", { name: "Restore Your Purchase First" });
    await expect(gate).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(gate).toBeVisible();

    await page.mouse.click(5, 5);
    await expect(gate).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(gate).toHaveCount(0);
  });

  test("cancelling the gate imports nothing", async ({ page, context }, testInfo) => {
    test.skip(!isClipboardTestable(testInfo.project.name), "clipboard permissions not reliably grantable here");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await seedStorage(page, { hasSeenOnboarding: true });
    await openBackupDialogFromEmptyHome(page);

    const backup = buildBackup({ customAllergenNames: ["Kiwi"] });
    await page.evaluate((json) => navigator.clipboard.writeText(json), JSON.stringify(backup));
    await page.getByRole("button", { name: "Paste from clipboard" }).click();
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByText("Card 1")).toHaveCount(0);
  });

  test("Restore Purchase stashes the backup, and redeeming a promo code afterward finishes the import and returns Home", async ({
    page,
    context,
  }, testInfo) => {
    test.skip(!isClipboardTestable(testInfo.project.name), "clipboard permissions not reliably grantable here");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await seedStorage(page, { hasSeenOnboarding: true });
    await openBackupDialogFromEmptyHome(page);

    const backup = buildBackup({
      savedCards: [buildSavedCard({ id: "1", name: "Card 1" }), buildSavedCard({ id: "2", name: "Card 2" })],
    });
    await page.evaluate((json) => navigator.clipboard.writeText(json), JSON.stringify(backup));
    await page.getByRole("button", { name: "Paste from clipboard" }).click();

    await expect(page.getByRole("heading", { name: "Restore Your Purchase First" })).toBeVisible();
    await page.getByRole("button", { name: "Restore Purchase" }).click();

    await expect(page).toHaveURL(/\/onboarding/);
    await page.waitForTimeout(800);

    await page.getByText("Redeem Promo Code").click();
    await page.getByPlaceholder("ENTER CODE").fill("SAADEV");
    await page.getByRole("button", { name: "Redeem Code" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText(/imported all 2 cards/i)).toBeVisible();
    await expect(page.getByText("Card 1")).toBeVisible();
  });
});
