import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Luxe Store',
        short_name: 'Luxe',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#e53935',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },

      workbox: {
        navigateFallback: '/index.html',

        // 🔥 cache file build (QUAN TRỌNG)
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],

        runtimeCaching: [
          // ❌ KHÔNG cache auth
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/auth'),
            handler: 'NetworkOnly',
          },

          // ❌ KHÔNG cache cart
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/cart'),
            handler: 'NetworkOnly',
          },

          // ✅ CACHE ẢNH (có giới hạn → tránh crash)
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 ngày
              },
            },
          },

          // ✅ CACHE PRODUCTS API
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/products'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'products-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24, // 1 ngày
              },
            },
          },

          // ✅ PAGE (QUAN TRỌNG NHẤT cho offline reload)
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 20,
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: true, // cho phép test PWA ở localhost
      },
    }),
  ],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})