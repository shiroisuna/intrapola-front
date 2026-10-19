import { api } from '../../../api/client.js';

const R = '/solicitudes/anticipos';

export const anticipoApi = {
  estado: () => api.get(`${R}/estado`),
  datosRegistro: (cedula) => api.get(`${R}/registro/${cedula}`),
  registrar: (d) => api.post(`${R}/registro`, d),
  ingresar: (d) => api.post(`${R}/sesion`, d),
  panel: (token) => api.get(`${R}/panel`, { token }),
  planilla: (token) => api.blob(`${R}/planilla.pdf`, { token }),
  solicitar: (token, monto) => api.post(R, { monto }, { token }),
};
