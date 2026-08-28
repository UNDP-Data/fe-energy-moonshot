import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const basePath = '/fe-energy-moonshot/';
const rootDir = __dirname;
const dataDir = path.resolve(rootDir, 'data');
const buildDir = path.resolve(rootDir, 'build');
const publicDir = path.resolve(rootDir, 'public');
const moonshotProxyTarget = process.env.MOONSHOT_PROXY_TARGET || 'http://127.0.0.1:3001';

const getContentType = (filePath: string) => {
  if (filePath.endsWith('.csv')) return 'text/csv; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'application/octet-stream';
};

const copyDirectory = (source: string, destination: string) => {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(destination, { recursive: true });
  fs.readdirSync(source, { withFileTypes: true }).forEach((entry) => {
    if (entry.name === '.DS_Store') return;
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  });
};

const dataAssetsPlugin = (): Plugin => ({
  name: 'moonshot-static-assets',
  configureServer(server) {
    server.middlewares.use(`${basePath}data`, (request, response, next) => {
      const requestUrl = new URL(request.url || '/', 'http://localhost');
      const relativePath = decodeURIComponent(requestUrl.pathname.replace(new RegExp(`^${basePath}data/?`), ''));
      const filePath = path.resolve(dataDir, relativePath);
      if (!filePath.startsWith(dataDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        next();
        return;
      }
      response.setHeader('Content-Type', getContentType(filePath));
      fs.createReadStream(filePath).pipe(response);
    });
  },
  closeBundle() {
    copyDirectory(dataDir, path.join(buildDir, 'data'));
    const faviconPath = path.join(publicDir, 'favicon.ico');
    if (fs.existsSync(faviconPath)) {
      fs.copyFileSync(faviconPath, path.join(buildDir, 'favicon.ico'));
    }
  },
});

export default defineConfig({
  base: basePath,
  build: {
    outDir: 'build',
    sourcemap: false,
  },
  plugins: [
    react(),
    dataAssetsPlugin(),
  ],
  publicDir: false,
  server: {
    fs: {
      allow: [rootDir],
    },
    proxy: {
      '/api/moonshot': {
        changeOrigin: true,
        secure: true,
        target: moonshotProxyTarget,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['src/setupTests.ts'],
  },
});
