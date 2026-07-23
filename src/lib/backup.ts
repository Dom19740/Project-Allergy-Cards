import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Clipboard } from '@capacitor/clipboard';
import { Share } from '@capacitor/share';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard, CustomAlertPreset } from '@/lib/types';
import { CustomAllergenImageMap, getCustomAllergenImages, getCustomAllergenNames, mergeCustomAllergenNames } from '@/lib/customAllergenImages';
import { getCustomAlertPresets, MAX_CUSTOM_ALERT_PRESETS } from '@/lib/customAlertPresets';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';

const BACKUP_VERSION = 1;

interface BackupPayload {
  version: number;
  exportedAt: string;
  // A snapshot of whether Premium was unlocked when this backup was made.
  // This is never trusted to grant Premium on its own (that would let anyone
  // unlock it for free by editing the file) - it only decides whether the
  // restore flow should nudge the user to restore their purchase *before*
  // capping their cards, instead of after.
  wasPremiumAtBackup: boolean;
  savedCards: SavedCard[];
  emergencyCard: SavedCard | null;
  customAllergenImages: CustomAllergenImageMap;
  customAllergenNames: string[];
  customAlertPresets: CustomAlertPreset[];
}

export interface ParsedBackup {
  savedCards: SavedCard[];
  emergencyCard: SavedCard | null;
  customAllergenImages: CustomAllergenImageMap;
  customAllergenNames: string[];
  customAlertPresets: CustomAlertPreset[];
  wasPremiumAtBackup: boolean;
}

export interface BackupImportResult {
  importedCards: number;
  skippedCards: number;
  importedEmergency: boolean;
  importedImages: number;
  importedPresets: number;
}

const isValidSavedCard = (value: any): value is SavedCard =>
  value &&
  typeof value === 'object' &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.languageCode === 'string' &&
  typeof value.createdAt === 'number';

const isValidImageMap = (value: any): value is CustomAllergenImageMap =>
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.values(value).every((v) => typeof v === 'string');

const isValidPreset = (value: any): value is CustomAlertPreset =>
  value &&
  typeof value === 'object' &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.iAmAllergicTo === 'string' &&
  typeof value.theyMakeMeSick === 'string';

const buildPayload = (
  savedCards: SavedCard[],
  emergencyCard: SavedCard | null,
  customAllergenImages: CustomAllergenImageMap,
  customAllergenNames: string[],
  customAlertPresets: CustomAlertPreset[],
  wasPremiumAtBackup: boolean
): { fileName: string; json: string } => {
  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    wasPremiumAtBackup,
    savedCards,
    emergencyCard,
    customAllergenImages,
    customAllergenNames,
    customAlertPresets,
  };

  return {
    fileName: `simple-allergy-alert-${new Date().toISOString().slice(0, 10)}.json`,
    json: JSON.stringify(payload, null, 2),
  };
};

const buildBackupFile = async (isPremium: boolean): Promise<{ fileName: string; json: string }> => {
  const [savedCards, emergencyCard, customAllergenImages, customAllergenNames, customAlertPresets] = await Promise.all([
    storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS).then((cards) => cards || []),
    storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD),
    getCustomAllergenImages(),
    getCustomAllergenNames(),
    getCustomAlertPresets(),
  ]);

  return buildPayload(savedCards, emergencyCard, customAllergenImages, customAllergenNames, customAlertPresets, isPremium);
};

const downloadBlob = (json: string, fileName: string) => {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadBackup = async (isPremium: boolean): Promise<void> => {
  const { fileName, json } = await buildBackupFile(isPremium);

  if (Capacitor.isNativePlatform()) {
    // Directory.Documents is scoped-storage-hidden on modern Android targets
    // (writes "succeed" into a folder the user can never actually find), so
    // write to the always-accessible cache dir and hand it to the OS share
    // sheet instead - the same working pattern shareCard() already uses.
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    try {
      await Share.share({
        title: 'Allergy Cards Backup',
        url: savedFile.uri,
      });
    } catch (error) {
      if ((error as any)?.code === 'UA') return; // user cancelled the share sheet
      throw error;
    }
    return;
  }

  downloadBlob(json, fileName);
};

// Mirrors downloadBackup, but writes to the clipboard instead of a file - a
// faster alternative for the common case of backing up right before
// switching to a freshly installed app, where "download, then hunt for the
// file in Files/Downloads" is more friction than "copy, then paste".
export const copyBackupToClipboard = async (isPremium: boolean): Promise<void> => {
  const { json } = await buildBackupFile(isPremium);

  // The web Clipboard API isn't reliable inside Capacitor's Android WebView
  // (permission prompts it can't surface properly), so native platforms use
  // the dedicated Capacitor plugin, which talks to the OS clipboard directly.
  if (Capacitor.isNativePlatform()) {
    await Clipboard.write({ string: json });
    return;
  }

  if (!navigator.clipboard?.writeText) {
    await downloadBackup(isPremium);
    return;
  }

  await navigator.clipboard.writeText(json);
};

export const readBackupFileText = (file: File): Promise<string> => file.text();

export const readClipboardText = async (): Promise<string> => {
  if (Capacitor.isNativePlatform()) {
    try {
      const result = await Clipboard.read();
      return result.value;
    } catch {
      throw new Error("Couldn't read the clipboard - use Restore from backup instead.");
    }
  }

  if (!navigator.clipboard?.readText) {
    throw new Error("This browser can't read the clipboard - use Restore from backup instead.");
  }
  try {
    return await navigator.clipboard.readText();
  } catch {
    throw new Error("Couldn't read the clipboard - use Restore from backup instead.");
  }
};

// Validates and normalizes raw backup text without writing anything to
// storage, so callers can inspect it (e.g. check wasPremiumAtBackup against
// the current card count) and decide whether to prompt the user before
// applying it.
export const parseBackupPayload = (text: string): ParsedBackup => {
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That is not a valid backup (invalid JSON).');
  }

  const savedCards: SavedCard[] = Array.isArray(parsed?.savedCards)
    ? parsed.savedCards.filter(isValidSavedCard)
    : [];
  const emergencyCard: SavedCard | null = isValidSavedCard(parsed?.emergencyCard) ? parsed.emergencyCard : null;
  const customAllergenImages: CustomAllergenImageMap = isValidImageMap(parsed?.customAllergenImages) ? parsed.customAllergenImages : {};
  const customAllergenNames: string[] = Array.isArray(parsed?.customAllergenNames)
    ? parsed.customAllergenNames.filter((n: unknown) => typeof n === 'string')
    : [];
  const customAlertPresets: CustomAlertPreset[] = Array.isArray(parsed?.customAlertPresets)
    ? parsed.customAlertPresets.filter(isValidPreset)
    : [];
  const wasPremiumAtBackup = parsed?.wasPremiumAtBackup === true;

  if (
    savedCards.length === 0 &&
    !emergencyCard &&
    Object.keys(customAllergenImages).length === 0 &&
    customAllergenNames.length === 0 &&
    customAlertPresets.length === 0
  ) {
    throw new Error("That doesn't contain any saved cards.");
  }

  return { savedCards, emergencyCard, customAllergenImages, customAllergenNames, customAlertPresets, wasPremiumAtBackup };
};

