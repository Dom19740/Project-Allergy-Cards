import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { toast } from 'sonner';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard } from '@/lib/types';

const BACKUP_VERSION = 1;

interface BackupPayload {
  version: number;
  exportedAt: string;
  savedCards: SavedCard[];
  emergencyCard: SavedCard | null;
}

const isValidSavedCard = (value: any): value is SavedCard =>
  value &&
  typeof value === 'object' &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.languageCode === 'string' &&
  typeof value.createdAt === 'number';

const buildBackupFile = async (): Promise<{ fileName: string; json: string }> => {
  const [savedCards, emergencyCard] = await Promise.all([
    storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS).then((cards) => cards || []),
    storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD),
  ]);

  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    savedCards,
    emergencyCard,
  };

  return {
    fileName: `allergy-cards-backup-${new Date().toISOString().slice(0, 10)}.json`,
    json: JSON.stringify(payload, null, 2),
  };
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

// Mirrors src/lib/card-utils.ts's downloadCard/shareCard split: "download"
// saves the file silently with no share sheet, "share" hands it off to the
// OS/browser share sheet so it can go straight to email, AirDrop, a cloud
// drive, etc. without the user having to locate the downloaded file first.
export const downloadBackup = async (): Promise<void> => {
  const { fileName, json } = await buildBackupFile();

  if (Capacitor.isNativePlatform()) {
    await Filesystem.writeFile({
      path: fileName,
      data: json,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true,
    });
    return;
  }

  downloadBlob(json, fileName);
};

export const shareBackup = async (): Promise<void> => {
  const { fileName, json } = await buildBackupFile();

  if (Capacitor.isNativePlatform()) {
    try {
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: json,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      await Share.share({
        title: 'Allergy Cards Backup',
        url: savedFile.uri,
      });
    } catch (error) {
      if ((error as any).code !== 'UA') { // not a user cancellation
        throw error;
      }
    }
    return;
  }

  // Chrome's Web Share API only accepts files whose MIME type is on its
  // allowlist (text/plain, application/pdf, images, etc.) - application/json
  // isn't included, so share() can reject the file even after canShare()
  // returned true for it. text/plain is accepted and doesn't affect how the
  // file reads back in - importBackup() just parses the text as JSON.
  const blob = new Blob([json], { type: 'text/plain' });
  const file = new File([blob], fileName, { type: 'text/plain' });
  const shareData = { title: 'Allergy Cards Backup', files: [file] };

  if (!navigator.canShare?.(shareData)) {
    downloadBlob(json, fileName);
    toast.info("Your browser can't share files directly, so we saved it to your device instead.");
    return;
  }

  try {
    await navigator.share(shareData);
  } catch (error) {
    if ((error as DOMException).name !== 'AbortError') { // not a user cancellation
      throw error;
    }
  }
};

export const importBackup = async (file: File, maxSavedCards: number): Promise<{ importedCards: number; importedEmergency: boolean }> => {
  const text = await file.text();
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not a valid backup (invalid JSON).');
  }

  const savedCards: SavedCard[] = Array.isArray(parsed?.savedCards)
    ? parsed.savedCards.filter(isValidSavedCard)
    : [];
  const emergencyCard: SavedCard | null = isValidSavedCard(parsed?.emergencyCard) ? parsed.emergencyCard : null;

  if (savedCards.length === 0 && !emergencyCard) {
    throw new Error("That file doesn't contain any saved cards.");
  }

  const cappedCards = savedCards.slice(0, maxSavedCards);
  await storage.set(STORAGE_KEYS.SAVED_CARDS, cappedCards);
  if (emergencyCard) {
    await storage.set(STORAGE_KEYS.SAVED_EMERGENCY_CARD, emergencyCard);
  }

  window.dispatchEvent(new CustomEvent('storage-update'));

  return { importedCards: cappedCards.length, importedEmergency: !!emergencyCard };
};
