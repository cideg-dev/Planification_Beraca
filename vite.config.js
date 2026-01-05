import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Charge les variables du fichier .env (créé par GitHub Actions)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/Planification_Beraca/',
    root: '.',
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
      },
    },
    // SOLUTION ULTIME : Remplacement textuel forcé lors de la compilation
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      'import.meta.env.VITE_ADMIN_CODE': JSON.stringify(env.VITE_ADMIN_CODE || '')
    },
    server: {
      strictPort: false,
    }
  };
});