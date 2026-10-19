import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleCheck, Send } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Feedback.jsx';
import { useEmpleado } from '../../../hooks/useEmpleado.js';
import { fechaHora } from '../../../utils/fechas.js';
import { EmpleadoLookup } from './EmpleadoLookup.jsx';

function Exito({ resultado, titulo, onNueva, acciones }) {
  return (
    <div className="animar-entrada mx-auto max-w-xl rounded-3xl bg-white p-8 text-center ring-1 ring-line sm:p-10">
      <div>
        <CircleCheck className="mx-auto size-14 text-pine-600" aria-hidden />
      </div>
      <h2 className="mt-4 text-2xl font-bold">Solicitud enviada</h2>
      <p className="mt-2 text-muted">
        {titulo} a nombre de <strong className="text-ink">{resultado.solicitante}</strong>, registrada el {fechaHora(resultado.creadaEn)}.
      </p>
      <p className="mt-6 text-[15px] text-muted">{resultado.etiquetaNumero ?? 'Número de solicitud'}</p>
      <p className="font-display text-5xl font-bold tracking-tight text-pine">{resultado.numero}</p>
      {acciones && <div className="mt-6 flex justify-center">{acciones}</div>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variante={acciones ? 'secundario' : 'primario'} onClick={onNueva}>Hacer otra solicitud</Button>
        <Link to="/solicitudes/mis-solicitudes" className="inline-flex h-11 items-center rounded-xl px-4 font-bold text-pine ring-1 ring-inset ring-line hover:bg-sage-50">
          Ver mis solicitudes
        </Link>
      </div>
    </div>
  );
}

/**
 * Estructura común de todos los formularios:
 * identifica al trabajador por cédula y luego muestra los campos propios (children).
 *
 * children: ({ empleado, errores }) => JSX
 * onEnviar: async ({ cedula }) => resultado del API
 * validar:  () => objeto de errores por campo (vacío si todo está bien)
 */
export function FormularioSolicitud({ titulo, descripcion, volver = { to: '/solicitudes', texto: 'Solicitudes' }, textoBoton = 'Enviar solicitud', onEnviar, validar, onReiniciar, accionesExito, children }) {
  const empleadoHook = useEmpleado();
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [resultado, setResultado] = useState(null);

  async function enviar(e) {
    e.preventDefault();
    setErrorGeneral('');
    const empleado = empleadoHook.empleado || (await empleadoHook.buscar());
    if (!empleado) return;

    const locales = validar?.() || {};
    setErrores(locales);
    if (Object.keys(locales).length) {
      setErrorGeneral('Revise los campos marcados.');
      return;
    }

    setEnviando(true);
    try {
      setResultado(await onEnviar({ cedula: empleado.cedula }));
    } catch (err) {
      setErrores(err.porCampo || {});
      setErrorGeneral(err.message);
    } finally {
      setEnviando(false);
    }
  }

  function nueva() {
    setResultado(null);
    setErrores({});
    empleadoHook.reiniciar();
    onReiniciar?.();
  }

  return (
    <>
      <PageHeader titulo={titulo} descripcion={descripcion} volver={volver} />

      {resultado ? (
        <Exito resultado={resultado} titulo={titulo} onNueva={nueva} acciones={accionesExito?.(resultado)} />
      ) : (
        <form onSubmit={enviar} noValidate className="rounded-3xl bg-white ring-1 ring-line">
          <section className="border-b border-line p-6 sm:p-8">
            <h2 className="mb-4 text-lg font-bold">¿Quién solicita?</h2>
            <EmpleadoLookup empleadoHook={empleadoHook} error={errores.cedula} />
          </section>

          <section className="p-6 sm:p-8">
            <h2 className="mb-4 text-lg font-bold">Detalle</h2>
            <div className="grid gap-5">{children({ empleado: empleadoHook.empleado, errores })}</div>
          </section>

          <footer className="flex flex-col-reverse gap-4 border-t border-line bg-sage-50/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 rounded-b-3xl">
            <div className="min-h-6">{errorGeneral && <Alert>{errorGeneral}</Alert>}</div>
            <Button type="submit" tamano="lg" icono={Send} cargando={enviando}>{textoBoton}</Button>
          </footer>
        </form>
      )}
    </>
  );
}
