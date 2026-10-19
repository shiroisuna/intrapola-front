import { useState } from 'react';
import { Field, Input, Textarea } from '../../../components/ui/Field.jsx';
import { FormularioSolicitud } from '../componentes/FormularioSolicitud.jsx';
import { solicitudesApi } from '../solicitudes.api.js';

export default function DesarrolloForm() {
  const [motivo, setMotivo] = useState('');
  const [descripcion, setDesc] = useState('');

  const validar = () => {
    const e = {};
    if (!motivo.trim()) e.motivo = 'Indique el motivo';
    if (!descripcion.trim()) e.descripcion = 'Describa la necesidad';
    return e;
  };

  return (
    <FormularioSolicitud
      titulo="Desarrollo de aplicaciones"
      descripcion="Pide al departamento de Sistemas un sistema nuevo, un reporte o un cambio en una aplicación existente."
      validar={validar}
      onReiniciar={() => { setMotivo(''); setDesc(''); }}
      onEnviar={({ cedula }) => solicitudesApi.desarrollo({ cedula, motivo, descripcion })}
    >
      {({ errores }) => (
        <>
          <Field label="Motivo" error={errores.motivo} hint="En pocas palabras: qué quieres lograr">
            <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={150} placeholder="Ej. Reporte mensual de mermas por línea" />
          </Field>
          <Field label="Descripción de la necesidad" error={errores.descripcion} hint="Quién lo usará, qué datos necesita y cada cuánto">
            <Textarea value={descripcion} onChange={(e) => setDesc(e.target.value)} maxLength={1000} className="min-h-40" />
          </Field>
        </>
      )}
    </FormularioSolicitud>
  );
}
