const BASE = (import.meta.env.VITE_API_URL || `${import.meta.env.BASE_URL}api`).replace(/\/$/, '');
const USAR_DEMO = import.meta.env.VITE_MOCK === 'true';

export class ApiError extends Error {
  constructor(status, message, detalles) {
    super(message);
    this.status = status;
    this.detalles = detalles || [];
  }
  /** Errores por campo: { cedula: 'Cédula inválida', ... } */
  get porCampo() {
    return Object.fromEntries(this.detalles.map((d) => [d.campo, d.mensaje]));
  }
}

async function request(method, path, body, { token, blob = false } = {}) {
  if (USAR_DEMO) {
    const { mockRequest } = await import('./mock.js');
    return mockRequest(method, path, body);
  }

  const esForm = body instanceof FormData;
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body && !esForm && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? (esForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError(0, 'No hay conexión con el servidor de Intrapola. Verifique la red e intente de nuevo.');
  }

  if (blob && res.ok) return res.blob();
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error || `Error ${res.status}`, data?.detalles);
  return data;
}

export const api = {
  get: (path, opciones) => request('GET', path, undefined, opciones),
  post: (path, body, opciones) => request('POST', path, body, opciones),
  /** Descarga binaria (PDF) con sesión: devuelve un Blob. */
  blob: (path, opciones) => request('GET', path, undefined, { ...opciones, blob: true }),
  patch: (path, body) => request('PATCH', path, body),
};

/** URL absoluta para archivos servidos por el backend (/uploads/...). */
export const archivoUrl = (ruta) => {
  if (!ruta || /^https?:\/\//.test(ruta) || ruta === '#') return ruta;
  const origen = import.meta.env.VITE_API_URL ? new URL(import.meta.env.VITE_API_URL).origin : '';
  return `${origen}${ruta}`;
};

/** URL absoluta de un recurso de la API (ej. un PDF), respetando VITE_API_URL o el proxy de Vite. */
export const apiUrl = (ruta) => {
  if (!ruta) return ruta;
  const relativa = ruta.startsWith('/api/') ? ruta.slice(4) : ruta;
  return `${BASE}${relativa}`;
};
