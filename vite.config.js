import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Planification_Beraca/', // Chemin vers le dépôt GitHub pour que l'application fonctionne sur GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['bootstrap'],
          'chart': ['chart.js/auto'],
        }
      }
    }
  },
  define: {
    'process.env': {}
  }
})