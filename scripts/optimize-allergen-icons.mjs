import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const dir = path.resolve(import.meta.dirname, '../public/allergens');

const files = (await readdir(dir)).filter((f) => f.toLowerCase().endsWith('.png'));

for (const file of files) {
  const filePath = path.join(dir, file);
  const before = (await stat(filePath)).size;
  const buffer = await sharp(filePath)
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  await sharp(buffer).toFile(filePath);
  const after = (await stat(filePath)).size;
  console.log(`${file}: ${(before / 1024).toFixed(1)}KB -> ${(after / 1024).toFixed(1)}KB`);
}
