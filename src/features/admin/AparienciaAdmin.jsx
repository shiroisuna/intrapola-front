import { useEffect, useMemo, useState } from 'react';
import { Cake, RotateCcw, Save, Undo2 } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Alert, Cargando, ErrorCarga } from '../../components/ui/Feedback.jsx';
import { aplicarTema, FUENTES_POR_DEFECTO, paleta, recordarTema, revisarContraste, TEMA_POR_DEFECTO } from '../../utils/tema.js';
import { familiaDe, FUENTES } from '../../utils/fuentes.js';
import { useAdmin } from './sesion.js';
import { useAviso, useCarga } from './componentes.jsx';

const COLORES = [
  { clave: 'marca', nombre: 'Color de marca', uso: 'Menú lateral, encabezado y fondos suaves.' },
  { clave: 'accion', nombre: 'Color de acción', uso: 'Botones, enlaces, títulos destacados y texto del menú.' },
  { clave: 'acento', nombre: 'Color de acento', uso: 'Cumpleaños, eventos y avisos.' },
];
const SUGERIDOS = [
  { nombre: 'Amapola (original)', ...TEMA_POR_DEFECTO },
  { nombre: 'Verde bosque', marca: '#cfe3c8', accion: '#2f5d1e', acento: '#c9822b' },
  { nombre: 'Azul sereno', marca: '#c9dcef', accion: '#1d3f66', acento: '#d9963a' },
  { nombre: 'Grafito', marca: '#d9dedb', accion: '#2b3a33', acento: '#b8873a' },
];
const hexValido = (v) => /^#[0-9a-f]{6}$/i.test(v);
const CLAVES = [...Object.keys(TEMA_POR_DEFECTO), ...Object.keys(FUENTES_POR_DEFECTO)];
const ORIGINAL = { ...TEMA_POR_DEFECTO, ...FUENTES_POR_DEFECTO };

/** Carga todas las fuentes del catálogo para mostrar cada opción con su propia letra. */
function useFamilias() {
  const [familias, setFamilias] = useState({});
  useEffect(() => {
    let vigente = true;
    Promise.all(FUENTES.map(async (f) => [f.id, await familiaDe(f.id)]))
      .then((pares) => vigente && setFamilias(Object.fromEntries(pares)));
    return () => { vigente = false; };
  }, []);
  return familias;
}

