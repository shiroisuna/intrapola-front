import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api, subir } from '../../api/client.js';

/*
 * Sesión del panel: el token vive en sessionStorage (se cierra al cerrar la pestaña).
 * Todas las llamadas del panel pasan por useAdmin(), que cierra la sesión si la API responde 401.
 */
const CLAVE = 'intrapola-admin';

const leer = () => {
  try {
    const s = JSON.parse(sessionStorage.getItem(CLAVE));
    return s && new Date(s.expira) > new Date() ? s : null;
  } catch { return null; }
};
const escribir = (s) => {
  try { if (s) sessionStorage.setItem(CLAVE, JSON.stringify(s)); else sessionStorage.removeItem(CLAVE); } catch { /* sin almacenamiento */ }
};

export const AdminContexto = createContext(null);

export function useSesionAdmin() {
  const [sesion, setSesion] = useState(leer);
  const entrar = useCallback(async (usuario, clave) => {
    const s = await api.post('/admin/sesion', { usuario, clave });
    escribir(s);
    setSesion(s);
  }, []);
  const salir = useCallback(() => { escribir(null); setSesion(null); }, []);
  return { sesion, entrar, salir };
}

/** Llamadas a /api/admin con el token; un 401 cierra la sesión. */
export function useAdmin() {
  const ctx = useContext(AdminContexto);
  const { sesion, salir } = ctx;
  return useMemo(() => {
    const opciones = { token: sesion?.token };
    const vigilar = (p) => p.catch((err) => {
      if (err.status === 401) salir();
      throw err;
    });
    return {
      usuario: sesion?.usuario,
      salir,
      get: (p) => vigilar(api.get(`/admin${p}`, opciones)),
      post: (p, b) => vigilar(api.post(`/admin${p}`, b, opciones)),
      patch: (p, b) => vigilar(api.patch(`/admin${p}`, b, opciones)),
      put: (p, b) => vigilar(api.put(`/admin${p}`, b, opciones)),
      del: (p) => vigilar(api.del(`/admin${p}`, opciones)),
      subir: (metodo, p, form, onProgreso) => vigilar(subir(metodo, `/admin${p}`, form, { ...opciones, onProgreso })),
    };
  }, [sesion, salir]);
}
