import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Planification_Beraca/',
  root: '.',
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    strictPort: false,
  }
});