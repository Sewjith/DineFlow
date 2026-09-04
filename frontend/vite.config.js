import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server proxies /api to the gateway so the browser talks to a single origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Live order updates: forward the Socket.IO handshake + websocket to order-service.
      '/socket.io': {
        target: 'http://localhost:9092',
        changeOrigin: true,
        ws: true,
      },
      // Live reservation updates: separate Socket.IO server on reservation-service.
      '/rsocket.io': {
        target: 'http://localhost:9093',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
