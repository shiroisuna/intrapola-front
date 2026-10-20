/* Datos de demostración (VITE_MOCK=true). Nombres ficticios: solo para revisar
   la interfaz sin conectarse a SQL Server. */
import { ApiError } from './client.js';

const hoy = new Date();
const mesActual = hoy.getMonth() + 1;

const empleados = {
  12345678: { cedula: '12345678', nombreCompleto: 'Ana Rodríguez', departamento: 'Administración', departamentoId: 1, cargo: 'Analista' },
  23456789: { cedula: '23456789', nombreCompleto: 'Carlos Méndez', departamento: 'Producción', departamentoId: 9, cargo: 'Supervisor' },
};

const deptos = ['Administración', 'Compras', 'Control de Calidad', 'Mantenimiento', 'Producción', 'RRHH', 'Seguridad', 'Sistemas', 'Ventas'];
const nombres = ['Ana Rodríguez', 'Luis Pérez', 'María Gómez', 'José Torres', 'Carla Ruiz', 'Pedro Díaz', 'Laura Silva', 'Andrés Rojas', 'Elena Castro', 'Miguel Herrera', 'Sofía Vargas', 'Daniel Ortiz'];

// Banners de muestra generados en SVG (en producción son las imágenes que se suben)
const bannerSvg = (titulo, sub, fondo, texto) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="700"><rect width="1600" height="700" fill="${fondo}"/>` +
  `<circle cx="1380" cy="120" r="260" fill="${texto}" opacity=".08"/><circle cx="1250" cy="640" r="180" fill="${texto}" opacity=".06"/>` +
  `<text x="120" y="330" font-family="Georgia,serif" font-size="96" font-weight="700" fill="${texto}">${titulo}</text>` +
  `<text x="124" y="420" font-family="Arial,sans-serif" font-size="40" fill="${texto}" opacity=".8">${sub}</text></svg>`);

const comunicados = [
  { id: 1016, titulo: 'Comunicado', prioridad: 'NORMAL', destacado: true, publicadoEn: null, contenido: null,
    imagenUrl: bannerSvg('Nuevo sabor cítrico', 'Comunicado de solo imagen, como los actuales', '#bcdbc2', '#163626'), textoAlternativo: 'sabor citrico' },
  { id: 31, titulo: 'Auditoría ISO 9001 el 28 de octubre', resumen: 'Fondonorma visitará la planta. Mantén tu área y registros al día.', prioridad: 'URGENTE', publicadoEn: '2026-10-14T08:00:00',
    contenido: 'El martes 28 de octubre recibiremos la auditoría de seguimiento de Fondonorma para la certificación ISO 9001.\n\nCada departamento debe tener sus registros del SGC actualizados en el SGD antes del viernes 24. Los jefes de área recibirán la agenda por correo.\n\nGracias por su colaboración.' },
  { id: 30, titulo: 'Nuevo horario del comedor', resumen: 'A partir del lunes el segundo turno de almuerzo comienza a la 1:00 p. m.', prioridad: 'NORMAL', publicadoEn: '2026-10-10T10:30:00',
    contenido: 'A partir del lunes 20 de octubre el comedor atenderá en dos turnos:\n\nPrimer turno: 12:00 m. a 12:45 p. m.\nSegundo turno: 1:00 p. m. a 1:45 p. m.\n\nConsulte con su supervisor el turno asignado.' },
  { id: 29, titulo: 'Mantenimiento de la red el sábado', resumen: 'El correo y SAP no estarán disponibles de 8:00 a 12:00.', prioridad: 'NORMAL', publicadoEn: '2026-10-06T15:00:00',
    contenido: 'El departamento de Sistemas realizará mantenimiento a la red el sábado 18 de octubre de 8:00 a. m. a 12:00 m. Durante ese tiempo el correo, SAP y la intranet no estarán disponibles.' },
];

const data = {
  '/contenido/comunicados?limite=50': comunicados,
  '/contenido/inicio': {
    comunicados,
    banners: [
      { id: 1, titulo: 'Política de la calidad', imagenUrl: bannerSvg('Política de la calidad', 'Calidad e inocuidad en cada galleta', '#1f4a33', '#e2efe5') },
      { id: 2, titulo: 'Semana de la seguridad industrial', imagenUrl: bannerSvg('Semana de la seguridad', 'Del 20 al 24 de octubre · charlas en el comedor', '#bcdbc2', '#163626') },
      { id: 3, titulo: 'Nuevos sabores Tip-Top', imagenUrl: bannerSvg('Nuevos sabores Tip-Top', 'Limón, coco y chocolate', '#d99a3a', '#3f2808') },
    ],
    productos: [
      { id: 1, marca: 'Charmy', nombre: 'Galletas Charmy', presentacion: 'Empaque familiar tubular, 192 g' },
      { id: 2, marca: 'Charmy', nombre: 'Charmy flowpack', presentacion: '8 paquetes de 2 galletas de 16 g' },
      { id: 3, marca: 'Tip-Top', nombre: 'Tip-Top sabores', presentacion: 'Empaque familiar tubular, 80 g' },
      { id: 4, marca: 'Tip-Top', nombre: 'Tip-Top estuche', presentacion: '18 paquetes de 2 galletas de 12 g' },
    ],
    enlaces: [
      { id: 1, titulo: 'SAT', descripcion: 'Sistema de atención al trabajador', url: '#' },
      { id: 2, titulo: 'Academia Mary', descripcion: 'Formación interna', url: '#' },
      { id: 3, titulo: 'SGD', descripcion: 'Sistema de gestión de documentos', url: '#' },
    ],
    empresa: {
      nombre: 'Industrias Amapola C.A.', rif: 'J-00180812-4',
      mision: 'Somos una empresa que desarrolla y elabora alimentos reconocidos por su calidad y accesibilidad, sustentados en innovación, esfuerzo y profesionalismo, que contribuye al bienestar de sus trabajadores y la familia venezolana.',
      vision: 'Ser líderes del mercado en los productos que elaboramos, con un incremento sostenido del volumen de ventas, conservando la cultura familiar de nuestra empresa.',
      valores: ['Respeto', 'Trabajo en equipo', 'Perseverancia', 'Calidad', 'Honestidad', 'Confianza'],
      direccion: 'Carretera Charallave - Cúa, Zona Industrial Río Tuy, Avenida G, Parcelas 77 y 78, Charallave, Edo. Miranda',
      telefono: '0239-5001600', fax: '0239-5001614', correo: 'contacto@industriasamapola.com',
      mapaUrl: 'https://www.google.com/maps?q=Zona+Industrial+Rio+Tuy+Charallave&output=embed',
    },
  },
  '/catalogos/tipos-solicitud?area=RRHH': [
    ['RRHH_INFORMACION', 'Información'], ['RRHH_RECLAMO', 'Reclamo'], ['RRHH_CONSTANCIA', 'Constancia de trabajo'],
    ['RRHH_ANTICIPO', 'Anticipo de prestaciones'], ['RRHH_TODOTICKET', 'Tarjeta TodoTicket'], ['RRHH_TRANSPORTE', 'Transporte'],
    ['RRHH_VACACIONES', 'Vacaciones'], ['RRHH_ACTUALIZACION', 'Actualización de datos'], ['RRHH_SUGERENCIA', 'Sugerencia'],
  ].map(([codigo, nombre], i) => ({
    id: i + 2, codigo, nombre, area: 'RRHH',
    formulario: { RRHH_VACACIONES: 'VACACIONES', RRHH_ANTICIPO: 'ANTICIPO' }[codigo] ?? 'GENERAL',
    ruta: { RRHH_VACACIONES: '/solicitudes/vacaciones', RRHH_ANTICIPO: '/solicitudes/anticipo' }[codigo] ?? null,
  })),
  '/catalogos/articulos?categoria=PAPELERIA': ['Bolígrafo azul', 'Carpeta marrón tamaño carta', 'Grapas estándar', 'Pega adhesiva en barra', 'Resma papel carta']
    .map((nombre, i) => ({ id: i + 1, nombre, unidad: nombre.startsWith('Resma') ? 'Resma' : 'Unidad' })),
  '/catalogos/articulos?categoria=INSUMO_SIST': ['Cable de red', 'Mouse USB', 'Teclado USB', 'Tóner impresora']
    .map((nombre, i) => ({ id: i + 10, nombre, unidad: 'Unidad' })),
  '/catalogos/tipos-soporte': ['Correo', 'Desarrollo de aplicaciones', 'Falla de equipo', 'Impresoras', 'Red e internet', 'SAP', 'Telefonía', 'Otro']
    .map((nombre, i) => ({ id: i + 1, nombre })),
  '/catalogos/accesos': [
    ...['Correo', 'Telefonía', 'Internet'].map((nombre, i) => ({ id: i + 1, grupo: 'COMUNICACION', nombre })),
    ...['SAP', 'SPI', 'SAT', 'SISLOG', 'SGD', 'SCP', 'VISITAPOLA', 'CPE'].map((nombre, i) => ({ id: i + 4, grupo: 'SISTEMA', nombre })),
  ],
  '/directorio/extensiones': nombres.map((n, i) => ({
    departamento: deptos[i % deptos.length], nombre: n, extension: String(101 + i * 3),
    correo: `${n.split(' ')[0][0]}${n.split(' ')[1]}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + '@industriasamapola.com',
    esPersona: true,
  })).concat([{ departamento: 'Seguridad', nombre: 'Vigilancia', extension: '113', correo: null, esPersona: false }])
    .sort((a, b) => a.departamento.localeCompare(b.departamento)),
  '/directorio/emergencias': [
    { id: 1, nombre: 'Bomberos Charallave', servicio: 'Emergencias', telefono: '0239-0000000' },
    { id: 2, nombre: 'Protección Civil', servicio: 'Emergencias', telefono: '0239-0000001' },
  ],
  '/directorio/proveedores': [{ id: 3, nombre: 'Proveedor de internet', servicio: 'Conectividad', telefono: '0212-0000000' }],
  '/eventos?limite=30': [
    { id: 18, titulo: 'Hacienda Santa Teresa', imagenUrl: bannerSvg('Hacienda Santa Teresa', 'Galería de fotos', '#2a6044', '#e2efe5'), enlace: '#' },
    { id: 17, titulo: 'Viaje El Junquito 2018', imagenUrl: bannerSvg('El Junquito', 'Programa recreativo', '#bcdbc2', '#163626'), enlace: '#' },
    { id: 4, titulo: 'Plan Vacacional 3', imagenUrl: bannerSvg('Plan Vacacional', 'Galería de fotos', '#d99a3a', '#3f2808'), enlace: '#' },
  ],
  '/precios': [
    { codigo: 'CH-192', descripcion: 'Charmy vainilla tubular', marca: 'Charmy', presentacion: '192 g', precio: 1.85, moneda: 'USD' },
    { codigo: 'CH-FP16', descripcion: 'Charmy flowpack x8', marca: 'Charmy', presentacion: '8 x 16 g', precio: 2.4, moneda: 'USD' },
    { codigo: 'TT-080', descripcion: 'Tip-Top limón tubular', marca: 'Tip-Top', presentacion: '80 g', precio: 0.95, moneda: 'USD' },
    { codigo: 'TT-E18', descripcion: 'Tip-Top estuche x18', marca: 'Tip-Top', presentacion: '18 x 12 g', precio: 3.6, moneda: 'USD' },
  ],
  '/documentos/normas': ['Código de ética', 'Normas de ingreso a planta', 'Normas de disciplina', 'Normativa de recursos tecnológicos', 'Prohibiciones dentro de la planta', 'Política de seguridad y control de los sistemas de información']
    .map((titulo, i) => ({ id: i + 1, titulo, archivoUrl: '#', publicadoEn: '2026-03-01' })),
  '/documentos/formatos': ['Relación de gastos', 'Salidas de material y equipos', 'Creación, modificación o desincorporación de material SAP', 'Planilla de reembolso seguro HCM', 'Evaluación de proveedores de servicios', 'Evaluación de proveedores MP-ME', 'Evaluación de proveedores PT']
    .map((titulo, i) => ({ id: i + 1, titulo, archivoUrl: '#', publicadoEn: '2026-05-10' })),
};

