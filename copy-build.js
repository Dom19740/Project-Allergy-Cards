import fs from 'fs';
import path from 'path';

const src = path.resolve('.output/public');
const dest = path.resolve('dist');
const templatePath = path.resolve('.output/server/_chunks/renderer-template.mjs');

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
  
  // Copy all public assets
  copyRecursiveSync(src, dest);
  console.log('Build assets successfully copied to dist!');
  
  // Extract index.html from Nitro's server-side renderer template
  if (fs.existsSync(templatePath)) {
    console.log('Extracting index.html from Nitro server template...');
    const content = fs.readFileSync(templatePath, 'utf8');
    const match = content.match(/new HTTPResponse\('([\s\S]*?)',\s*\{\s*headers:/);
    
    if (match && match[1]) {
      let html = match[1]
        .replace(/\\r/g, '\r')
        .replace(/\\n/g, '\n')
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .replace(/\\\//g, '/');
      
      fs.writeFileSync(path.join(dest, 'index.html'), html, 'utf8');
      console.log('SUCCESS: Extracted and wrote index.html to dist!');
    } else {
      console.error('WARNING: Could not parse HTML from renderer template!');
    }
  } else {
    console.error('WARNING: Nitro renderer template not found!');
  }
  
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