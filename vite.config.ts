import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/spese/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Saldo',
        short_name: 'Saldo',
        description: 'Spese, entrate, risparmi e investimenti',
        theme_color: '#5980a6',
        background_color: '#f2f2f3',
        display: 'standalone',
        start_url: '/spese/',
        scope: '/spese/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
