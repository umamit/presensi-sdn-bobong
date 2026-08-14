import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { writeFileSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

// Plugin: auto-generate public/version.json saat build
const autoVersionJson = {
  name: 'auto-version-json',
  buildStart() {
    writeFileSync('public/version.json', JSON.stringify({
      version: pkg.version,
      buildTime: Date.now()
    }));
  }
};

export default defineConfig({
  plugins: [
    autoVersionJson,
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      workbox: {
        skipWaiting: true,       // Langsung aktifkan service worker baru
        clientsClaim: true,      // Ambil kendali semua tab sekaligus
        cleanupOutdatedCaches: true, // Hapus cache lama otomatis
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sdn-bobong-live-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 hari
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Presensi Guru - SD Negeri Bobong',
        short_name: 'Presensi SDN Bobong',
        description: 'Aplikasi Presensi Online Berbasis Geolocation GPS untuk Guru & Staff SD Negeri Bobong',
        start_url: '/',
        scope: '/',
        id: 'sdn-bobong-presensi',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});

