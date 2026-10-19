import { useState } from 'react';
import { Printer } from 'lucide-react';
import { Field, Input } from '../../../components/ui/Field.jsx';
import { Alert } from '../../../components/ui/Feedback.jsx';
import { useApi } from '../../../hooks/useApi.js';
import { apiUrl } from '../../../api/client.js';
import { fechaLarga, hoyISO } from '../../../utils/fechas.js';
import { FormularioSolicitud } from '../componentes/FormularioSolicitud.jsx';
import { solicitudesApi } from '../solicitudes.api.js';

const anio = Number(hoyISO().slice(0, 4));
const PERIODO_INICIAL = `${anio - 1}-${anio}`;

const abrirHoja = (r) => r?.pdfUrl && window.open(apiUrl(r.pdfUrl), '_blank', 'noopener');

/** Resumen calculado por el servidor (mismas reglas que svacaciones.aspx). */
function Calculo({ cedula, inicio }) {
  const ruta = cedula && inicio ? `/solicitudes/vacaciones/calculo?cedula=${cedula}&inicio=${inicio}` : null;
  const { data, loading, error } = useApi(ruta);

  if (!ruta) return <p className="text-muted">Indica tu cédula y la fecha de salida para calcular los días y la fecha de reintegro.</p>;
  if (loading) return <p className="text-muted">Calculando…</p>;
  if (error) return <Alert>{error.message}</Alert>;
  if (!data) return null;

  const filas = [
    ['Fecha de ingreso', data.fechaIngreso && fechaLarga(data.fechaIngreso)],
    ['Años de antigüedad', data.antiguedad],
    ['Días de disfrute', `${data.dias} días`],
    ['Feriados en el período', data.feriados],
    ['Sábados y domingos', data.finesDeSemana],
    ['Fecha de reintegro', fechaLarga(data.reintegro)],
  ];
  return (
    <dl className="grid gap-x-6 gap-y-3 rounded-2xl bg-sage-50 p-5 ring-1 ring-inset ring-line sm:grid-cols-3">
      {filas.map(([k, v]) => (
        <div key={k}>
          <dt className="text-sm text-muted">{k}</dt>
          <dd className={`font-bold ${k === 'Fecha de reintegro' ? 'text-pine' : ''}`}>{v ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function VacacionesForm() {
  const [inicio, setInicio] = useState('');
  const [periodo, setPeriodo] = useState(PERIODO_INICIAL);

  const validar = () => {
    const e = {};
    if (!inicio) e.inicio = 'Indique la fecha de salida';
    if (!periodo.trim()) e.periodo = 'Indique el período';
    return e;
  };

  const enviar = async ({ cedula }) => {
    const r = await solicitudesApi.vacaciones({ cedula, inicio, periodo });
    abrirHoja(r);
    return r;
  };

  return (
    <FormularioSolicitud
      titulo="Vacaciones"
      descripcion="Calcula tus días de disfrute y tu fecha de reintegro. Al guardar se genera la hoja para firmar y entregar a Recursos Humanos."
      textoBoton="Guardar y emitir"
      validar={validar}
      onReiniciar={() => { setInicio(''); setPeriodo(PERIODO_INICIAL); }}
      onEnviar={enviar}
      accionesExito={(r) => r?.pdfUrl && (
        <a href={apiUrl(r.pdfUrl)} target="_blank" rel="noreferrer"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-pine px-6 text-[17px] font-bold text-white hover:bg-pine-800">
          <Printer className="size-5" aria-hidden /> Imprimir hoja de vacaciones
        </a>
      )}
    >
      {({ empleado, errores }) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Fecha de salida" error={errores.inicio}>
              <Input type="date" value={inicio} min={hoyISO()} onChange={(e) => setInicio(e.target.value)} />
            </Field>
            <Field label="Período" hint="Año de servicio al que corresponden" error={errores.periodo}>
              <Input value={periodo} maxLength={20} onChange={(e) => setPeriodo(e.target.value)} placeholder="Ej. 2025-2026" />
            </Field>
          </div>
          <Calculo cedula={empleado?.cedula} inicio={inicio} />
        </>
      )}
    </FormularioSolicitud>
  );
}
