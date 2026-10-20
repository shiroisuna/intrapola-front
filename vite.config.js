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
      port: Number(env.DEV_PORT || 5173),
      proxy: {
        '/api': 'http://localhost:5200',
        '/uploads': 'http://localhost:5200',
      },
    },
    // npm run preview: sirve el build ya compilado. En el servidor se define el puerto en .env.production
    // (PREVIEW_PORT=8080) y PREVIEW_HOST=true para que se pueda abrir desde otros equipos por IP.
    preview: {
      port: Number(env.PREVIEW_PORT || 4173),
      strictPort: true, // si el puerto está ocupado, falla en vez de cambiar de puerto sin avisar
      host: env.PREVIEW_HOST === 'true' ? true : (env.PREVIEW_HOST || undefined),
    },
  };
});
