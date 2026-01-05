import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement depuis les fichiers .env et le système
  // Le 3ème argument '' permet de charger toutes les variables, pas seulement celles préfixées par VITE_
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
    server: {
      strictPort: false,
    },
    define: {
      // Injection des variables dans le code global
      __SUPABASE_URL__: JSON.stringify(env.VITE_SUPABASE_URL),
      __SUPABASE_ANON_KEY__: JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      __ADMIN_CODE__: JSON.stringify(env.VITE_ADMIN_CODE),
    },
  };
});