import {
  House, Megaphone, ClipboardList, FileText, FolderOpen, CalendarDays, Tags, Phone, Cake, Building2,
  Clock, Package, Sun, HandCoins, Users, Code, LifeBuoy, Printer, UserCog,
} from 'lucide-react';

export const NAVEGACION = [
  { to: '/', texto: 'Inicio', icono: House, fin: true },
  { to: '/comunicados', texto: 'Comunicados', icono: Megaphone },
  { to: '/solicitudes', texto: 'Solicitudes', icono: ClipboardList },
  { to: '/normas', texto: 'Normas', icono: FileText },
  { to: '/formatos', texto: 'Formatos', icono: FolderOpen },
  { to: '/eventos', texto: 'Eventos', icono: CalendarDays },
  { to: '/precios', texto: 'Lista de precios', icono: Tags },
  { to: '/directorio', texto: 'Directorio', icono: Phone },
  { to: '/cumpleanos', texto: 'Cumpleañeros', icono: Cake },
  { to: '/empresa', texto: 'La empresa', icono: Building2 },
];

/** Todas las solicitudes disponibles: alimenta el inicio, el panel y las rutas. */
export const SOLICITUDES = [
  { slug: 'permiso', titulo: 'Permiso', descripcion: 'Ausencias por horas o días: citas médicas, trámites, diligencias.', area: 'Recursos Humanos', icono: Clock },
  { slug: 'vacaciones', titulo: 'Vacaciones', descripcion: 'Calcula tus días y tu fecha de reintegro, y emite la hoja para firmar.', area: 'Recursos Humanos', icono: Sun },
  { slug: 'anticipo', titulo: 'Anticipo de prestaciones', descripcion: 'Consulta tu saldo disponible y solicita un anticipo (del 1 al 10 de cada mes).', area: 'Recursos Humanos', icono: HandCoins },
  { slug: 'rrhh', titulo: 'Recursos Humanos', descripcion: 'Constancias, TodoTicket, transporte, fideicomiso, reclamos y sugerencias.', area: 'Recursos Humanos', icono: Users },
  { slug: 'papeleria', titulo: 'Papelería', descripcion: 'Material de oficina para tu departamento.', area: 'Servicios', icono: Package },
  { slug: 'soporte', titulo: 'Soporte de sistemas', descripcion: 'Reporta una falla de equipo, impresora, red, correo o SAP.', area: 'Sistemas', icono: LifeBuoy },
  { slug: 'desarrollo', titulo: 'Desarrollo de aplicaciones', descripcion: 'Pide un sistema nuevo, un reporte o un cambio a uno existente.', area: 'Sistemas', icono: Code },
  { slug: 'insumos', titulo: 'Insumos de sistemas', descripcion: 'Tóner, mouse, teclados, cables y otros consumibles.', area: 'Sistemas', icono: Printer },
  { slug: 'usuarios', titulo: 'Usuario nuevo', descripcion: 'Para jefes de área: crear el usuario de una persona nueva con correo, SAP, SPI y demás accesos.', area: 'Sistemas', icono: UserCog },
];
