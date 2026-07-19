import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          // Manual injection: the prayer check-in entry (index.html) must
          // NOT get the revelation tracker's manifest/service worker, so
          // auto-injection (which targets every html entry) is disabled.
          // revelations.html links the manifest itself and standaloneMain.tsx
          // registers the service worker directly.
          injectRegister: false,
          registerType: 'autoUpdate',
          includeAssets: ['icon.svg', 'apple-touch-icon.png', 'favicon-32.png'],
          manifest: {
            name: '小路rhema追蹤器',
            short_name: '小路rhema追蹤器',
            description: '記錄與追蹤個人領受的啟示，分類、標記狀態、隨時搜尋。',
            start_url: '/',
            scope: '/',
            display: 'standalone',
            background_color: '#EDE9F7',
            theme_color: '#232A63',
            icons: [
              { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
              { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
              { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
          },
        }),
      ],
      build: {
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html'),
            revelations: path.resolve(__dirname, 'revelations.html'),
          },
        },
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
