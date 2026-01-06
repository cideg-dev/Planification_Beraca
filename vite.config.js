import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Planification_Beraca/',
  root: '.',
  define: {
    '__VITE_SUPABASE_URL_PLACEHOLDER__': process.env.VITE_SUPABASE_URL
      ? JSON.stringify(process.env.VITE_SUPABASE_URL)
      : JSON.stringify('VITE_SUPABASE_URL_PLACEHOLDER'),
    '__VITE_SUPABASE_ANON_KEY_PLACEHOLDER__': process.env.VITE_SUPABASE_ANON_KEY
      ? JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY)
      : JSON.stringify('VITE_SUPABASE_ANON_KEY_PLACEHOLDER'),
    '__VITE_ADMIN_CODE_PLACEHOLDER__': process.env.VITE_ADMIN_CODE
      ? JSON.stringify(process.env.VITE_ADMIN_CODE)
      : JSON.stringify('VITE_ADMIN_CODE_PLACEHOLDER')
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    strictPort: false,
  }
});