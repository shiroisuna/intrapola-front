import { useCallback, useState } from 'react';

const CLAVE = 'intrapola:comunicados-leidos';

function cargar() {
  try { return new Set(JSON.parse(localStorage.getItem(CLAVE) || '[]')); } catch { return new Set(); }
}

/** Recuerda, en este navegador, qué comunicados ya se abrieron. */
export function useLeidos() {
  const [leidos, setLeidos] = useState(cargar);

  const marcar = useCallback((id) => {
    setLeidos((prev) => {
      if (prev.has(id)) return prev;
      const nuevo = new Set(prev).add(id);
      try { localStorage.setItem(CLAVE, JSON.stringify([...nuevo].slice(-200))); } catch { /* sin almacenamiento */ }
      return nuevo;
    });
  }, []);

  return { esLeido: (id) => leidos.has(id), marcar };
}
