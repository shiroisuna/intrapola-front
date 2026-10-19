import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Si se publica en una subcarpeta del IIS/servidor (ej. /intrapola/), definir VITE_BASE=/intrapola/
  base: process.env.VITE_BASE || '/',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5200',
      '/uploads': 'http://localhost:5200',
    },
  },
});
