import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['AD.jpeg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'AD BERACA Planning',
        short_name: 'AD Beraca',
        description: 'Planificateur d\'interventions pour l\'église AD Beraca',
        theme_color: '#0d6efd',
        icons: [
          {
            src: 'AD.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'AD.jpeg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    open: true
  }
});