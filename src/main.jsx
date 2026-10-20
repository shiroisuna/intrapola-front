import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { api } from './api/client.js';
import { aplicarTema, recordarTema, temaGuardado } from './utils/tema.js';

// Colores elegidos en el panel: primero los últimos conocidos (sin parpadeo), luego los del servidor
const previo = temaGuardado();
if (previo) aplicarTema(previo);
api.get('/tema').then((t) => recordarTema(aplicarTema(t))).catch(() => {});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
