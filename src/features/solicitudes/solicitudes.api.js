import { api } from '../../api/client.js';

export const solicitudesApi = {
  permiso: (d) => api.post('/solicitudes/permisos', d),
  rrhh: (d) => api.post('/solicitudes/rrhh', d),
  papeleria: (d) => api.post('/solicitudes/papeleria', d),
  insumos: (d) => api.post('/solicitudes/insumos', d),
  desarrollo: (d) => api.post('/solicitudes/desarrollos', d),
  soporte: (formData) => api.post('/solicitudes/soporte', formData),
  usuarios: (d) => api.post('/solicitudes/usuarios', d),
  vacaciones: (d) => api.post('/solicitudes/vacaciones', d),
  mias: (cedula) => api.get(`/solicitudes?cedula=${cedula}&limite=30`),
  detalle: (id) => api.get(`/solicitudes/${id}`),
};
