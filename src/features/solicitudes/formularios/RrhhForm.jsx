import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Field, Select, Textarea } from '../../../components/ui/Field.jsx';
import { Alert } from '../../../components/ui/Feedback.jsx';
import { useApi } from '../../../hooks/useApi.js';
import { FormularioSolicitud } from '../componentes/FormularioSolicitud.jsx';
import { solicitudesApi } from '../solicitudes.api.js';

const MAX = 500;

/** Tipos con formulario propio: igual que en la Intrapola actual, que redirigía a otra página. */
function OtroFormulario({ tipo }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-sage-50 p-5 ring-1 ring-inset ring-line sm:flex-row sm:items-center sm:justify-between">
      <p>{tipo.nombre} tiene su propio formulario.</p>
      <Link to={tipo.ruta} className="inline-flex h-11 items-center gap-2 rounded-xl bg-pine px-5 font-bold text-white hover:bg-pine-800">
        Ir al formulario <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

export default function RrhhForm() {
  const { data: tipos } = useApi('/catalogos/tipos-solicitud?area=RRHH');
  const opciones = (tipos ?? []).filter((t) => t.codigo.startsWith('RRHH_'));
  const [tipoCodigo, setTipo] = useState('');
  const [descripcion, setDesc] = useState('');
  const tipo = opciones.find((t) => t.codigo === tipoCodigo);
  const esGeneral = !tipo || tipo.formulario === 'GENERAL';

  const validar = () => {
    const e = {};
    if (!tipoCodigo) e.tipoCodigo = 'Seleccione qué necesita';
    else if (!esGeneral) e.tipoCodigo = 'Esta solicitud se hace en su propio formulario';
    if (esGeneral && !descripcion.trim()) e.descripcion = 'Escriba su solicitud';
    return e;
  };

  return (
    <FormularioSolicitud
      titulo="Solicitud a Recursos Humanos"
      descripcion="Constancias, TodoTicket, transporte, fideicomiso, reclamos, sugerencias y actualización de datos. Recursos Humanos recibe un aviso por correo."
      validar={validar}
      onReiniciar={() => { setTipo(''); setDesc(''); }}
      onEnviar={({ cedula }) => solicitudesApi.rrhh({ cedula, tipoCodigo, descripcion })}
      accionesExito={(r) => r && r.correoEnviado === false && (
        <Alert tipo="aviso" className="text-left">
          La solicitud quedó registrada, pero no se pudo enviar el aviso por correo a Recursos Humanos.
        </Alert>
      )}
    >
      {({ errores }) => (
        <>
          <Field label="¿Qué necesitas?" error={errores.tipoCodigo} className="sm:max-w-md">
            <Select value={tipoCodigo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Seleccione una opción</option>
              {opciones.map((t) => <option key={t.codigo} value={t.codigo}>{t.nombre}</option>)}
            </Select>
          </Field>
          {esGeneral ? (
            <Field label="Tu solicitud" error={errores.descripcion} hint={`${descripcion.length} de ${MAX} caracteres`}>
              <Textarea value={descripcion} onChange={(e) => setDesc(e.target.value.slice(0, MAX))} placeholder="Cuéntale a Recursos Humanos qué necesitas y para cuándo." className="min-h-36" />
            </Field>
          ) : (
            <OtroFormulario tipo={tipo} />
          )}
        </>
      )}
    </FormularioSolicitud>
  );
}
