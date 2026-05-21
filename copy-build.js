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
    console.log(`Copying file: ${src} -> ${dest}`);
    fs.copyFileSync(src, dest);
  }
}

try {
  console.log('Starting build asset copy...');
  if (fs.existsSync(dest)) {
    console.log('Cleaning existing dist folder...');
    fs.rmSync(dest, { recursive: true, force: true });
  }
  
  copyRecursiveSync(src, dest);
  console.log('Build assets successfully copied to dist!');
  
  // Verify contents of dist
  if (fs.existsSync(dest)) {
    console.log('Verifying dist folder contents:');
    const files = fs.readdirSync(dest);
    console.log(files);
    if (files.includes('index.html')) {
      console.log('SUCCESS: index.html is present in dist!');
    } else {
      console.error('WARNING: index.html is MISSING from dist!');
    }
  } else {
    console.error('ERROR: dist folder does not exist!');
  }
} catch (err) {
  console.error('Error copying build assets:', err);
  process.exit(1);
}