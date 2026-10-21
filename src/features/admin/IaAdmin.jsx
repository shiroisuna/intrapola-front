import { useEffect, useState } from 'react';
import { Bot, Cloud, FlaskConical, KeyRound, ListRestart, RefreshCw, Save, Server, Settings2, Unlock } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Field, Input, Select } from '../../components/ui/Field.jsx';
import { Alert, Cargando } from '../../components/ui/Feedback.jsx';
import { useAdmin } from './sesion.js';
import { Interruptor, useAviso, useCarga } from './componentes.jsx';

/*
 * IA de Apolin para preguntas generales: estado de cada proveedor y ajustes (proveedor, modelo, clave,
 * búsqueda en internet, orden y cupos). Lo que se guarda aquí manda sobre el .env del servidor.
 */
const PROVEEDORES = [
  { id: 'groq', nombre: 'Groq', url: 'https://api.groq.com/openai/v1', nota: 'Plan gratis sin tarjeta. La búsqueda en internet funciona con openai/gpt-oss-20b y openai/gpt-oss-120b.' },
  { id: 'gemini', nombre: 'Gemini', url: 'https://generativelanguage.googleapis.com/v1beta/openai', nota: 'Clave de Google AI Studio. En el plan gratis Google puede usar las preguntas para mejorar sus productos.' },
  { id: 'openrouter', nombre: 'OpenRouter', url: 'https://openrouter.ai/api/v1', nota: 'Use modelos que terminen en ":free". Pocas preguntas gratis al día.' },
  { id: 'otro', nombre: '', url: '', nota: 'Cualquier servicio compatible con la API de OpenAI (/chat/completions).' },
];
const ORDENES = [
  ['nube,local', 'Nube primero; si falla o se acaba, el servidor'],
  ['local,nube', 'Servidor primero; si falla, la nube'],
  ['nube', 'Solo la nube'],
  ['local', 'Solo el servidor (Ollama)'],
];
const presetDe = (url) => PROVEEDORES.find((p) => p.url && url?.replace(/\/+$/, '') === p.url) ?? PROVEEDORES.at(-1);
const fechaHora = (iso) => new Date(iso).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' });

