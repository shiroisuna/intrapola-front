import { Receipt, PackageOpen, Boxes, ShieldPlus, Wrench, Factory, Truck } from 'lucide-react';

/** Formatos de la Intrapola. "disponible: false" muestra la tarjeta como "Próximamente". */
export const FORMATOS = [
  { slug: 'relacion-gastos', titulo: 'Relación de gastos', descripcion: 'Registra los gastos de un anticipo y calcula el saldo a favor de la empresa o del trabajador.', grupo: 'Administración', icono: Receipt, disponible: true },
  { slug: 'reembolso-seguro', titulo: 'Planilla de reembolso de seguro', descripcion: 'Formato de Banesco Seguros (HCM) para solicitar reembolsos. Ábrelo o descárgalo para llenarlo.', grupo: 'Administración', icono: ShieldPlus, disponible: true },
  { slug: 'salida-materiales', titulo: 'Salida de materiales y equipos', descripcion: 'Autorización para retirar materiales o equipos de la planta, con o sin retorno.', grupo: 'Operaciones', icono: PackageOpen, disponible: true },
  { slug: 'materiales-sap', titulo: 'Creación, modificación o desincorporación de material SAP', descripcion: 'Solicita el alta, cambio o baja de un material en SAP con sus datos de planificación.', grupo: 'Operaciones', icono: Boxes, disponible: true },
  { slug: 'evaluacion-servicios', titulo: 'Evaluación de proveedores de servicios', descripcion: 'FO-CO-004 · Encuesta por indicadores: calidad, tiempos, cantidad y postventa.', grupo: 'Evaluación de proveedores', icono: Wrench, disponible: true },
  { slug: 'evaluacion-mpme', titulo: 'Evaluación de proveedores MP / ME / MI / C', descripcion: 'FO-CO-003 · Materia prima, material de empaque, insumos y consumibles.', grupo: 'Evaluación de proveedores', icono: Factory, disponible: true },
  { slug: 'evaluacion-transporte', titulo: 'Evaluación de proveedores de transporte (PT)', descripcion: 'Traslado y descarga de producto terminado, tiempos, comunicación y reclamos. Una evaluación por proveedor al mes.', grupo: 'Evaluación de proveedores', icono: Truck, disponible: true },
];

export const GRUPOS_FORMATOS = ['Administración', 'Operaciones', 'Evaluación de proveedores'];
