import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // GitHub Pages serves the app at https://bookshelf-web.github.io/bookshelf-frontend/
  base: '/bookshelf-frontend/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    // Vite 7 blocks unknown hosts by default. In Docker, Chromium reaches the
    // dev server via the "frontend" hostname, which must be allow-listed.
    allowedHosts: ['frontend', 'localhost'],
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})