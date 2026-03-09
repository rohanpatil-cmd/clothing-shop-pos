import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 4500,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:4000'
    }
  },
});
