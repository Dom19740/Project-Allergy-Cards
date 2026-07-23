import { storage, STORAGE_KEYS } from '@/lib/storage';

export type CustomAllergenImageMap = { [allergenName: string]: string };

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

// Center-crops to a square then downscales to targetSize, matching the
// 350x350 dimensions of the built-in allergen icons in public/allergens/ so
// custom photos sit consistently alongside them regardless of object-fit.
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

  const cropSize = Math.min(img.width, img.height);
  const sx = (img.width - cropSize) / 2;
  const sy = (img.height - cropSize) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return rawDataUrl;
  ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, targetSize, targetSize);
  return canvas.toDataURL('image/jpeg', quality);
}
