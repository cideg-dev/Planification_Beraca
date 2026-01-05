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
  define: {
    // Cette partie force le remplacement des variables par les secrets GitHub lors du build
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    'import.meta.env.VITE_ADMIN_CODE': JSON.stringify(process.env.VITE_ADMIN_CODE),
  },
  server: {
    strictPort: false,
  }
});