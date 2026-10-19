/** Normaliza para comparar sin tildes ni mayúsculas. */
export const normalizar = (s = '') => s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
