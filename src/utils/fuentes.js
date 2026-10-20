/*
 * Fuentes que se pueden elegir en Apariencia. Vienen dentro de la app (paquetes @fontsource),
 * así que funcionan sin internet. Cada una se descarga solo cuando se usa.
 * Los id deben coincidir con FUENTES de backend/src/modules/tema/tema.service.js.
 */
export const FUENTES = [
  { id: 'bricolage', nombre: 'Bricolage Grotesque', familia: "'Bricolage Grotesque Variable'", estilo: 'Moderna con carácter (títulos actuales)', cargar: () => Promise.resolve() },
  { id: 'atkinson', nombre: 'Atkinson Hyperlegible', familia: "'Atkinson Hyperlegible'", estilo: 'Máxima legibilidad (texto actual)', cargar: () => Promise.resolve() },
  { id: 'inter', nombre: 'Inter', familia: "'Inter Variable'", estilo: 'Neutra y limpia', cargar: () => import('@fontsource-variable/inter') },
  { id: 'montserrat', nombre: 'Montserrat', familia: "'Montserrat Variable'", estilo: 'Geométrica, ideal para títulos', cargar: () => import('@fontsource-variable/montserrat') },
  { id: 'nunito', nombre: 'Nunito', familia: "'Nunito Variable'", estilo: 'Redondeada y amable', cargar: () => import('@fontsource-variable/nunito') },
  { id: 'lora', nombre: 'Lora', familia: "'Lora Variable'", estilo: 'Con serifa, elegante', cargar: () => import('@fontsource-variable/lora') },
  { id: 'merriweather', nombre: 'Merriweather', familia: "'Merriweather Variable'", estilo: 'Con serifa, clásica', cargar: () => import('@fontsource-variable/merriweather') },
  { id: 'source-sans', nombre: 'Source Sans 3', familia: "'Source Sans 3 Variable'", estilo: 'Sobria, para mucho texto', cargar: () => import('@fontsource-variable/source-sans-3') },
  { id: 'open-sans', nombre: 'Open Sans', familia: "'Open Sans Variable'", estilo: 'Clásica de la web', cargar: () => import('@fontsource-variable/open-sans') },
  { id: 'roboto', nombre: 'Roboto', familia: "'Roboto Variable'", estilo: 'La de Android y Google', cargar: () => import('@fontsource-variable/roboto') },
  { id: 'sistema', nombre: 'Fuente de Windows', familia: "'Segoe UI'", estilo: 'La del sistema (Segoe UI)', cargar: () => Promise.resolve() },
];

const RESPALDO = ', system-ui, sans-serif';
export const fuente = (id) => FUENTES.find((f) => f.id === id);

/** Carga (si hace falta) y aplica una fuente a una variable de Tailwind (--font-display o --font-sans). */
export async function aplicarFuente(variable, id, porDefecto) {
  const f = fuente(id) ?? fuente(porDefecto);
  const raiz = document.documentElement.style;
  if (f.id === porDefecto) { raiz.removeProperty(variable); return; }
  try { await f.cargar(); } catch { /* si no carga, queda la de respaldo */ }
  raiz.setProperty(variable, `${f.familia}${RESPALDO}`);
}

/** Para las vistas previas del panel: carga la fuente y devuelve su font-family. */
export async function familiaDe(id) {
  const f = fuente(id);
  if (!f) return undefined;
  try { await f.cargar(); } catch { /* respaldo */ }
  return `${f.familia}${RESPALDO}`;
}
