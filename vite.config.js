  //import { defineConfig } from 'vite';
  //import react from '@vitejs/plugin-react';
  //import tailwindcss from '@tailwindcss/vite';

  /*export default defineConfig({
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
  });*/


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/intrapola/',
  server: {
    port: 8080,
    strictPort: true,   // si el 8080 está ocupado, falla en vez de cambiar de puerto sin avisar
    // host: true,      // descomenta si otros equipos de la red deben abrirlo por IP
  },
  preview: {
    port: 8080,         // para `npm run preview` (el build ya compilado)
    strictPort: true,
  },
})
