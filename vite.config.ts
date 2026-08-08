import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Route /api/* → http://127.0.0.1:8787/api/* (Local Wrangler Worker)
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      // Route /nvidia-proxy/* → https://integrate.api.nvidia.com/v1/*
      // This bypasses browser CORS — Vite dev server acts as the intermediary
      '/nvidia-proxy': {
        target: 'https://integrate.api.nvidia.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nvidia-proxy/, '/v1'),
        secure: true,
      },
    },
  },
})
