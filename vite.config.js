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
  define: {
    // Création de constantes globales remplacées à la compilation
    __SUPABASE_URL__: JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
    __SUPABASE_ANON_KEY__: JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ''),
    __ADMIN_CODE__: JSON.stringify(process.env.VITE_ADMIN_CODE || ''),
  },
});