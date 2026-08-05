import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://127.0.0.1:8000',
      '/profiles': 'http://127.0.0.1:8000',
      '/recommendations': 'http://127.0.0.1:8000',
      '/intelligence': 'http://127.0.0.1:8000',
      '/notifications': 'http://127.0.0.1:8000',
      '/ai': 'http://127.0.0.1:8000',
    }
  }
})
