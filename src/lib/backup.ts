import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
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

const buildPayload = (savedCards: SavedCard[], emergencyCard: SavedCard | null): { fileName: string; json: string } => {
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

const buildBackupFile = async (): Promise<{ fileName: string; json: string }> => {
  const [savedCards, emergencyCard] = await Promise.all([
    storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS).then((cards) => cards || []),
    storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD),
  ]);

  return buildPayload(savedCards, emergencyCard);
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
