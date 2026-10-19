import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

/** Carga un recurso GET. Si path es null no hace nada (útil para cargas condicionales). */
export function useApi(path, { token } = {}) {
  const [estado, setEstado] = useState({ data: null, loading: Boolean(path), error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!path) return undefined;
    let vigente = true;
    setEstado((s) => ({ ...s, loading: true, error: null }));
    api.get(path, { token })
      .then((data) => vigente && setEstado({ data, loading: false, error: null }))
      .catch((error) => vigente && setEstado({ data: null, loading: false, error }));
    return () => { vigente = false; };
  }, [path, token, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  return { ...estado, recargar };
}
