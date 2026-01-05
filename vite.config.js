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
    strictPort: false,
  },
  define: {
    // Injection des variables d'environnement lors du build
    // process.env est rempli par GitHub Actions via le bloc 'env' du workflow
    __SUPABASE_URL__: JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
    __SUPABASE_ANON_KEY__: JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ''),
    __ADMIN_CODE__: JSON.stringify(process.env.VITE_ADMIN_CODE || ''),
  },
});