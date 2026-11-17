import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `npm run build` → dist/, served by Express. For hot reload, run the API
// (`node server/index.js`) and `npx vite` side by side; /api is proxied.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: { '/api': 'http://127.0.0.1:3000' },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: { manualChunks: { charts: ['recharts'], vendor: ['react', 'react-dom', 'react-router-dom'] } },
    },
  },
});
