import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.vitest.{js,jsx}']
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return;
          if (/node_modules\/(recharts|d3-[^/]+|victory-vendor|internmap|decimal\.js-light)\//.test(id)) return 'vendor-charts';
          if (/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) return 'vendor-motion';
          if (/node_modules\/(react|react-dom|react-router-dom|scheduler)\//.test(id)) return 'vendor-react';
          if (/node_modules\/lucide-react\//.test(id)) return 'vendor-icons';
        }
      }
    }
  }
})