function cumpleanos(mes) {
  const lista = nombres.map((n, i) => ({ nombres: n.split(' ')[0], apellidos: n.split(' ')[1], departamento: deptos[i % deptos.length], dia: ((i * 7 + mes) % 28) + 1 }));
  if (mes === mesActual) lista[0].dia = hoy.getDate();
  return { mes, cumpleaneros: lista.sort((a, b) => a.dia - b.dia) };
}

let siguiente = 887;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

export async function mockRequest(method, path, body) {
  await espera(250);
  if (method === 'GET') {
    const emp = path.match(/^\/empleados\/(\d+)$/);
    if (emp) {
      if (empleados[emp[1]]) return empleados[emp[1]];
      throw new ApiError(404, 'No hay un trabajador activo con esa cédula');
    }
    const cum = path.match(/^\/cumpleanos(?:\?mes=(\d+))?$/);
    if (cum) return cumpleanos(Number(cum[1] || mesActual));
    if (path === '/evaluaciones/servicios') {
      const pq = (pairs) => pairs.map(([texto, max]) => ({ texto, max }));
      const secciones = [
        ['Calidad del Servicio', pq([['Contó con la logística necesaria en cuanto a transporte, equipos y herramientas menores para cumplir con el objeto del contrato.', 15], ['Durante la ejecución del servicio contó con personal técnico calificado.', 20], ['El servicio se prestó de acuerdo a lo pactado.', 20], ['Se contó con los equipos y herramientas adecuados.', 5]])],
        ['Cumplimiento en los tiempos y Disponibilidad', pq([['Cuenta con la disposición para la ejecución del servicio.', 5], ['Cumplió con los tiempos pactados.', 5]])],
        ['Cumplimiento en Cantidad', pq([['Cumplió con la entrega de las cantidades y usos de los insumos.', 10]])],
        ['Servicio Durante y Postventa', pq([['Dio respuesta a los requerimientos o reclamos.', 10], ['La respuesta fue oportuna.', 10]])],
      ].map(([nombre, preguntas], i) => ({ id: i, nombre, preguntas: preguntas.map((p, j) => ({ ...p, id: `${i}.${j}` })) }));
      return {
        clave: 'servicios', titulo: 'Evaluación de proveedores de servicios', puntajeMaximo: 100, secciones,
        campos: [{ nombre: 'contrato', etiqueta: 'Contrato u orden N.º', tipo: 'texto', requerido: true }, { nombre: 'factura', etiqueta: 'Documento factura', tipo: 'texto' }, { nombre: 'descripcion', etiqueta: 'Tipo de servicio ejecutado', tipo: 'texto', requerido: true, ancho: 'completo' }],
        formato: { codigo: 'FO-CO-004', titulo: 'Criterios de evaluación de proveedores de servicios' },
        escala: [{ desde: 80, calificacion: 'Excelente', decision: 'Aceptado Sin Condicion' }, { desde: 60, calificacion: 'Bueno', decision: 'Aceptado con Condicion' }, { desde: 0, calificacion: 'Regular', decision: 'En Evaluacion' }],
      };
    }
    if (path === '/evaluaciones/mpme') {
      return {
        clave: 'mpme', titulo: 'Evaluación de proveedores MP / ME / MI / C', puntajeMaximo: 60,
        formato: { codigo: 'FO-CO-003', titulo: 'Criterios de evaluación de proveedores MP / ME / MI / C' },
        campos: [
          { nombre: 'tipoProveedor', etiqueta: 'Tipo de proveedor', tipo: 'select', requerido: true, opciones: ['Materia Prima', 'Material de Empaque', 'Material Indirecto', 'Consumible'] },
          { nombre: 'descripcion', etiqueta: 'Material suministrado', tipo: 'texto', requerido: true, ancho: 'doble' },
          { nombre: 'cantSuministrada', etiqueta: 'Cantidad suministrada', tipo: 'numero', requerido: true },
          { nombre: 'cantRechazada', etiqueta: 'Cantidad rechazada', tipo: 'numero', requerido: true, porDefecto: '0' },
          { nombre: 'lote', etiqueta: 'Lote Amapola', tipo: 'texto', requerido: true },
          { nombre: 'contrato', etiqueta: 'Contrato u orden N.º', tipo: 'texto', requerido: true },
          { nombre: 'factura', etiqueta: 'Documento factura / NE', tipo: 'texto', requerido: true },
        ],
        secciones: [{ id: 0, nombre: 'Calidad del Producto', preguntas: [['Cumplió con los documentos requeridos para la recepción de mercancía.', 10], ['Cumplió con las especificaciones técnicas y de funcionalidad requeridas.', 30], ['Los productos entregados estaban en buenas condiciones físicas.', 10], ['Los vehículos cumplen con las condiciones higiénicas requeridas.', 10]].map(([texto, max], j) => ({ id: `0.${j}`, texto, max })) }],
        escala: [{ desde: 80, calificacion: 'Excelente', decision: 'Aceptado Sin Condicion' }, { desde: 60, calificacion: 'Bueno', decision: 'Aceptado con Condicion' }, { desde: 0, calificacion: 'Regular', decision: 'En Evaluacion' }],
      };
    }
    if (path === '/evaluaciones/transporte') {
      const sec = [['Asegurabilidad del Traslado y Descarga del Producto', [['Cuenta con la unidad de transporte en óptimas condiciones.', 15], ['Contó con el personal ayudante / caletero.', 10]]],
        ['Tiempo de Entrega / Cumplimiento', [['No presentó retraso en la entrega.', 25]]], ['Comunicación Efectiva', [['Mantuvo una comunicación efectiva.', 25]]],
        ['Reclamos', [['El cliente no manifestó actitudes irrespetuosas.', 15], ['El cliente no manifestó mala manipulación del PT.', 10]]]];
      return {
        clave: 'transporte', titulo: 'Evaluación de proveedores de transporte (PT)', puntajeMaximo: 100, numeroAutomatico: true,
        formato: { codigo: 'FO-CO-004', titulo: 'Criterios de evaluación de proveedores de servicios — Transporte' },
        campos: [{ nombre: 'contrato', etiqueta: 'N.º de evaluación', tipo: 'auto', ayuda: 'Se genera con el código del proveedor y el mes' }, { nombre: 'correo', etiqueta: 'Correo del proveedor', tipo: 'email', ayuda: 'Le llegará el resultado de la evaluación' }],
        secciones: sec.map(([nombre, ps], i) => ({ id: i, nombre, preguntas: ps.map(([texto, max], j) => ({ id: `${i}.${j}`, texto, max })) })),
        escala: [{ desde: 80, calificacion: 'Excelente', decision: 'Aceptado Sin Condicion' }, { desde: 60, calificacion: 'Bueno', decision: 'Aceptado con Condicion' }, { desde: 0, calificacion: 'Regular', decision: 'En Evaluacion' }],
      };
    }
    if (path.startsWith('/evaluaciones/transporte/numero')) return { contrato: '00872610', existe: false };
    if (path.startsWith('/evaluaciones/proveedores')) return { rif: 'J-12345678-9', nombre: 'SERVICIOS INDUSTRIALES DEL CENTRO, C.A.', codigo: '100245' };
    if (path.startsWith('/evaluaciones/contratos')) return { existe: false };
    if (path === '/formatos/materiales-sap/opciones') {
      return {
        tipos: [{ valor: 'CREACION', texto: 'Creación' }, { valor: 'MODIFICACION', texto: 'Modificación' }, { valor: 'DESINCORPORACION', texto: 'Desincorporación' }],
        verificacion: [{ valor: 'SI EXISTE', texto: 'Sí existe en SAP', conCodigo: true }, { valor: 'NO EXISTE', texto: 'No existe en SAP', conCodigo: false }],
      };
    }
    if (path === '/formatos/relacion-gastos/tipos') return ['Alimentacion y Refrigerios', 'Transporte', 'Hospedaje', 'Peajes'];
    if (path === '/solicitudes/usuarios/opciones') {
      return {
        sap: ['FI', 'MM', 'SD', 'QM', 'PP', 'PM'].map((m) => ({ codigo: m, nombre: `Módulo ${m}` })),
        spi: [['NOMINA', 'Nómina'], ['ESTRUCTURA', 'Estructura organizacional'], ['TALENTO', 'SPI Talento'], ['SEGURIDAD', 'Seguridad']].map(([codigo, nombre]) => ({ codigo, nombre })),
        comunicacion: [
          { grupo: 'Correo', opciones: [{ codigo: 'CORREO_INTERNO', nombre: 'Correo interno' }, { codigo: 'CORREO_EXTERNO', nombre: 'Correo externo' }] },
          { grupo: 'Teléfono', opciones: [{ codigo: 'EXTENSION', nombre: 'Extensión telefónica' }, { codigo: 'TELEFONO_CORP', nombre: 'Teléfono corporativo' }] },
          { grupo: 'Internet', opciones: [{ codigo: 'INTERNET_LIMITADO', nombre: 'Internet limitado' }, { codigo: 'INTERNET_LIBRE', nombre: 'Internet libre' }] },
        ],
        otrosSistemas: ['SAT', 'SISLOG', 'SGD', 'SCP', 'VISITAPOLA', 'CPE'],
      };
    }
    if (path === '/solicitudes/anticipos/estado') return { abierto: true, diaLimite: 10, hoy: '2026-10-05' };
    if (path.startsWith('/solicitudes/anticipos/registro/')) {
      return { cedula: '12345678', nombre: 'ANA', apellido: 'RODRIGUEZ', departamento: 'Administración', cargo: 'Analista', nomina: 'Empleado', correo: 'ana@correo.com', registrado: false };
    }
    if (path === '/solicitudes/anticipos/panel') {
      return {
        usuario: { cedula: '12345678', nombre: 'ANA RODRIGUEZ' },
        empleado: { nombreCompleto: 'ANA RODRIGUEZ', cedula: '12345678', ficha: '0420', cargo: 'Analista', departamento: 'Administración', fechaIngreso: '2019-05-02', nomina: 'Empleado' },
        trimestre: { inicio: '2026-10-01', numero: 4, anio: 2026 },
        planilla: { mes: 'octubre', archivo: 'EMPLEADOS.pdf', disponible: true, pagina: 12, saldoTexto: '12,345.67', saldo: 12345.67 },
      };
    }
    if (path.startsWith('/solicitudes/vacaciones/calculo')) {
      return { fechaIngreso: '2022-03-14', antiguedad: 4, diasBase: 15, dias: 18, feriados: 1, finesDeSemana: 4, reintegro: '2026-11-25' };
    }
    if (path.startsWith('/solicitudes?')) {
      return {
        solicitudes: [
          { clave: 'papeleria-900', numero: 900, tipo: 'Papelería', area: 'SERVICIOS', estado: 'REGISTRADA', descripcion: '3 artículos · 7 unidades', fecha: '2026-10-16T13:40:00' },
          { clave: 'permiso-55', numero: 55, tipo: 'Permiso individual', area: 'RRHH', estado: 'REGISTRADA', descripcion: 'Permiso Remunerado · 3 horas · Cita médica', fecha: '2026-10-14' },
        ],
        avisos: [],
      };
    }
    if (path === '/tema') return { marca: '#bcdbc2', accion: '#1f4a33', acento: '#d99a3a' };
    if (path in data) return data[path];
    throw new ApiError(404, `Sin datos de demostración para ${path}`);
  }
  if (method === 'POST' && path === '/solicitudes/anticipos/sesion') return { token: 'demo', usuario: { cedula: body.cedula, nombre: 'ANA RODRIGUEZ' } };
  if (method === 'POST' && path === '/solicitudes/anticipos/registro') return { ok: true };
  if (method === 'POST' && path === '/solicitudes/anticipos') {
    return { numero: Number(body.monto).toLocaleString('es-VE', { minimumFractionDigits: 2 }), etiquetaNumero: 'Monto solicitado', estado: 'REGISTRADA', creadaEn: new Date().toISOString(), solicitante: 'ANA RODRIGUEZ', correoEnviado: true };
  }
  if (method === 'POST' && path.startsWith('/solicitudes/')) {
    const cedula = body instanceof FormData ? body.get('cedula') : body?.cedula;
    if (!empleados[cedula]) throw new ApiError(404, 'No hay un trabajador activo con esa cédula');
    siguiente += 1;
    return { id: siguiente, numero: String(siguiente).padStart(6, '0'), estado: 'PENDIENTE', creadaEn: new Date().toISOString(), solicitante: empleados[cedula].nombreCompleto };
  }
  throw new ApiError(400, 'Operación no disponible en modo demostración');
}
