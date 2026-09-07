import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptsDir, '..');
const sourceIndexPath = path.join(scriptsDir, 'index.vite.html');
const rootIndexPath = path.join(rootDir, 'index.html');

const sourceIndex = fs.readFileSync(sourceIndexPath, 'utf8');
const currentIndex = fs.existsSync(rootIndexPath) ? fs.readFileSync(rootIndexPath, 'utf8') : '';

if (currentIndex !== sourceIndex) {
  fs.writeFileSync(rootIndexPath, sourceIndex);
  console.log('Restored Vite source index.html for local build/dev.');
}
