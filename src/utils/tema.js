/*
 * Colores de la Intrapola. Desde el panel se eligen tres; aquí se calculan los tonos que usa Tailwind
 * (--color-sage-*, --color-pine-*, --color-biscuit-*) y se aplican sobre :root sin recompilar.
 */
import { aplicarFuente } from './fuentes.js';

export const TEMA_POR_DEFECTO = { marca: '#bcdbc2', accion: '#1f4a33', acento: '#d99a3a' };
export const FUENTES_POR_DEFECTO = { fuenteTitulos: 'bricolage', fuenteTexto: 'atkinson' };
const CLAVE = 'intrapola-tema';

const aRgb = (hex) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const aHex = (rgb) => `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;
/** Mezcla a con b: t = 0 → a, t = 1 → b. */
export const mezclar = (a, b, t) => {
  const x = aRgb(a);
  const y = aRgb(b);
  return aHex(x.map((v, i) => v + (y[i] - v) * t));
};

/** Contraste WCAG entre dos colores (1 a 21). */
export function contraste(a, b) {
  const lum = (hex) => {
    const [r, g, bl] = aRgb(hex).map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [l1, l2] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Todos los tonos a partir de los tres colores base. */
export function paleta({ marca, accion, acento }) {
  return {
    sage: marca,
    'sage-50': mezclar(marca, '#ffffff', 0.78),
    'sage-100': mezclar(marca, '#ffffff', 0.58),
    'sage-200': mezclar(marca, '#ffffff', 0.32),
    'sage-400': mezclar(marca, accion, 0.25),
    pine: accion,
    'pine-600': mezclar(accion, marca, 0.12),
    'pine-800': mezclar(accion, '#000000', 0.3),
    paper: mezclar(marca, '#ffffff', 0.88),
    line: mezclar(mezclar(marca, '#ffffff', 0.45), '#d9dcda', 0.35),
    biscuit: acento,
    'biscuit-100': mezclar(acento, '#ffffff', 0.8),
  };
}

/** Avisos de legibilidad para el panel (texto sobre fondo). */
export function revisarContraste(t) {
  const p = paleta(t);
  const avisos = [];
  if (contraste('#ffffff', p.pine) < 4.5) avisos.push('El texto blanco de los botones casi no se lee sobre el color de acción. Use un tono más oscuro.');
  if (contraste(p['pine-800'], p.sage) < 4.5) avisos.push('El texto del menú se lee con dificultad sobre el color de marca. Use una marca más clara o una acción más oscura.');
  if (contraste(p.pine, '#ffffff') < 4.5) avisos.push('Los enlaces y títulos en color de acción se leen con dificultad sobre blanco.');
  return avisos;
}

export function aplicarTema(t) {
  const valido = (c) => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
  const tema = {
    marca: valido(t?.marca) ? t.marca : TEMA_POR_DEFECTO.marca,
    accion: valido(t?.accion) ? t.accion : TEMA_POR_DEFECTO.accion,
    acento: valido(t?.acento) ? t.acento : TEMA_POR_DEFECTO.acento,
  };
  const raiz = document.documentElement.style;
  const esOriginal = Object.keys(TEMA_POR_DEFECTO).every((k) => tema[k].toLowerCase() === TEMA_POR_DEFECTO[k]);
  for (const [nombre, valor] of Object.entries(paleta(tema))) {
    // Con los colores originales se dejan los tonos afinados a mano en index.css
    if (esOriginal) raiz.removeProperty(`--color-${nombre}`);
    else raiz.setProperty(`--color-${nombre}`, valor);
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema.marca);
  tema.fuenteTitulos = t?.fuenteTitulos || FUENTES_POR_DEFECTO.fuenteTitulos;
  tema.fuenteTexto = t?.fuenteTexto || FUENTES_POR_DEFECTO.fuenteTexto;
  aplicarFuente('--font-display', tema.fuenteTitulos, FUENTES_POR_DEFECTO.fuenteTitulos);
  aplicarFuente('--font-sans', tema.fuenteTexto, FUENTES_POR_DEFECTO.fuenteTexto);
  return tema;
}

/** Último tema conocido (para pintar sin parpadeo antes de que responda la API). */
export function temaGuardado() {
  try { return JSON.parse(localStorage.getItem(CLAVE)); } catch { return null; }
}
export function recordarTema(t) {
  try { localStorage.setItem(CLAVE, JSON.stringify({ marca: t.marca, accion: t.accion, acento: t.acento, fuenteTitulos: t.fuenteTitulos, fuenteTexto: t.fuenteTexto })); } catch { /* sin almacenamiento */ }
}
