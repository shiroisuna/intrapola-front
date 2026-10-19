import { useCallback, useState } from 'react';
import { api } from '../api/client.js';

/** Búsqueda de trabajador por cédula, compartida por todos los formularios. */
export function useEmpleado() {
  const [cedula, setCedulaRaw] = useState('');
  const [empleado, setEmpleado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');

  const setCedula = useCallback((v) => {
    setCedulaRaw(v.replace(/\D/g, '').slice(0, 10));
    setEmpleado(null);
    setError('');
  }, []);

  const buscar = useCallback(async () => {
    if (cedula.length < 5) {
      setError('Escriba la cédula completa, solo números');
      return null;
    }
    setBuscando(true);
    setError('');
    try {
      const e = await api.get(`/empleados/${cedula}`);
      setEmpleado(e);
      return e;
    } catch (err) {
      setEmpleado(null);
      setError(err.message);
      return null;
    } finally {
      setBuscando(false);
    }
  }, [cedula]);

  const reiniciar = useCallback(() => { setCedulaRaw(''); setEmpleado(null); setError(''); }, []);

  return { cedula, setCedula, empleado, buscando, error, buscar, reiniciar };
}
