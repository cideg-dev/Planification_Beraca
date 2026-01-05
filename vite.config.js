import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Planification_Beraca/',
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    // Empêcher le chargement de CSS comme modules
    strictPort: false,
  },
});