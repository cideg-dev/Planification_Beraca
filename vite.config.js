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
    // Configuration du serveur pour éviter les erreurs de type MIME
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
    // Empêcher le chargement de CSS comme modules
    strictPort: false,
  },
  css: {
    modules: false, // Désactiver les modules CSS pour éviter les erreurs
  },
});