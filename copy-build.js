import fs from 'fs';
import path from 'path';

const src = path.resolve('.output/public');
const dest = path.resolve('dist');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  console.log('Copying build assets from .output/public to dist...');
  copyRecursiveSync(src, dest);
  console.log('Build assets successfully copied to dist!');
} catch (err) {
  console.error('Error copying build assets:', err);
  process.exit(1);
}