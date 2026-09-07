import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptsDir, '..');
const buildDir = path.join(rootDir, 'build');
const assetsDir = path.join(rootDir, 'assets');

const copyDirectory = (source, destination) => {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
};

execFileSync('npm', ['run', 'build'], {
  cwd: rootDir,
  stdio: 'inherit',
});

const requiredBuildFiles = [
  path.join(buildDir, 'index.html'),
  path.join(buildDir, 'assets'),
  path.join(buildDir, 'favicon.ico'),
];

for (const filePath of requiredBuildFiles) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing build artifact: ${path.relative(rootDir, filePath)}`);
  }
}

fs.copyFileSync(path.join(buildDir, 'index.html'), path.join(rootDir, 'index.html'));
fs.rmSync(assetsDir, { force: true, recursive: true });
copyDirectory(path.join(buildDir, 'assets'), assetsDir);
fs.copyFileSync(path.join(buildDir, 'favicon.ico'), path.join(rootDir, 'favicon.ico'));
fs.writeFileSync(path.join(rootDir, '.nojekyll'), '');

console.log('Packaged GitHub Pages root from Vite build output.');
