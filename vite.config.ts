import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    /* Keeps the browser same-origin in development, so the session cookie
       behaves as it will in production. Without this the API is cross-origin
       and needs SameSite=None to work at all. */
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: false,
      },
    },
  },
})