// Writes an already-parsed backup to storage, capping saved cards at
// maxSavedCards (same rule as creating a new card - see SaveCardDialog).
export const applyParsedBackup = async (parsed: ParsedBackup, maxSavedCards: number): Promise<BackupImportResult> => {
  const { savedCards, emergencyCard, customAllergenImages: backupImages, customAllergenNames, customAlertPresets: backupPresets } = parsed;

  const cappedCards = savedCards.slice(0, maxSavedCards);
  await storage.set(STORAGE_KEYS.SAVED_CARDS, cappedCards);
  if (emergencyCard) {
    await storage.set(STORAGE_KEYS.SAVED_EMERGENCY_CARD, emergencyCard);
  }

  const importedImageCount = Object.keys(backupImages).length;
  if (importedImageCount > 0) {
    // Merge rather than replace - a backup taken on another device shouldn't
    // wipe out custom allergen images already saved on this one.
    const existingImages = await getCustomAllergenImages();
    await storage.set(STORAGE_KEYS.CUSTOM_ALLERGEN_IMAGES, { ...existingImages, ...backupImages });
  }

  // Union the explicit name registry with names discovered elsewhere in the
  // backup - the image map's keys and any custom (non-standard) allergen ids
  // still referenced by imported cards - so an older backup made before this
  // registry existed still surfaces its custom allergens immediately instead
  // of only once a card using them gets loaded.
  // Scan the full (pre-cap) savedCards list, not cappedCards - a custom
  // allergen used only on a card that got capped out for being over the plan
  // limit should still register, since it's still a real allergen the user
  // created and may reuse on a new card.
  const standardIds = new Set(ALLERGEN_OPTIONS.map((opt) => opt.id));
  const idsFromCards = [...savedCards, ...(emergencyCard ? [emergencyCard] : [])]
    .flatMap((card) => card.selectedAllergens?.ids || [])
    .filter((id) => !standardIds.has(id));
  const namesToMerge = Array.from(new Set([...customAllergenNames, ...Object.keys(backupImages), ...idsFromCards]));
  if (namesToMerge.length > 0) {
    await mergeCustomAllergenNames(namesToMerge);
  }

  let importedPresetCount = 0;
  if (backupPresets.length > 0) {
    // Merge rather than replace, same reasoning as the image map above -
    // never drop presets already saved on this device to make room for a
    // backup taken elsewhere. Existing local presets win on id collisions.
    const existingPresets = await getCustomAlertPresets();
    const existingIds = new Set(existingPresets.map((p) => p.id));
    const newPresets = backupPresets.filter((p) => !existingIds.has(p.id));
    const room = Math.max(0, MAX_CUSTOM_ALERT_PRESETS - existingPresets.length);
    const presetsToAdd = newPresets.slice(0, room);
    importedPresetCount = presetsToAdd.length;
    if (presetsToAdd.length > 0) {
      await storage.set(STORAGE_KEYS.CUSTOM_ALERT_PRESETS, [...existingPresets, ...presetsToAdd]);
    }
  }

  window.dispatchEvent(new CustomEvent('storage-update'));

  return {
    importedCards: cappedCards.length,
    skippedCards: savedCards.length - cappedCards.length,
    importedEmergency: !!emergencyCard,
    importedImages: importedImageCount,
    importedPresets: importedPresetCount,
  };
};

// Stashes a backup's raw text across the trip to the restore-purchase flow
// (sessionStorage survives client-side route changes), so it can be finished
// automatically once premium-status-changed fires with a real, verified
// purchase - see usePendingBackupRestore.
export const stashPendingBackupRestore = async (text: string): Promise<void> => {
  await storage.setEphemeral(STORAGE_KEYS.PENDING_BACKUP_RESTORE, { text });
};

export const takePendingBackupRestore = async (): Promise<string | null> => {
  const pending = await storage.getEphemeral<{ text: string }>(STORAGE_KEYS.PENDING_BACKUP_RESTORE);
  if (!pending) return null;
  await storage.removeEphemeral(STORAGE_KEYS.PENDING_BACKUP_RESTORE);
  return pending.text;
};
