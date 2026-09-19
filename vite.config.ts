/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // GitHub Pages serves the app at https://bookshelf-web.github.io/bookshelf-frontend/.
  // Everywhere else (dev, Docker, E2E suites) it is served from the root.
  base: process.env.GITHUB_PAGES === 'true' ? '/bookshelf-frontend/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/@types/**',
        'src/components/ui/**',
      ],
      reporter: ['text-summary', 'text', 'lcov'],
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