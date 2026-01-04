import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    // Assure que le CSS est correctement servi
    headers: {
      'Content-Type': 'text/css',
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
});