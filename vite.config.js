import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Toutes les requêtes /api/* seront redirigées sur le port 5000
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Et idem pour /uploads/* (tes images)
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    // 👇 Cette ligne résout ton problème de "page introuvable" :
    historyApiFallback: true,
  },
})
