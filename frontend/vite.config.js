import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 Vite plugin — no tailwind.config.js needed
  ],
  server: {
    proxy: {
      // Forward /api requests to the backend so we don't hit CORS errors
      '/api': 'http://localhost:3001',
    },
  },
})
