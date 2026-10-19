const ZONA = 'America/Caracas';

export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Fechas tipo 'YYYY-MM-DD' se interpretan como día local (evita el desfase por zona horaria). */
const aFecha = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.slice(0, 10)) && v.length <= 10 ? new Date(`${v}T12:00`) : new Date(v));

export const fechaLarga = (v) =>
  aFecha(v).toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONA });

export const fechaCorta = (v) =>
  aFecha(v.length > 10 ? v.slice(0, 10) : v).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', timeZone: ZONA }).replace('.', '');

export const fechaHora = (v) =>
  new Date(v).toLocaleString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: ZONA });

export const hoyISO = () => new Date().toLocaleDateString('en-CA', { timeZone: ZONA });

export function saludo() {
  const h = Number(new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: ZONA }));
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
