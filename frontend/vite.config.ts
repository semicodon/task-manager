
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      // Any request the browser makes to http://localhost:5173/api/*
      // will be silently forwarded to http://localhost:8000/api/*
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true, // Rewrites the Host header. Django sees requests as if they came in locally.
      },
    },
  },
})
