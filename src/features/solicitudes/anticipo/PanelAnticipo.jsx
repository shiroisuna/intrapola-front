import { useEffect, useState } from 'react';
import { HandCoins, LogOut, TriangleAlert } from 'lucide-react';
import { Field, Input } from '../../../components/ui/Field.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Feedback.jsx';
import { useApi } from '../../../hooks/useApi.js';
import { fechaCorta, fechaLarga } from '../../../utils/fechas.js';
import { anticipoApi } from './anticipo.api.js';

const formato = (n) => n?.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** Acepta "1500", "1500.50", "1.500,50" o "1,500.50". */
function aNumero(texto) {
  const t = String(texto).replace(/[^\d.,]/g, '');
  const ultimo = Math.max(t.lastIndexOf('.'), t.lastIndexOf(','));
  const limpio = ultimo !== -1 && /^\d{1,2}$/.test(t.slice(ultimo + 1))
    ? `${t.slice(0, ultimo).replace(/[.,]/g, '')}.${t.slice(ultimo + 1)}`
    : t.replace(/[.,]/g, '');
  return limpio ? Number(limpio) : NaN;
}

/** Visor de la página del trabajador en la planilla (se descarga con la sesión, no queda en carpetas públicas). */
function Planilla({ token }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let creada;
    let vigente = true;
    anticipoApi.planilla(token)
      .then((blob) => { if (vigente && blob) { creada = URL.createObjectURL(blob); setUrl(creada); } })
      .catch((err) => vigente && setError(err.message));
    return () => { vigente = false; if (creada) URL.revokeObjectURL(creada); };
  }, [token]);

  if (error) return <Alert>{error}</Alert>;
  if (!url) return <div className="grid h-[480px] place-items-center rounded-2xl bg-sage-50 text-muted">Cargando planilla…</div>;
  return <iframe title="Planilla de prestaciones" src={url} className="h-[70vh] min-h-[480px] w-full rounded-2xl ring-1 ring-line" />;
}

export function PanelAnticipo({ sesion, onSalir, onSolicitado }) {
  const { data, loading, error } = useApi('/solicitudes/anticipos/panel', { token: sesion.token });
  const [monto, setMonto] = useState('');
  const [errorMonto, setErrorMonto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');

  if (loading) return <p className="text-muted">Cargando sus datos…</p>;
  if (error) {
    return (
      <div className="flex flex-col items-start gap-4">
        <Alert>{error.message}</Alert>
        <Button variante="secundario" icono={LogOut} onClick={onSalir}>Volver a ingresar</Button>
      </div>
    );
  }
  if (!data) return null;
  const { empleado, trimestre, planilla } = data;

  async function solicitar(e) {
    e.preventDefault();
    const n = aNumero(monto);
    if (!Number.isFinite(n) || n <= 0) { setErrorMonto('Escriba un monto válido'); return; }
    if (planilla.saldo != null && n > planilla.saldo) { setErrorMonto(`El máximo disponible es ${formato(planilla.saldo)}`); return; }
    setEnviando(true); setErrorMonto(''); setErrorGeneral('');
    try { onSolicitado(await anticipoApi.solicitar(sesion.token, n)); }
    catch (err) { setErrorMonto(err.porCampo?.monto || ''); setErrorGeneral(err.message); }
    finally { setEnviando(false); }
  }

  const datos = [
    ['Trabajador', empleado.nombreCompleto], ['Cédula', empleado.cedula], ['Ficha', empleado.ficha],
    ['Cargo', empleado.cargo], ['Fecha de ingreso', empleado.fechaIngreso && fechaLarga(empleado.fechaIngreso)], ['Nómina', empleado.nomina],
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl bg-white p-6 ring-1 ring-line sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Tus datos</h2>
          <Button variante="fantasma" icono={LogOut} onClick={onSalir}>Cerrar sesión</Button>
        </div>
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
          {datos.map(([k, v]) => <div key={k}><dt className="text-sm text-muted">{k}</dt><dd className="font-bold">{v || '—'}</dd></div>)}
        </dl>
      </section>

      <section className="rounded-3xl bg-white p-6 ring-1 ring-line sm:p-8">
        <h2 className="text-xl font-bold">Detalle de prestaciones</h2>
        <p className="mb-5 text-muted">Trimestre desde el {fechaCorta(trimestre.inicio)} · planilla de {planilla.mes}</p>

        {planilla.disponible ? (
          <>
            {planilla.saldo != null && (
              <div className="mb-5 inline-flex flex-col rounded-2xl bg-sage-50 px-5 py-4 ring-1 ring-inset ring-line">
                <span className="text-sm text-muted">Saldo disponible (75 %)</span>
                <span className="font-display text-3xl font-bold text-pine">{formato(planilla.saldo)}</span>
              </div>
            )}
            <Planilla token={sesion.token} />
            <div className="mt-5 flex gap-3 rounded-2xl bg-biscuit-100 p-4 text-[#7a4e10]">
              <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
              <p><strong>Importante:</strong> esta planilla debe ser impresa, firmada y entregada a Recursos Humanos. Sin ese requisito la solicitud no será procesada.</p>
            </div>
          </>
        ) : (
          <Alert tipo="aviso">{planilla.mensaje}</Alert>
        )}
      </section>

      <form onSubmit={solicitar} noValidate className="rounded-3xl bg-white ring-1 ring-line">
        <div className="p-6 sm:p-8">
          <h2 className="mb-4 text-xl font-bold">Solicitar anticipo</h2>
          <Field label="Monto a solicitar" error={errorMonto}
            hint={planilla.saldo != null ? `Hasta ${formato(planilla.saldo)}` : 'Use punto o coma para los decimales'} className="sm:max-w-xs">
            <Input inputMode="decimal" value={monto} onChange={(e) => { setMonto(e.target.value); setErrorMonto(''); }} placeholder="Ej. 1500,00" />
          </Field>
        </div>
        <footer className="flex flex-col-reverse gap-4 rounded-b-3xl border-t border-line bg-sage-50/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="min-h-6">{errorGeneral && <Alert>{errorGeneral}</Alert>}</div>
          <Button type="submit" tamano="lg" icono={HandCoins} cargando={enviando}>Solicitar anticipo</Button>
        </footer>
      </form>
    </div>
  );
}
