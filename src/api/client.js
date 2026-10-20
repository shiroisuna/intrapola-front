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
  patch: (path, body, opciones) => request('PATCH', path, body, opciones),
  put: (path, body, opciones) => request('PUT', path, body, opciones),
  del: (path, opciones) => request('DELETE', path, undefined, opciones),
};

/**
 * Subida de archivos con progreso (fetch no informa el avance). onProgreso recibe 0..1.
 * Devuelve la respuesta JSON igual que api.post.
 */
export function subir(method, path, formData, { token, onProgreso } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${BASE}${path}`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgreso?.(e.loaded / e.total);
    xhr.onerror = () => reject(new ApiError(0, 'No hay conexión con el servidor de Intrapola. Verifique la red e intente de nuevo.'));
    xhr.onload = () => {
      let data = null;
      try { data = xhr.responseText ? JSON.parse(xhr.responseText) : null; } catch { /* respuesta sin JSON */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new ApiError(xhr.status, data?.error || `Error ${xhr.status}`, data?.detalles));
    };
    xhr.send(formData);
  });
}

/** URL absoluta para archivos servidos por el backend (/uploads/...). */
export const archivoUrl = (ruta) => {
  if (!ruta || /^https?:\/\//.test(ruta) || ruta === '#') return ruta;
  if (ruta.startsWith('/api/')) return `${BASE}${ruta.slice(4)}`;
  // VITE_API_URL = http://servidor:5200/api (o .../intrapola/api) → los archivos están al lado: .../uploads/...
  if (import.meta.env.VITE_API_URL) return `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')}${ruta}`;
  // Misma app publicada en subcarpeta (ej. /intrapola/uploads/...)
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}${ruta}`;
};

/** URL absoluta de un recurso de la API (ej. un PDF), respetando VITE_API_URL o el proxy de Vite. */
export const apiUrl = (ruta) => {
  if (!ruta) return ruta;
  const relativa = ruta.startsWith('/api/') ? ruta.slice(4) : ruta;
  return `${BASE}${relativa}`;
};
