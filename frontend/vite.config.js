import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        proxyTimeout: 120000,
        timeout: 120000,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Portfolio static hosting — serves /p/:slug from backend
      '/p': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Socket.IO WebSocket proxy — must be here so the WS handshake
      // reaches the backend (port 5000) from the Vite dev server (port 5173)
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,            // upgrade HTTP → WebSocket
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          forms: ['react-hook-form'],
          icons: ['react-icons'],
        },
      },
    },
  },
});
