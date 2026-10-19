import { useState } from 'react';
import { Printer } from 'lucide-react';
import { Field, Input, Select, Textarea } from '../../../components/ui/Field.jsx';
import { hoyISO } from '../../../utils/fechas.js';
import { apiUrl } from '../../../api/client.js';
import { FormularioSolicitud } from '../componentes/FormularioSolicitud.jsx';
import { solicitudesApi } from '../solicitudes.api.js';

// Mismos valores que guarda la Intrapola actual en amapolanet.permisos
const TIPOS = ['Permiso Remunerado', 'Permiso No Remunerado'];
const MEDIDAS = [{ valor: 'Horas', texto: 'Horas' }, { valor: 'Dias', texto: 'Días' }];

const INICIAL = () => ({ fechaPermiso: hoyISO(), tipoPermiso: TIPOS[0], tiempo: '', medida: 'Horas', motivo: '', observaciones: '' });

/** Abre la hoja PDF en otra pestaña (como hacía ImprimirPermiso.aspx). */
const abrirHoja = (resultado) => {
  if (resultado?.pdfUrl) window.open(apiUrl(resultado.pdfUrl), '_blank', 'noopener');
};

export default function PermisoForm() {
  const [f, setF] = useState(INICIAL);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const validar = () => {
    const e = {};
    if (!f.fechaPermiso) e.fechaPermiso = 'Indique la fecha del permiso';
    if (!/^\d+$/.test(String(f.tiempo)) || Number(f.tiempo) < 1) e.tiempo = 'Indique el tiempo en números enteros';
    if (!f.motivo.trim()) e.motivo = 'Indique el motivo';
    return e;
  };

  const enviar = async ({ cedula }) => {
    const resultado = await solicitudesApi.permiso({ ...f, cedula, tiempo: Number(f.tiempo) });
    abrirHoja(resultado);
    return resultado;
  };

  return (
    <FormularioSolicitud
      titulo="Permiso individual"
      descripcion="Solicita una ausencia por horas o días. Al enviarla se genera la hoja para firmar y entregar a Recursos Humanos."
      textoBoton="Guardar y emitir"
      validar={validar}
      onReiniciar={() => setF(INICIAL())}
      onEnviar={enviar}
      accionesExito={(r) => r?.pdfUrl && (
        <a href={apiUrl(r.pdfUrl)} target="_blank" rel="noreferrer"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-pine px-6 text-[17px] font-bold text-white hover:bg-pine-800">
          <Printer className="size-5" aria-hidden /> Imprimir hoja de permiso
        </a>
      )}
    >
      {({ errores }) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Fecha del permiso" error={errores.fechaPermiso}>
              <Input type="date" value={f.fechaPermiso} onChange={set('fechaPermiso')} />
            </Field>
            <Field label="Tipo de permiso" error={errores.tipoPermiso}>
              <Select value={f.tipoPermiso} onChange={set('tipoPermiso')}>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:max-w-md">
            <Field label="Tiempo" error={errores.tiempo}>
              <Input type="number" min="1" step="1" inputMode="numeric" value={f.tiempo} onChange={set('tiempo')} placeholder="Ej. 4" />
            </Field>
            <Field label="Medida" error={errores.medida}>
              <Select value={f.medida} onChange={set('medida')}>
                {MEDIDAS.map((m) => <option key={m.valor} value={m.valor}>{m.texto}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Motivo del permiso" error={errores.motivo}>
            <Input value={f.motivo} onChange={set('motivo')} maxLength={200} placeholder="Ej. Cita médica con especialista del IVSS" />
          </Field>
          <Field label="Observaciones" opcional hint="Aparecen en la hoja impresa" error={errores.observaciones}>
            <Textarea value={f.observaciones} onChange={set('observaciones')} maxLength={500} />
          </Field>
        </>
      )}
    </FormularioSolicitud>
  );
}
