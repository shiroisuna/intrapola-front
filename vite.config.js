import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // loadEnv lee .env / .env.production (vite.config no los carga solo en process.env)
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };

  // Subcarpeta donde se publica, ej. VITE_BASE=/intrapola/  (siempre con / al inicio y al final)
  let base = env.VITE_BASE || '/';
  if (!base.startsWith('/')) base = `/${base}`;
  if (!base.endsWith('/')) base = `${base}/`;

  return {
    plugins: [react(), tailwindcss()],
    base,
    server: {
      port: 5173,
      proxy: {
        '/api': 'http://localhost:5200',
        '/uploads': 'http://localhost:5200',
      },
    },
  };
});
