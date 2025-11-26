import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config - modern tooling to build our 2006 masterpiece
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
