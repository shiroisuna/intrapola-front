import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CircleCheck, Printer, Search, Send } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Field, Input, Select, Textarea } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Alert, ErrorCarga } from '../../components/ui/Feedback.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useEmpleado } from '../../hooks/useEmpleado.js';
import { api, apiUrl } from '../../api/client.js';
import { hoyISO } from '../../utils/fechas.js';
import { EmpleadoLookup } from '../solicitudes/componentes/EmpleadoLookup.jsx';
import { Pregunta } from './Pregunta.jsx';

const TIPOS_RIF = ['J', 'G', 'E', 'V', 'P'];
/** Datos de cabecera: los comunes más los campos propios de la evaluación (config.campos). */
const DATOS_INICIALES = (campos = []) => ({
  fecha: hoyISO(), tipoRif: 'J', numeroRif: '', observaciones: '',
  ...Object.fromEntries(campos.map((c) => [c.nombre, c.porDefecto ?? ''])),
});
const ANCHO = { completo: 'sm:col-span-3', doble: 'sm:col-span-2' };

/** Indicador de pasos: secciones de la encuesta con su avance. */
function Pasos({ pasos, actual, completos, onIr }) {
  return (
    <nav aria-label="Pasos de la evaluación" className="mb-6">
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-pine transition-all" style={{ width: `${(actual / (pasos.length - 1)) * 100}%` }} />
      </div>
      <ol className="flex flex-wrap gap-2">
        {pasos.map((p, i) => {
          const hecho = completos[i];
          const activo = i === actual;
          return (
            <li key={p}>
              <button type="button" onClick={() => onIr(i)} disabled={i > actual && !completos[i - 1]}
                aria-current={activo ? 'step' : undefined}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ring-1 ring-inset transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  activo ? 'bg-pine text-white ring-pine' : hecho ? 'bg-sage-100 text-pine ring-sage-200 hover:bg-sage' : 'bg-white text-muted ring-line'}`}>
                <span className={`grid size-5 place-items-center rounded-full text-xs ${activo ? 'bg-white/20' : hecho ? 'bg-pine text-white' : 'bg-line'}`}>
                  {hecho && !activo ? <Check className="size-3" aria-hidden /> : i + 1}
                </span>
                {p}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Un campo de cabecera según su tipo (texto, número, correo, lista o automático). */
function CampoCabecera({ c, valor, onChange, onBlur, error, numeroAuto }) {
  if (c.tipo === 'auto') {
    return (
      <Field label={c.etiqueta} hint={c.ayuda} error={error}>
        <Input value={numeroAuto || ''} readOnly placeholder="Se genera al buscar el proveedor" className="bg-sage-50" />
      </Field>
    );
  }
  if (c.tipo === 'select') {
    return (
      <Field label={c.etiqueta} error={error}>
        <Select value={valor} onChange={onChange}><option value="">Seleccione</option>{c.opciones.map((o) => <option key={o}>{o}</option>)}</Select>
      </Field>
    );
  }
  return (
    <Field label={c.etiqueta} opcional={!c.requerido} hint={c.ayuda} error={error}>
      <Input type={c.tipo === 'email' ? 'email' : 'text'} inputMode={c.tipo === 'numero' ? 'decimal' : undefined}
        value={valor} maxLength={c.max} onChange={onChange} onBlur={onBlur} />
    </Field>
  );
}

function PasoProveedor({ config, d, set, proveedor, buscarProveedor, buscando, contratoUsado, verificarContrato, numeroAuto, errores }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
        <Field label="Fecha de evaluación" error={errores.fecha}>
          <Input type="date" value={d.fecha} max={hoyISO()} onChange={set('fecha')} />
        </Field>
        <div className="flex items-end gap-2">
          <Field label="Tipo" className="w-20"><Select value={d.tipoRif} onChange={set('tipoRif')}>{TIPOS_RIF.map((t) => <option key={t}>{t}</option>)}</Select></Field>
          <Field label="RIF del proveedor" error={errores.rif} className="flex-1">
            <Input inputMode="numeric" value={d.numeroRif} placeholder="Ej. 123456789"
              onChange={(e) => set('numeroRif')({ target: { value: e.target.value.replace(/[^\d]/g, '').slice(0, 10) } })}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscarProveedor(); } }} />
          </Field>
          <Button type="button" variante="secundario" icono={Search} cargando={buscando} onClick={buscarProveedor} className={errores.rif ? 'mb-[1.625rem]' : ''}>Buscar</Button>
        </div>
      </div>
      {proveedor && (
        <div className="flex items-center gap-3 rounded-xl bg-sage-50 px-4 py-3 ring-1 ring-sage-200">
          <CircleCheck className="size-5 shrink-0 text-pine-600" aria-hidden />
          <div><p className="font-bold">{proveedor.nombre}</p><p className="text-[15px] text-muted">RIF {proveedor.rif} · Código {proveedor.codigo || '—'}</p></div>
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-3">
        {config.campos.map((c) => (
          <div key={c.nombre} className={ANCHO[c.ancho] ?? ''}>
            <CampoCabecera c={c} valor={d[c.nombre] ?? c.porDefecto ?? ''} onChange={set(c.nombre)} numeroAuto={numeroAuto}
              onBlur={c.nombre === 'contrato' ? verificarContrato : undefined}
              error={errores[c.nombre] || (c.nombre === 'contrato' && contratoUsado && (c.tipo === 'auto' ? 'Este proveedor ya tiene una evaluación en ese mes' : 'Este contrato u orden ya fue evaluado'))} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Resumen({ config, respuestas, total, res, d, set, empleadoHook, errores }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 rounded-2xl bg-sage-50 p-5 ring-1 ring-inset ring-line sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
        <div>
          <p className="text-sm text-muted">Puntuación total</p>
          <p className="font-display text-5xl font-bold tracking-tight text-pine">{total}<span className="text-2xl text-muted"> / {config.puntajeMaximo}</span></p>
        </div>
        <div>
          <p className="text-lg font-bold">{res.calificacion}</p>
          <p className="text-muted">{res.decision}</p>
        </div>
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl ring-1 ring-line">
        {config.secciones.map((s) => {
          const pts = s.preguntas.reduce((n, p) => n + (respuestas[p.id]?.puntos ?? 0), 0);
          const max = s.preguntas.reduce((n, p) => n + p.max, 0);
          return (
            <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="font-bold">{s.nombre}</span>
              <span className="tabular-nums"><strong>{pts}</strong><span className="text-muted"> / {max}</span></span>
            </li>
          );
        })}
      </ul>
      <Field label="Observaciones y sugerencias" opcional><Textarea value={d.observaciones} maxLength={Math.min(1000, config.limites?.observaciones ?? 1000)} onChange={set('observaciones')} /></Field>
      <div>
        <h3 className="mb-3 font-bold">¿Quién evalúa?</h3>
        <EmpleadoLookup empleadoHook={empleadoHook} error={errores.cedulaEvaluador} />
      </div>
    </div>
  );
}

/** Evaluación de proveedores como asistente: datos del proveedor → una sección por indicador → resumen. */
export default function EvaluacionPage({ clave }) {
  const { data: config, loading, error, recargar } = useApi(`/evaluaciones/${clave}`);
  const [paso, setPaso] = useState(0);
  const [d, setD] = useState(() => DATOS_INICIALES());
  const [numeroAuto, setNumeroAuto] = useState('');
  const [proveedor, setProveedor] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [contratoUsado, setContratoUsado] = useState(false);
  const [respuestas, setRespuestas] = useState({});
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const empleadoHook = useEmpleado();

  const set = (k) => (e) => {
    setD((s) => ({ ...s, [k]: e.target.value }));
    if (k === 'numeroRif' || k === 'tipoRif') { setProveedor(null); setNumeroAuto(''); setContratoUsado(false); }
    if (k === 'fecha') { setNumeroAuto(''); setContratoUsado(false); }
    if (k === 'contrato') setContratoUsado(false);
    setErrores((x) => ({ ...x, [k]: undefined }));
  };
  const rif = `${d.tipoRif}${d.numeroRif}`;

  const total = useMemo(() => Object.values(respuestas).reduce((n, r) => n + (r.puntos ?? 0), 0), [respuestas]);
  const res = useMemo(() => {
    const pct = config?.puntajeMaximo ? (total / config.puntajeMaximo) * 100 : 0;
    const e = config?.escala.find((x) => pct >= x.desde) ?? config?.escala.at(-1);
    return e ?? { calificacion: '', decision: '' };
  }, [config, total]);

  if (loading) return <p className="text-muted">Cargando…</p>;
  if (error || !config) return <ErrorCarga error={error} onReintentar={recargar} />;
  // Valor de un campo propio, con su valor por defecto si aún no se ha escrito
  const valorDe = (c) => String(d[c.nombre] ?? c.porDefecto ?? '');

  const pasos = ['Proveedor', ...config.secciones.map((s) => s.nombre), 'Resumen'];
  const ultimo = pasos.length - 1;
  const seccion = paso > 0 && paso < ultimo ? config.secciones[paso - 1] : null;

  async function buscarProveedor() {
    if (d.numeroRif.length < 5) { setErrores((e) => ({ ...e, rif: 'Escriba el RIF completo' })); return null; }
    setBuscando(true); setErrores((e) => ({ ...e, rif: undefined }));
    try {
      const p = await api.get(`/evaluaciones/proveedores?rif=${rif}`);
      setProveedor(p);
      if (config.numeroAutomatico) await calcularNumero();
      return p;
    }
    catch (err) { setProveedor(null); setErrores((e) => ({ ...e, rif: err.message })); return null; }
    finally { setBuscando(false); }
  }
  async function calcularNumero() {
    if (!d.fecha) return false;
    try {
      const n = await api.get(`/evaluaciones/${clave}/numero?rif=${rif}&fecha=${d.fecha}`);
      setNumeroAuto(n.contrato); setContratoUsado(n.existe); return n.existe;
    } catch { return false; }
  }
  async function verificarContrato() {
    if (config.numeroAutomatico) return calcularNumero();
    if (!d.contrato?.trim()) return false;
    try { const { existe } = await api.get(`/evaluaciones/contratos?contrato=${encodeURIComponent(d.contrato.trim())}`); setContratoUsado(existe); return existe; }
    catch { return false; }
  }

  const erroresDe = (i, prov = proveedor) => {
    const e = {};
    if (i === 0) {
      if (!d.fecha) e.fecha = 'Indique la fecha';
      if (!prov) e.rif = 'Busque el proveedor por su RIF';
      for (const c of config.campos) {
        const v = valorDe(c).trim();
        if (c.requerido && !v) e[c.nombre] = c.tipo === 'select' ? 'Seleccione una opción' : 'Este dato es obligatorio';
        else if (v && c.tipo === 'numero' && !(Number(v.replace(',', '.')) >= 0)) e[c.nombre] = 'Número inválido';
        else if (v && c.tipo === 'email' && !/^\S+@\S+\.\S+$/.test(v)) e[c.nombre] = 'Correo inválido';
      }
      const num = (n) => Number(valorDe(config.campos.find((c) => c.nombre === n) ?? {}).replace(',', '.'));
      if (config.campos.some((c) => c.nombre === 'cantRechazada') && num('cantRechazada') > num('cantSuministrada')) e.cantRechazada = 'No puede ser mayor que la suministrada';
      if (contratoUsado) e.contrato = config.numeroAutomatico ? 'Este proveedor ya tiene una evaluación en ese mes' : 'Este contrato u orden ya fue evaluado';
    } else if (i < ultimo) {
      for (const p of config.secciones[i - 1].preguntas) if (respuestas[p.id]?.cumple === undefined) e[p.id] = 'Responda si cumple o no';
    }
    return e;
  };
  const completos = pasos.map((_, i) => i < ultimo && Object.keys(erroresDe(i)).length === 0);

  async function siguiente() {
    let prov = proveedor;
    if (paso === 0) {
      if (!prov && d.numeroRif) prov = await buscarProveedor();
      if (prov && await verificarContrato()) {
        setErrores({ contrato: config.numeroAutomatico ? 'Este proveedor ya tiene una evaluación en ese mes' : 'Este contrato u orden ya fue evaluado' });
        return;
      }
    }
    const e = erroresDe(paso, prov);
    setErrores(e);
    if (Object.keys(e).length) return;
    setPaso((p) => Math.min(p + 1, ultimo));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const ir = (i) => { setErrores({}); setPaso(i); };

  async function guardar() {
    setErrorGeneral('');
    const evaluador = empleadoHook.empleado || (await empleadoHook.buscar());
    if (!evaluador) { setErrores({ cedulaEvaluador: 'Indique la cédula de quien evalúa' }); return; }
    const pendiente = pasos.findIndex((_, i) => i < ultimo && !completos[i]);
    if (pendiente !== -1) { setPaso(pendiente); setErrores(erroresDe(pendiente)); return; }
    setEnviando(true);
    try {
      const propios = Object.fromEntries(config.campos.filter((c) => c.tipo !== 'auto').map((c) => {
        const v = valorDe(c).trim();
        return [c.nombre, c.tipo === 'numero' ? v.replace(',', '.') : v];
      }));
      setResultado(await api.post(`/evaluaciones/${clave}`, {
        fecha: d.fecha, rif, ...propios, observaciones: d.observaciones, cedulaEvaluador: evaluador.cedula, respuestas,
      }));
    } catch (err) {
      setErrorGeneral(err.message);
      if (err.porCampo?.contrato) { setContratoUsado(true); setPaso(0); setErrores(err.porCampo); }
    } finally { setEnviando(false); }
  }

  function nueva() {
    setResultado(null); setPaso(0); setD(DATOS_INICIALES(config.campos)); setProveedor(null); setNumeroAuto(''); setRespuestas({}); setErrores({}); setContratoUsado(false); empleadoHook.reiniciar();
  }

  const encabezado = (
    <PageHeader titulo={config.titulo} descripcion={`${config.formato.codigo} · ${config.formato.titulo}. Responde una sección a la vez.`} volver={{ to: '/formatos', texto: 'Formatos' }} />
  );

  if (resultado) {
    return (
      <>
        {encabezado}
        <div className="animar-entrada mx-auto max-w-xl rounded-3xl bg-white p-8 text-center ring-1 ring-line sm:p-10">
          <CircleCheck className="mx-auto size-14 text-pine-600" aria-hidden />
          <h2 className="mt-4 text-2xl font-bold">Evaluación guardada</h2>
          <p className="mt-2 text-muted">{resultado.proveedor} · {resultado.etiquetaNumero.toLowerCase()} {resultado.numero}</p>
          <p className="mt-6 font-display text-6xl font-bold tracking-tight text-pine">{resultado.puntuacion}<span className="text-2xl text-muted"> / {resultado.maximo}</span></p>
          <p className="mt-2 text-lg font-bold">{resultado.calificacion}</p>
          <p className="text-muted">{resultado.decision}</p>
          {resultado.correoEnviado === true && <p className="mt-3 text-[15px] text-pine">Se le envió el resultado al proveedor por correo.</p>}
          {resultado.correoEnviado === false && <Alert tipo="aviso" className="mt-4 text-left">La evaluación quedó guardada, pero no se pudo enviar el correo al proveedor.</Alert>}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={apiUrl(resultado.pdfUrl)} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-pine px-5 font-bold text-white hover:bg-pine-800">
              <Printer className="size-5" aria-hidden /> Imprimir evaluación
            </a>
            <Button variante="secundario" onClick={nueva}>Evaluar otro proveedor</Button>
            <Link to="/formatos" className="inline-flex h-11 items-center rounded-xl px-4 font-bold text-pine ring-1 ring-inset ring-line hover:bg-sage-50">Volver a formatos</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {encabezado}
      <Pasos pasos={pasos} actual={paso} completos={completos} onIr={ir} />
      <section className="rounded-3xl bg-white ring-1 ring-line">
        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-6 py-5 sm:px-8">
          <h2 className="text-xl font-bold">{pasos[paso]}</h2>
          {seccion && (
            <span className="text-muted">
              Subtotal <strong className="text-ink">{seccion.preguntas.reduce((n, p) => n + (respuestas[p.id]?.puntos ?? 0), 0)}</strong>
              {' / '}{seccion.preguntas.reduce((n, p) => n + p.max, 0)}
            </span>
          )}
        </header>
        <div className="p-6 sm:p-8">
          {paso === 0 && (
            <PasoProveedor config={config} d={d} set={set} proveedor={proveedor} buscarProveedor={buscarProveedor} buscando={buscando}
              contratoUsado={contratoUsado} verificarContrato={verificarContrato} numeroAuto={numeroAuto} errores={errores} />
          )}
          {seccion && (
            <div className="grid gap-4">
              {seccion.preguntas.map((p, j) => (
                <Pregunta key={p.id} numero={j + 1} pregunta={p} valor={respuestas[p.id]} error={errores[p.id]}
                  onChange={(v) => { setRespuestas((r) => ({ ...r, [p.id]: v })); setErrores((e) => ({ ...e, [p.id]: undefined })); }} />
              ))}
            </div>
          )}
          {paso === ultimo && (
            <Resumen config={config} respuestas={respuestas} total={total} res={res} d={d} set={set} empleadoHook={empleadoHook} errores={errores} />
          )}
        </div>
        <footer className="flex flex-col-reverse gap-3 rounded-b-3xl border-t border-line bg-sage-50/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3">
            {paso > 0 && <Button variante="secundario" icono={ArrowLeft} onClick={() => ir(paso - 1)}>Anterior</Button>}
            {errorGeneral && <Alert>{errorGeneral}</Alert>}
          </div>
          {paso < ultimo
            ? <Button tamano="lg" onClick={siguiente}>Siguiente <ArrowRight className="size-5" aria-hidden /></Button>
            : <Button tamano="lg" icono={Send} cargando={enviando} onClick={guardar}>Guardar evaluación</Button>}
        </footer>
      </section>
    </>
  );
}
