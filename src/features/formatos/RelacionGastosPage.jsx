import { useId, useState } from 'react';
import { Plus, Printer, Trash2 } from 'lucide-react';
import { Field, Input, Textarea } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useApi } from '../../hooks/useApi.js';
import { api, apiUrl } from '../../api/client.js';
import { hoyISO, fechaCorta } from '../../utils/fechas.js';
import { FormularioSolicitud } from '../solicitudes/componentes/FormularioSolicitud.jsx';

const bs = (n) => Number(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** Acepta "1500", "1500.50", "1.500,50" o "1,500.50". */
function aNumero(texto) {
  const t = String(texto ?? '').replace(/[^\d.,]/g, '');
  if (!t) return NaN;
  const ultimo = Math.max(t.lastIndexOf('.'), t.lastIndexOf(','));
  const limpio = ultimo !== -1 && /^\d{1,2}$/.test(t.slice(ultimo + 1))
    ? `${t.slice(0, ultimo).replace(/[.,]/g, '')}.${t.slice(ultimo + 1)}`
    : t.replace(/[.,]/g, '');
  return Number(limpio);
}
const centavos = (n) => Math.round(n * 100);

const NUEVO = () => ({ fecha: hoyISO(), tipo: '', monto: '' });

/** Renglones de gasto: se arman aquí y se guardan todos juntos (sin la tabla temporal del C#). */
function Gastos({ tipos, gastos, setGastos, error }) {
  const lista = useId();
  const [g, setG] = useState(NUEVO);
  const [err, setErr] = useState({});

  function agregar() {
    const e = {};
    if (!g.fecha) e.fecha = 'Indique la fecha';
    if (!g.tipo.trim()) e.tipo = 'Indique el tipo';
    const n = aNumero(g.monto);
    if (!(n > 0)) e.monto = 'Monto inválido';
    setErr(e);
    if (Object.keys(e).length) return;
    setGastos((xs) => [...xs, { ...g, tipo: g.tipo.trim(), monto: n, clave: `${Date.now()}-${Math.random()}` }]);
    setG((x) => ({ ...NUEVO(), fecha: x.fecha, tipo: '' }));
  }

  return (
    <div className="grid gap-4">
      <h3 className="font-bold text-pine">Gastos</h3>
      <div className="grid items-start gap-3 rounded-2xl bg-sage-50 p-4 ring-1 ring-inset ring-line sm:grid-cols-[10rem_1fr_9rem_auto]">
        <Field label="Fecha del gasto" error={err.fecha}>
          <Input type="date" value={g.fecha} max={hoyISO()} onChange={(e) => setG({ ...g, fecha: e.target.value })} />
        </Field>
        <Field label="Tipo de gasto" error={err.tipo}>
          <Input list={lista} value={g.tipo} onChange={(e) => setG({ ...g, tipo: e.target.value })} placeholder="Ej. Alimentacion y Refrigerios" maxLength={100} />
        </Field>
        <datalist id={lista}>{(tipos ?? []).map((t) => <option key={t} value={t} />)}</datalist>
        <Field label="Monto" error={err.monto}>
          <Input inputMode="decimal" value={g.monto} onChange={(e) => setG({ ...g, monto: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } }} placeholder="0,00" />
        </Field>
        <Button type="button" variante="secundario" icono={Plus} onClick={agregar} className="sm:mt-[1.85rem]">Agregar</Button>
      </div>

      {gastos.length > 0 && (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl ring-1 ring-line">
          {gastos.map((x, i) => (
            <li key={x.clave} className="grid grid-cols-[2rem_6rem_1fr_auto_auto] items-center gap-3 px-4 py-2.5">
              <span className="text-muted">{i + 1}</span>
              <span>{fechaCorta(x.fecha)}</span>
              <span className="min-w-0 truncate font-bold">{x.tipo}</span>
              <span className="tabular-nums">{bs(x.monto)}</span>
              <button type="button" onClick={() => setGastos((xs) => xs.filter((y) => y.clave !== x.clave))}
                className="rounded-lg p-1.5 text-danger hover:bg-danger-50" aria-label={`Quitar gasto ${i + 1}`}>
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="-mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}

export default function RelacionGastosPage() {
  const { data: tipos } = useApi('/formatos/relacion-gastos/tipos');
  const [concepto, setConcepto] = useState('');
  const [anticipo, setAnticipo] = useState('');
  const [observaciones, setObs] = useState('');
  const [gastos, setGastos] = useState([]);

  const anticipoNum = anticipo === '' ? 0 : aNumero(anticipo);
  const total = gastos.reduce((s, g) => s + centavos(g.monto), 0);
  const dif = (Number.isFinite(anticipoNum) ? centavos(anticipoNum) : 0) - total;

  const validar = () => {
    const e = {};
    if (!concepto.trim()) e.concepto = 'Indique el concepto';
    if (anticipo !== '' && !Number.isFinite(anticipoNum)) e.anticipo = 'Monto inválido';
    if (!gastos.length) e.gastos = 'Agregue al menos un gasto';
    return e;
  };

  const enviar = async ({ cedula }) => {
    const r = await api.post('/formatos/relacion-gastos', {
      cedula, concepto, observaciones, anticipo: anticipoNum || 0,
      gastos: gastos.map(({ fecha, tipo, monto }) => ({ fecha, tipo, monto })),
    });
    if (r?.pdfUrl) window.open(apiUrl(r.pdfUrl), '_blank', 'noopener');
    return r;
  };

  return (
    <FormularioSolicitud
      titulo="Relación de gastos"
      descripcion="Registra los gastos hechos con un anticipo. El saldo a favor de la empresa o tuyo se calcula solo."
      volver={{ to: '/formatos', texto: 'Formatos' }}
      textoBoton="Guardar e imprimir"
      validar={validar}
      onReiniciar={() => { setConcepto(''); setAnticipo(''); setObs(''); setGastos([]); }}
      onEnviar={enviar}
      accionesExito={(r) => r?.pdfUrl && (
        <a href={apiUrl(r.pdfUrl)} target="_blank" rel="noreferrer"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-pine px-6 text-[17px] font-bold text-white hover:bg-pine-800">
          <Printer className="size-5" aria-hidden /> Imprimir relación de gastos
        </a>
      )}
    >
      {({ errores }) => (
        <>
          <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
            <Field label="Concepto" error={errores.concepto} hint="Motivo del anticipo, ej. viaje a Valencia">
              <Input value={concepto} onChange={(e) => setConcepto(e.target.value)} maxLength={300} />
            </Field>
            <Field label="Anticipo recibido" error={errores.anticipo}>
              <Input inputMode="decimal" value={anticipo} onChange={(e) => setAnticipo(e.target.value)} placeholder="0,00" />
            </Field>
          </div>

          <Gastos tipos={tipos} gastos={gastos} setGastos={setGastos} error={errores.gastos} />

          <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
            <Field label="Observaciones" opcional error={errores.observaciones}>
              <Textarea value={observaciones} onChange={(e) => setObs(e.target.value)} maxLength={500} />
            </Field>
            <dl className="grid content-start gap-2 rounded-2xl bg-white p-4 ring-1 ring-line">
              {[
                ['Anticipo', centavos(Number.isFinite(anticipoNum) ? anticipoNum : 0)],
                ['Total gastos', total],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between"><dt className="text-muted">{k}</dt><dd className="tabular-nums">{bs(v / 100)}</dd></div>
              ))}
              <div className="mt-1 flex justify-between border-t border-line pt-2">
                <dt className={dif > 0 ? 'font-bold text-pine' : 'text-muted'}>Saldo a favor de la empresa</dt>
                <dd className="tabular-nums font-bold">{bs(dif > 0 ? dif / 100 : 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className={dif < 0 ? 'font-bold text-pine' : 'text-muted'}>Saldo a tu favor</dt>
                <dd className="tabular-nums font-bold">{bs(dif < 0 ? -dif / 100 : 0)}</dd>
              </div>
            </dl>
          </div>
        </>
      )}
    </FormularioSolicitud>
  );
}
