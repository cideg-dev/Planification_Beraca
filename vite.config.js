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
  // Injection directe et forcée des secrets dans le code
  define: {
    '__VITE_SUPABASE_URL__': JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
    '__VITE_SUPABASE_ANON_KEY__': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ''),
    '__VITE_ADMIN_CODE__': JSON.stringify(process.env.VITE_ADMIN_CODE || '')
  },
  server: {
    strictPort: false,
  }
});