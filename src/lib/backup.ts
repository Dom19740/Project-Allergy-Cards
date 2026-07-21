import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
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

export const exportBackup = async (): Promise<void> => {
  const savedCards = (await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS)) || [];
  const emergencyCard = await storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);

  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    savedCards,
    emergencyCard,
  };

  const fileName = `allergy-cards-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const json = JSON.stringify(payload, null, 2);

  // Mirrors the proven native share path in src/lib/card-utils.ts (shareCard):
  // a bare <a download> or navigator.share doesn't reliably work inside the
  // Android WebView, so write to the cache dir and hand off to the native
  // share sheet instead.
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

  const blob = new Blob([json], { type: 'application/json' });
  const file = new File([blob], fileName, { type: 'application/json' });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'Allergy Cards Backup',
    });
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