/* ------------------------------------ estado ------------------------------------ */
function Estado({ data, recargar, cargando }) {
  const admin = useAdmin();
  const [probando, setProbando] = useState(null);
  const [resultado, setResultado] = useState({});
  const [aviso, avisar] = useAviso();

  async function probar(id) {
    setProbando(id); setResultado((r) => ({ ...r, [id]: null }));
    try { setResultado((r) => ({ ...r, [id]: null })); const x = await admin.post('/apolin/ia/probar', { proveedor: id }); setResultado((r) => ({ ...r, [id]: x })); }
    catch (err) { setResultado((r) => ({ ...r, [id]: { ok: false, error: err.message } })); }
    finally { setProbando(null); recargar(); }
  }
  async function desbloquear() {
    try { await admin.post('/apolin/ia/desbloquear', {}); avisar('Se quitó el bloqueo: la próxima pregunta vuelve a intentar con la nube.'); recargar(); }
    catch (err) { avisar(err.message, 'error'); }
  }

  const ia = data.ia;
  const estado = (p) => {
    if (!p.configurado) return ['No configurado', 'text-muted'];
    if (p.agotadoHasta) return [`Sin cuota hasta ${fechaHora(p.agotadoHasta)}`, 'text-[#7a4e10]'];
    if (p.disponible === false) return [`Sin conexión (${p.error})`, 'text-danger'];
    if (p.id === 'local' && p.modeloInstalado === false) return [`Falta el modelo: ollama pull ${p.modelo}`, 'text-[#7a4e10]'];
    return ['Disponible', 'text-pine'];
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        {ia.configurada
          ? <>Orden: {ia.orden.map((o) => (o === 'nube' ? 'nube' : 'servidor (Ollama)')).join(' → ')} · {ia.preguntasPorPersona} preguntas por persona al día · {ia.personasHoy} {ia.personasHoy === 1 ? 'persona' : 'personas'} hoy</>
          : 'Preguntas generales desactivadas: Apolin funciona solo con el menú. Configure un proveedor abajo.'}
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {ia.proveedores.map((p) => {
          const [texto, clase] = estado(p);
          const r = resultado[p.id];
          const Icono = p.id === 'nube' ? Cloud : Server;
          return (
            <li key={p.id} className="flex flex-col gap-1 rounded-xl bg-sage-50 p-3.5">
              <p className="flex items-center gap-2 font-bold"><Icono className="size-4 text-pine" aria-hidden />{p.id === 'nube' ? `Nube: ${p.nombre}` : 'Servidor: Ollama'}</p>
              {p.modelo && <p className="break-all text-sm text-muted">Modelo {p.modelo}</p>}
              {p.id === 'nube' && p.configurado && <p className="text-sm text-muted">Búsqueda en internet: {{ activa: 'activa', apagada: 'apagada', rechazada: 'el modelo no la admite' }[p.busqueda]}</p>}
              <p className={`text-sm font-bold ${clase}`}>{texto}</p>
              {p.configurado && <p className="text-sm text-muted">Hoy: {p.uso.preguntas} {p.uso.preguntas === 1 ? 'respuesta' : 'respuestas'} · {p.uso.tokens.toLocaleString('es-VE')} tokens{p.uso.errores ? ` · ${p.uso.errores} ${p.uso.errores === 1 ? 'falla' : 'fallas'}` : ''}</p>}
              {p.ultimoError && !r && <p className="break-words rounded-lg bg-white px-2.5 py-1.5 text-xs text-danger ring-1 ring-danger/15">Último error ({fechaHora(p.ultimoError.fecha)}): {p.ultimoError.mensaje}</p>}
              {r && (r.ok
                ? <p className="rounded-lg bg-white px-2.5 py-1.5 text-sm ring-1 ring-line">✅ Respondió en {(r.ms / 1000).toFixed(1)} s: “{r.texto}”</p>
                : <p className="break-words rounded-lg bg-white px-2.5 py-1.5 text-sm text-danger ring-1 ring-danger/15">❌ {r.error}</p>)}
              {p.configurado && (
                <span className="mt-1 flex flex-wrap gap-2">
                  <Button tamano="sm" variante="secundario" icono={FlaskConical} cargando={probando === p.id} onClick={() => probar(p.id)}>Probar</Button>
                  {p.agotadoHasta && <Button tamano="sm" variante="fantasma" icono={Unlock} onClick={desbloquear}>Quitar bloqueo</Button>}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {aviso && <Alert tipo={aviso.tipo}>{aviso.texto}</Alert>}
      <Button variante="fantasma" tamano="sm" icono={RefreshCw} cargando={cargando} onClick={recargar} className="self-start">Actualizar estado</Button>
    </div>
  );
}

/* ----------------------------------- ajustes ----------------------------------- */
function SelectorModelo({ id, valor, onCambio, onCargar, modelos, cargando, placeholder }) {
  return (
    <div className="flex gap-2">
      <Input list={`${id}-modelos`} value={valor} onChange={(e) => onCambio(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1" spellCheck={false} />
      <datalist id={`${id}-modelos`}>{modelos.map((m) => <option key={m} value={m} />)}</datalist>
      <Button variante="secundario" icono={ListRestart} cargando={cargando} onClick={onCargar} title="Traer la lista de modelos del servicio">Ver modelos</Button>
    </div>
  );
}

function Ajustes({ alGuardar }) {
  const admin = useAdmin();
  const { data, loading, error, recargar: recargarAjustes, setData } = useCarga('/apolin/ia');
  const [d, setD] = useState(null);
  const [preset, setPreset] = useState('groq');
  const [modelos, setModelos] = useState({ nube: [], local: [] });
  const [cargandoModelos, setCargandoModelos] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});
  const [aviso, avisar] = useAviso();

  useEffect(() => {
    if (!data) return;
    setD({ orden: data.orden, preguntasDia: data.preguntasDia, maxTokens: data.maxTokens, nube: { ...data.nube, clave: '', quitarClave: false }, local: { ...data.local } });
    setPreset(data.nube.url ? presetDe(data.nube.url).id : 'groq');
  }, [data]);
  if (loading && !data) return <Cargando />;
  if (error) {
    return (
      <Alert>
        No se pudieron cargar los ajustes: {error.message}.
        {error.status === 404 && ' El backend del servidor todavía no tiene esta versión: actualícelo y reinícielo.'}
        {' '}<button type="button" onClick={recargarAjustes} className="font-bold underline">Reintentar</button>
      </Alert>
    );
  }
  if (!d) return null;

  const setNube = (k, v) => setD((x) => ({ ...x, nube: { ...x.nube, [k]: v } }));
  const setLocal = (k, v) => setD((x) => ({ ...x, local: { ...x.local, [k]: v } }));
  const p = PROVEEDORES.find((x) => x.id === preset);

  function elegirPreset(id) {
    setPreset(id);
    const nuevo = PROVEEDORES.find((x) => x.id === id);
    const mismo = id === presetDe(data.nube.url).id;
    // Otro servicio: el modelo y la clave guardados no le sirven
    if (id !== 'otro') setD((x) => ({ ...x, nube: { ...x.nube, nombre: nuevo.nombre, url: nuevo.url, modelo: mismo ? data.nube.modelo : '', busqueda: id === 'groq' ? x.nube.busqueda : false } }));
    setModelos((m) => ({ ...m, nube: [] }));
    setErrores({});
  }

  async function cargarModelos(proveedor) {
    setCargandoModelos(proveedor); avisar(null);
    try {
      const cuerpo = proveedor === 'nube' ? { proveedor, url: d.nube.url, clave: d.nube.clave || undefined } : { proveedor, url: d.local.url };
      const { modelos: lista } = await admin.post('/apolin/ia/modelos', cuerpo);
      setModelos((m) => ({ ...m, [proveedor]: lista }));
      avisar(lista.length ? `${lista.length} modelos encontrados: elija uno en la lista del campo Modelo.` : 'El servicio no devolvió modelos.');
    } catch (err) { avisar(err.message, 'error'); }
    finally { setCargandoModelos(null); }
  }

  async function guardar(e) {
    e.preventDefault();
    const er = {};
    if (cambioServicio && !d.nube.clave.trim() && !d.nube.quitarClave) er['nube.clave'] = 'Pegue la clave del nuevo proveedor (la guardada es de otro servicio)';
    if (d.nube.url && !d.nube.modelo.trim() && !d.nube.quitarClave) er['nube.modelo'] = 'Indique el modelo (use "Ver modelos")';
    if (Object.keys(er).length) { setErrores(er); return; }
    setGuardando(true); setErrores({}); avisar(null);
    try {
      setData(await admin.put('/apolin/ia', d));
      avisar('Ajustes guardados. Apolin los usa desde la próxima pregunta (no hace falta reiniciar).');
      alGuardar();
    } catch (err) { avisar(err.message, 'error'); setErrores(err.porCampo); }
    finally { setGuardando(false); }
  }

  const cambioServicio = Boolean(d.nube.url) && d.nube.url.replace(/\/+$/, '') !== String(data.nube.url || '').replace(/\/+$/, '');
  const sinClave = (cambioServicio || !data.nube.claveConfigurada) && !d.nube.clave;

  return (
    <form onSubmit={guardar} noValidate className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 flex items-center gap-2 text-lg font-bold"><Cloud className="size-5 text-pine" aria-hidden />Nube</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Proveedor" hint={p.nota}>
            <Select value={preset} onChange={(e) => elegirPreset(e.target.value)}>
              {PROVEEDORES.map((x) => <option key={x.id} value={x.id}>{x.nombre || 'Otro (compatible con OpenAI)'}</option>)}
            </Select>
          </Field>
          {preset === 'otro' ? (
            <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
              <Field label="Nombre" error={errores['nube.nombre']}><Input value={d.nube.nombre} maxLength={40} onChange={(e) => setNube('nombre', e.target.value)} /></Field>
              <Field label="Dirección de la API" error={errores['nube.url']}><Input value={d.nube.url} onChange={(e) => setNube('url', e.target.value)} placeholder="https://…/v1" spellCheck={false} /></Field>
            </div>
          ) : (
            <Field label="Dirección de la API"><Input value={d.nube.url} disabled /></Field>
          )}
        </div>
        <Field label="Clave de la API" error={errores['nube.clave']}
          hint={cambioServicio ? `Nueva clave de ${d.nube.nombre || 'este servicio'}: la guardada es de otro proveedor.` : data.nube.claveConfigurada ? `Hay una clave guardada (termina en …${data.nube.claveFinal}). Déjelo vacío para conservarla.` : 'Se guarda solo en el servidor; nunca se muestra completa.'}>
          <Input type="password" value={d.nube.clave} onChange={(e) => setNube('clave', e.target.value)} autoComplete="new-password" placeholder={data.nube.claveConfigurada && !cambioServicio ? '•••••••• (sin cambios)' : 'Pegue aquí la clave'} spellCheck={false} />
        </Field>
        {data.nube.claveConfigurada && (
          <label className="-mt-2 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={d.nube.quitarClave} onChange={(e) => setNube('quitarClave', e.target.checked)} className="size-4 accent-[var(--color-danger)]" />
            Borrar la clave guardada (desactiva la nube)
          </label>
        )}
        <Field label="Modelo" error={errores['nube.modelo']} hint={sinClave ? 'Primero indique la clave para poder ver los modelos.' : undefined}>
          <SelectorModelo id="nube" valor={d.nube.modelo} onCambio={(v) => setNube('modelo', v)} modelos={modelos.nube} cargando={cargandoModelos === 'nube'}
            onCargar={() => cargarModelos('nube')} placeholder="openai/gpt-oss-120b" />
        </Field>
        <div className="flex flex-col gap-1">
          <Interruptor activo={d.nube.busqueda} onCambio={(v) => setNube('busqueda', v)} deshabilitado={preset !== 'groq'}
            etiqueta="Buscar en internet cuando la pregunta lo necesite (clima, precios, noticias)" />
          <p className="text-sm text-muted">{preset === 'groq' ? 'Gasta más cupo por pregunta. Si el modelo no la admite, Apolin la apaga sola.' : 'Disponible solo con Groq.'}</p>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 border-t border-line pt-5">
        <legend className="mb-1 flex items-center gap-2 text-lg font-bold"><Server className="size-5 text-pine" aria-hidden />Servidor (Ollama)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Dirección de Ollama" opcional error={errores['local.url']} hint="Vacío = no se usa. En el mismo servidor: http://127.0.0.1:11434">
            <Input value={d.local.url} onChange={(e) => setLocal('url', e.target.value)} placeholder="http://127.0.0.1:11434" spellCheck={false} />
          </Field>
          <Field label="Modelo" error={errores['local.modelo']}>
            <SelectorModelo id="local" valor={d.local.modelo} onCambio={(v) => setLocal('modelo', v)} modelos={modelos.local} cargando={cargandoModelos === 'local'}
              onCargar={() => cargarModelos('local')} placeholder="llama3.2" />
          </Field>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
        <legend className="mb-1 flex items-center gap-2 text-lg font-bold"><Settings2 className="size-5 text-pine" aria-hidden />Uso</legend>
        <Field label="Qué usar primero" className="sm:col-span-3">
          <Select value={d.orden} onChange={(e) => setD((x) => ({ ...x, orden: e.target.value }))}>
            {ORDENES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Preguntas por persona al día" error={errores.preguntasDia}>
          <Input type="number" min={1} max={500} value={d.preguntasDia} onChange={(e) => setD((x) => ({ ...x, preguntasDia: e.target.value }))} />
        </Field>
        <Field label="Largo máximo de respuesta" error={errores.maxTokens} hint="En tokens (≈ ¾ de palabra). 900 ≈ una página corta.">
          <Input type="number" min={200} max={8000} step={100} value={d.maxTokens} onChange={(e) => setD((x) => ({ ...x, maxTokens: e.target.value }))} />
        </Field>
      </fieldset>

      {aviso && <Alert tipo={aviso.tipo}>{aviso.texto}</Alert>}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" icono={Save} cargando={guardando}>Guardar ajustes</Button>
        {data.actualizadoEn && <span className="text-sm text-muted">Último cambio: {fechaHora(data.actualizadoEn)}{data.actualizadoPor ? ` (${data.actualizadoPor})` : ''}</span>}
      </div>
    </form>
  );
}

export default function IaAdmin() {
  const { data, loading, recargar } = useCarga('/apolin/estado');
  const [abierto, setAbierto] = useState(false);
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Bot className="size-5 text-pine" aria-hidden />Preguntas generales (IA)</h2>
        <Button variante={abierto ? 'suave' : 'secundario'} tamano="sm" icono={KeyRound} onClick={() => setAbierto((a) => !a)} aria-expanded={abierto}>
          {abierto ? 'Cerrar ajustes' : 'Cambiar proveedor o modelo'}
        </Button>
      </div>
      {loading && !data ? <Cargando texto="Revisando la IA…" /> : data && <Estado data={data} recargar={recargar} cargando={loading} />}
      {abierto && <div className="border-t border-line pt-5"><Ajustes alGuardar={recargar} /></div>}
    </section>
  );
}