function SelectorFuente({ titulo, uso, valor, onCambio, familias, muestra }) {
  return (
    <fieldset className="rounded-2xl bg-white p-4 ring-1 ring-line">
      <legend className="sr-only">{titulo}</legend>
      <p className="font-bold">{titulo}</p>
      <p className="mb-3 text-sm text-muted">{uso}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {FUENTES.map((f) => (
          <label key={f.id} className={`flex cursor-pointer flex-col rounded-xl px-3 py-2.5 ring-1 transition-colors ${
            valor === f.id ? 'bg-sage-50 ring-2 ring-pine' : 'ring-line hover:ring-sage-400'}`}>
            <input type="radio" name={titulo} value={f.id} checked={valor === f.id} onChange={() => onCambio(f.id)} className="sr-only" />
            <span className="truncate text-lg" style={{ fontFamily: familias[f.id], fontWeight: muestra === 'titulo' ? 700 : 400 }}>{f.nombre}</span>
            <span className="text-xs text-muted">{f.estilo}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SelectorColor({ c, valor, onCambio }) {
  const [texto, setTexto] = useState(valor);
  useEffect(() => setTexto(valor), [valor]);
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-line">
      <label className="relative size-14 shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 ring-line" style={{ background: valor }}>
        <span className="sr-only">Elegir {c.nombre.toLowerCase()}</span>
        <input type="color" value={valor} onChange={(e) => onCambio(e.target.value)} className="absolute inset-0 size-full cursor-pointer opacity-0" />
      </label>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{c.nombre}</p>
        <p className="text-sm text-muted">{c.uso}</p>
      </div>
      <input value={texto} maxLength={7} aria-label={`${c.nombre} en hexadecimal`} spellCheck={false}
        onChange={(e) => {
          const v = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
          setTexto(v);
          if (hexValido(v)) onCambio(v.toLowerCase());
        }}
        className="h-10 w-24 rounded-lg border border-line px-2 font-mono text-sm uppercase focus:border-pine-600 focus:outline-none" />
    </div>
  );
}

/** Vista previa con los tonos calculados (independiente de los colores aplicados a la página). */
function VistaPrevia({ tema, familias }) {
  const p = paleta(tema);
  const titulos = { fontFamily: familias[tema.fuenteTitulos] };
  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-line" style={{ fontFamily: familias[tema.fuenteTexto] }} aria-hidden>
      <div className="grid grid-cols-[9rem_1fr]">
        <div className="flex flex-col gap-1.5 p-3" style={{ background: p.sage }}>
          <span className="mb-2 font-bold" style={{ ...titulos, color: p['pine-800'] }}>Intrapola</span>
          {['Inicio', 'Solicitudes', 'Normas'].map((t, i) => (
            <span key={t} className="rounded-lg px-2 py-1 text-sm font-bold" style={{ color: p['pine-800'], background: i === 0 ? '#fff' : 'transparent' }}>{t}</span>
          ))}
        </div>
        <div className="flex flex-col gap-3 p-4" style={{ background: p.paper }}>
          <span className="text-lg font-bold" style={titulos}>Buenos días</span>
          <div className="rounded-xl bg-white p-3" style={{ boxShadow: `inset 0 0 0 1px ${p.line}` }}>
            <span className="block text-sm font-bold" style={{ color: p.pine }}>Solicitud de permiso</span>
            <span className="block text-xs" style={{ color: '#5a6b61' }}>Ausencias por horas o días</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg px-3 py-1.5 text-sm font-bold text-white" style={{ background: p.pine }}>Enviar</span>
            <span className="rounded-lg px-3 py-1.5 text-sm font-bold" style={{ background: p['sage-100'], color: p.pine }}>Ver más</span>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: p['biscuit-100'], color: '#5c3b0c' }}>
              <Cake className="size-3.5" style={{ color: p.biscuit }} /> Cumpleaños
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AparienciaAdmin() {
  const admin = useAdmin();
  const { data, loading, error, recargar, setData } = useCarga('/tema');
  const [tema, setTema] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [aviso, avisar] = useAviso();

  const familias = useFamilias();
  const guardado = useMemo(() => (data ? Object.fromEntries(CLAVES.map((k) => [k, data[k] ?? ORIGINAL[k]])) : null), [data]);
  useEffect(() => { if (guardado) setTema(guardado); }, [guardado]);
  // Al salir de la pestaña sin guardar, la página vuelve a los colores guardados
  useEffect(() => () => { if (guardado) aplicarTema(guardado); }, [guardado]);

  if (loading && !data) return <Cargando />;
  if (error) return <ErrorCarga error={error} onReintentar={recargar} />;
  if (!tema) return null;

  const cambios = CLAVES.some((k) => tema[k] !== guardado[k]);
  const esOriginal = CLAVES.every((k) => tema[k] === ORIGINAL[k]);
  const avisosContraste = revisarContraste(tema);

  const cambiar = (nuevo) => { setTema(nuevo); aplicarTema(nuevo); avisar(null); };

  async function guardar(restablecer = false) {
    setGuardando(true); avisar(null);
    try {
      const t = restablecer ? await admin.del('/tema') : await admin.put('/tema', Object.fromEntries(CLAVES.map((k) => [k, tema[k]])));
      setData({ ...data, ...t });
      recordarTema(aplicarTema(t));
      avisar(restablecer ? 'Se restableció la apariencia original.' : 'Apariencia guardada: todos la verán al recargar la Intrapola.');
    } catch (err) { avisar(err.message, 'error'); }
    finally { setGuardando(false); }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        <p className="text-muted">Los cambios se ven al momento en esta página, pero solo se publican al guardar.</p>
        {COLORES.map((c) => <SelectorColor key={c.clave} c={c} valor={tema[c.clave]} onCambio={(v) => cambiar({ ...tema, [c.clave]: v })} />)}

        <div>
          <p className="mb-2 text-[15px] font-bold">Combinaciones sugeridas</p>
          <ul className="flex flex-wrap gap-2">
            {SUGERIDOS.map((s) => (
              <li key={s.nombre}>
                <button type="button" onClick={() => cambiar({ ...tema, marca: s.marca, accion: s.accion, acento: s.acento })}
                  className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold ring-1 ring-line hover:ring-sage-400">
                  <span className="flex -space-x-1">{[s.marca, s.accion, s.acento].map((x) => <span key={x} className="size-4 rounded-full ring-2 ring-white" style={{ background: x }} />)}</span>
                  {s.nombre}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <h2 className="mt-4 text-xl font-bold">Tipo de letra</h2>
        <SelectorFuente titulo="Títulos" uso="Encabezados de cada página y de las secciones." muestra="titulo" familias={familias}
          valor={tema.fuenteTitulos} onCambio={(v) => cambiar({ ...tema, fuenteTitulos: v })} />
        <SelectorFuente titulo="Texto" uso="Menú, párrafos, formularios y botones." muestra="texto" familias={familias}
          valor={tema.fuenteTexto} onCambio={(v) => cambiar({ ...tema, fuenteTexto: v })} />
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <VistaPrevia tema={tema} familias={familias} />
        {avisosContraste.map((a) => <Alert key={a} tipo="aviso">{a}</Alert>)}
        {aviso && <Alert tipo={aviso.tipo}>{aviso.texto}</Alert>}
        <div className="flex flex-wrap gap-2">
          <Button icono={Save} cargando={guardando} disabled={!cambios} onClick={() => guardar(false)}>Guardar apariencia</Button>
          {cambios && <Button variante="secundario" icono={Undo2} onClick={() => cambiar(guardado)}>Descartar cambios</Button>}
          {!esOriginal && !cambios && <Button variante="fantasma" icono={RotateCcw} cargando={guardando} onClick={() => guardar(true)}>Volver a los originales</Button>}
        </div>
        {data.actualizadoEn && (
          <p className="text-sm text-muted">Último cambio: {new Date(data.actualizadoEn).toLocaleString('es-VE')}{data.actualizadoPor ? ` (${data.actualizadoPor})` : ''}</p>
        )}
      </div>
    </div>
  );
}
