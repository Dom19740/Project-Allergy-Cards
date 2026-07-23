import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard } from '@/lib/types';

export type CustomAllergenImageMap = { [allergenName: string]: string };

// Saved cards reference a custom allergen by name only - they don't embed a
// snapshot of its image. Deleting the image (or the allergen) out from under
// a saved card silently drops that allergen from the card's image grid, so
// callers must check this before removing.
export async function getSavedCardNamesUsingAllergen(allergenName: string): Promise<string[]> {
  const [standardCards, emergencyCard] = await Promise.all([
    storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS),
    storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD),
  ]);

  const allCards = [...(standardCards || []), ...(emergencyCard ? [emergencyCard] : [])];
  return allCards
    .filter(card => card.selectedAllergens?.ids?.includes(allergenName))
    .map(card => card.name);
}

export async function getCustomAllergenImages(): Promise<CustomAllergenImageMap> {
  return (await storage.get<CustomAllergenImageMap>(STORAGE_KEYS.CUSTOM_ALLERGEN_IMAGES)) || {};
}

export async function setCustomAllergenImage(name: string, dataUrl: string): Promise<void> {
  const map = await getCustomAllergenImages();
  map[name] = dataUrl;
  await storage.set(STORAGE_KEYS.CUSTOM_ALLERGEN_IMAGES, map);
}

export async function removeCustomAllergenImage(name: string): Promise<void> {
  const map = await getCustomAllergenImages();
  if (!(name in map)) return;
  delete map[name];
  await storage.set(STORAGE_KEYS.CUSTOM_ALLERGEN_IMAGES, map);
}

// Fits the whole image within a square canvas (letterboxed with white
// padding on the shorter side) then downscales to targetSize, matching the
// 350x350 dimensions of the built-in allergen icons in public/allergens/ so
// custom photos sit consistently alongside them regardless of object-fit -
// without cropping any of the original photo away.
export async function fileToCompressedDataUrl(file: File, targetSize = 350, quality = 0.85): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Could not read that image.'));
    img.src = rawDataUrl;
  });

  const scale = Math.min(targetSize / img.width, targetSize / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  const dx = (targetSize - drawWidth) / 2;
  const dy = (targetSize - drawHeight) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return rawDataUrl;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetSize, targetSize);
  ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, drawWidth, drawHeight);
  return canvas.toDataURL('image/jpeg', quality);
}
