import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, LoaderCircle, Maximize2, Minimize2, RotateCcw, SendHorizontal, X } from 'lucide-react';
import { api, archivoUrl } from '../../api/client.js';

/*
 * Apolin: asistente virtual de Sistemas (antes chatbot en Python, ahora /api/apolin del backend).
 * Botón flotante con la mascota; la conversación sigue al cambiar de página y se guarda en la pestaña.
 */
const CLAVE = 'intrapola-apolin';
const cara = (nombre) => `${import.meta.env.BASE_URL}apolin/${nombre || 'sonriente'}.png`;

const leer = () => { try { return JSON.parse(sessionStorage.getItem(CLAVE)) ?? null; } catch { return null; } };
const guardar = (e) => { try { sessionStorage.setItem(CLAVE, JSON.stringify(e)); } catch { /* sin almacenamiento */ } };
const borrar = () => { try { sessionStorage.removeItem(CLAVE); } catch { /* sin almacenamiento */ } };

/** Formato en línea: **negrita**, _cursiva_ y `código`. Todo lo demás es texto (sin HTML). */
function EnLinea({ texto }) {
  return String(texto).split(/(\*\*[^*]+\*\*|`[^`]+`|\b_[^_]+_\b)/g).map((p, j) => {
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <b key={j}>{p.slice(2, -2)}</b>;
    if (p.startsWith('`') && p.endsWith('`') && p.length > 2) return <code key={j} className="rounded bg-sage-100 px-1 py-0.5 font-mono text-[13px] text-pine-800">{p.slice(1, -1)}</code>;
    if (p.startsWith('_') && p.endsWith('_') && p.length > 2) return <i key={j} className="text-muted">{p.slice(1, -1)}</i>;
    return p;
  });
}

/** Párrafos, listas ("- " o "1. ") y títulos ("### "), como los escribe la IA. */
function Texto({ texto }) {
  const bloques = [];
  for (const linea of String(texto).replace(/\r/g, '').split('\n')) {
    const vineta = linea.match(/^\s*[-*•]\s+(.*)$/);
    const numero = linea.match(/^\s*(\d+)[.)]\s+(.*)$/);
    const titulo = linea.match(/^\s*#{1,6}\s+(.*)$/);
    const ultimo = bloques.at(-1);
    if (vineta) {
      if (ultimo?.tipo === 'ul') ultimo.items.push(vineta[1]); else bloques.push({ tipo: 'ul', items: [vineta[1]] });
    } else if (numero) {
      if (ultimo?.tipo === 'ol') ultimo.items.push(numero[2]); else bloques.push({ tipo: 'ol', inicio: Number(numero[1]), items: [numero[2]] });
    } else if (titulo) {
      bloques.push({ tipo: 'h', texto: titulo[1] });
    } else if (!linea.trim()) {
      bloques.push({ tipo: 'espacio' });
    } else if (ultimo?.tipo === 'p') {
      ultimo.lineas.push(linea);
    } else {
      bloques.push({ tipo: 'p', lineas: [linea] });
    }
  }
  return bloques.map((b, i) => {
    if (b.tipo === 'ul') return <ul key={i} className="my-1 list-disc space-y-0.5 pl-5">{b.items.map((x, k) => <li key={k}><EnLinea texto={x} /></li>)}</ul>;
    if (b.tipo === 'ol') return <ol key={i} start={b.inicio} className="my-1 list-decimal space-y-0.5 pl-5">{b.items.map((x, k) => <li key={k}><EnLinea texto={x} /></li>)}</ol>;
    if (b.tipo === 'h') return <p key={i} className="mt-1 font-bold"><EnLinea texto={b.texto} /></p>;
    if (b.tipo === 'espacio') return <span key={i} className="block h-1.5" />;
    return <p key={i}>{b.lineas.map((l, k) => <Fragment key={k}>{k > 0 && <br />}<EnLinea texto={l} /></Fragment>)}</p>;
  });
}

function Burbuja({ m, onNavegar }) {
  if (m.de === 'yo') {
    return <li className="ml-10 self-end rounded-2xl rounded-br-md bg-pine px-3.5 py-2 text-[15px] text-white">{m.texto}</li>;
  }
  return (
    <li className="mr-6 self-start rounded-2xl rounded-bl-md bg-white px-3.5 py-2 text-[15px] text-ink shadow-[0_1px_0_rgba(0,0,0,.04)] ring-1 ring-line">
      {m.imagen && <img src={archivoUrl(m.imagen)} alt="" className="mb-2 max-h-48 w-full rounded-xl object-cover" loading="lazy" />}
      {m.etiqueta && <span className="mb-0.5 block text-xs font-bold uppercase tracking-wide text-biscuit">{m.etiqueta}</span>}
      <Texto texto={m.texto} />
      {m.enlace && (m.enlace.interno ? (
        <Link to={m.enlace.url} onClick={onNavegar} className="mt-2 flex items-center gap-1.5 font-bold text-pine underline-offset-2 hover:underline">
          {m.enlace.texto} →
        </Link>
      ) : (
        <a href={m.enlace.url} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1.5 font-bold text-pine underline-offset-2 hover:underline">
          {m.enlace.texto} <ExternalLink className="size-3.5" aria-hidden />
        </a>
      ))}
    </li>
  );
}

/* ------------------------- posición y arrastre ------------------------- */
const CLAVE_POS = 'intrapola-apolin-posicion';
const MARGEN = 12;
const Z = 2147483000; // por encima de todo (menús, visores, ventanas)
const tamanoBoton = () => (window.innerWidth >= 640 ? 96 : 80);

/** La posición se guarda relativa a la pantalla (0..1), así se adapta si cambia el tamaño de la ventana. */
function posInicial() {
  const t = tamanoBoton();
  const libreX = window.innerWidth - t - MARGEN * 2;
  const libreY = window.innerHeight - t - MARGEN * 2;
  let r = { x: 1, y: 1 }; // abajo a la derecha
  try { r = { ...r, ...JSON.parse(localStorage.getItem(CLAVE_POS)) }; } catch { /* sin almacenamiento */ }
  return { x: MARGEN + r.x * libreX, y: MARGEN + r.y * libreY };
}
function limitar({ x, y }) {
  const t = tamanoBoton();
  return {
    x: Math.min(Math.max(MARGEN, x), window.innerWidth - t - MARGEN),
    y: Math.min(Math.max(MARGEN, y), window.innerHeight - t - MARGEN),
  };
}
function recordarPos({ x, y }) {
  const t = tamanoBoton();
  const r = {
    x: (x - MARGEN) / Math.max(1, window.innerWidth - t - MARGEN * 2),
    y: (y - MARGEN) / Math.max(1, window.innerHeight - t - MARGEN * 2),
  };
  try { localStorage.setItem(CLAVE_POS, JSON.stringify(r)); } catch { /* sin almacenamiento */ }
}

/**
 * Arrastrar con mouse o con el dedo. Si el puntero se mueve menos de 6 px se toma como un clic normal.
 * Devuelve los manejadores para el botón y para la barra del chat.
 */
function useArrastre() {
  const [pos, setPos] = useState(posInicial);
  const [arrastrando, setArrastrando] = useState(false);
  const gesto = useRef(null);
  const seMovio = useRef(false);

  useEffect(() => {
    const ajustar = () => setPos(() => posInicial());
    window.addEventListener('resize', ajustar);
    return () => window.removeEventListener('resize', ajustar);
  }, []);

  const manejadores = {
    onPointerDown(e) {
      if (e.button !== 0 || e.target.closest('[data-no-arrastrar]')) return;
      gesto.current = { id: e.pointerId, x: e.clientX, y: e.clientY, x0: pos.x, y0: pos.y, movido: false };
      // Captura desde el inicio: si el puntero sale rápido del botón, igual se sigue moviendo
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    onPointerMove(e) {
      const g = gesto.current;
      if (!g || g.id !== e.pointerId) return;
      const dx = e.clientX - g.x;
      const dy = e.clientY - g.y;
      if (!g.movido) {
        if (Math.hypot(dx, dy) < 6) return;
        g.movido = true;
        setArrastrando(true);
      }
      setPos(limitar({ x: g.x0 + dx, y: g.y0 + dy }));
    },
    onPointerUp(e) {
      const g = gesto.current;
      gesto.current = null;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      if (!g?.movido) return;
      seMovio.current = true; // evita que el "click" que sigue abra o cierre el chat
      setArrastrando(false);
      setPos((p) => { recordarPos(p); return p; });
    },
    onPointerCancel() { gesto.current = null; setArrastrando(false); },
  };

  /** Alt + flechas: mover con el teclado. */
  function moverConTeclado(e) {
    const paso = e.shiftKey ? 80 : 24;
    const d = { ArrowLeft: [-paso, 0], ArrowRight: [paso, 0], ArrowUp: [0, -paso], ArrowDown: [0, paso] }[e.key];
    if (!e.altKey || !d) return;
    e.preventDefault();
    setPos((p) => { const n = limitar({ x: p.x + d[0], y: p.y + d[1] }); recordarPos(n); return n; });
  }

  /** true si el último gesto fue un arrastre (y lo consume). */
  const fueArrastre = () => { const v = seMovio.current; seMovio.current = false; return v; };

  return { pos, arrastrando, manejadores, moverConTeclado, fueArrastre };
}

/** Dónde abrir el chat según dónde esté Apolin: arriba o abajo, a la izquierda o a la derecha. */
function lugarDelChat(pos, amplio) {
  const t = tamanoBoton();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const W = Math.min(amplio ? 620 : 380, vw - MARGEN * 2);
  const H = Math.min(amplio ? 760 : 600, vh - MARGEN * 2);
  const derecha = pos.x + t / 2 > vw / 2;
  const abajo = pos.y + t / 2 > vh / 2;
  let left = derecha ? pos.x + t - W : pos.x;
  let top = abajo ? pos.y - H - 8 : pos.y + t + 8;
  if (top < MARGEN || top + H > vh - MARGEN) {
    // No cabe arriba ni abajo: al lado de Apolin
    top = Math.min(Math.max(MARGEN, pos.y + t / 2 - H / 2), vh - H - MARGEN);
    left = derecha ? pos.x - W - 8 : pos.x + t + 8;
  }
  left = Math.min(Math.max(MARGEN, left), vw - W - MARGEN);
  return { left, top, width: W, height: H };
}

const hoyIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function Apolin() {
  const [abierto, setAbierto] = useState(false);
  const [estado, setEstado] = useState(() => leer() ?? { conversacion: null, mensajes: [], opciones: [], entrada: 'numero', sugerencia: 'Número de ficha', cara: 'sonriente', usuario: null });
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [lento, setLento] = useState(false);
  useEffect(() => {
    if (!cargando) { setLento(false); return undefined; }
    const t = setTimeout(() => setLento(true), 2500);
    return () => clearTimeout(t);
  }, [cargando]);
  const lista = useRef(null);
  const campo = useRef(null);
  const boton = useRef(null);
  const { pos, arrastrando, manejadores, moverConTeclado, fueArrastre } = useArrastre();
  const [ancho, setAncho] = useState(() => window.innerWidth);
  useEffect(() => {
    const r = () => setAncho(window.innerWidth);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const movil = ancho < 640;
  const [amplio, setAmplio] = useState(() => { try { return localStorage.getItem('intrapola-apolin-amplio') === '1'; } catch { return false; } });
  const alternarAmplio = () => setAmplio((a) => { try { localStorage.setItem('intrapola-apolin-amplio', a ? '0' : '1'); } catch { /* sin almacenamiento */ } return !a; });

  useEffect(() => { guardar(estado); }, [estado]);

  /** Agrega lo que respondió el servidor a la conversación. */
  const aplicar = useCallback((r, propios = []) => {
    setEstado((e) => ({
      conversacion: r.conversacion,
      mensajes: [...e.mensajes, ...propios, ...(r.recordatorios ?? []).map((x) => ({ de: 'bot', etiqueta: x.tipo || 'Recordatorio', texto: `**${x.titulo}**\n${x.mensaje}`, imagen: x.imagenUrl })),
        ...r.respuestas.map((x) => ({ de: 'bot', ...x }))].slice(-80),
      opciones: r.opciones ?? [],
      entrada: r.entrada,
      sugerencia: r.sugerencia,
      cara: r.cara,
      usuario: r.usuario,
    }));
  }, []);

  const error = useCallback((err) => setEstado((e) => ({
    ...e,
    cara: 'confundido',
    mensajes: [...e.mensajes, { de: 'bot', texto: err?.status === 429 ? err.message : 'No pude conectarme con el servicio de soporte. Intenta más tarde.' }],
  })), []);

  // Al abrir por primera vez: saludo y recordatorios del día
  useEffect(() => {
    if (!abierto || estado.mensajes.length) return;
    setCargando(true);
    api.post('/apolin/inicio', { conversacion: estado.conversacion ?? undefined })
      .then((r) => aplicar(r))
      .catch(error)
      .finally(() => setCargando(false));
  }, [abierto, estado.mensajes.length, estado.conversacion, aplicar, error]);

  useEffect(() => { lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: 'smooth' }); }, [estado.mensajes.length, cargando]);
  useEffect(() => { if (abierto && !cargando) campo.current?.focus(); }, [abierto, cargando, estado.entrada]);
  useEffect(() => {
    if (!abierto) return undefined;
    const esc = (e) => { if (e.key === 'Escape') { setAbierto(false); boton.current?.focus(); } };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [abierto]);

  async function enviar(valor, mostrar = valor) {
    const v = String(valor ?? '').trim();
    if (!v || cargando) return;
    setTexto('');
    setCargando(true);
    // El mensaje propio se ve al instante; la respuesta llega después
    setEstado((e) => ({ ...e, opciones: [], cara: 'pensativo', mensajes: [...e.mensajes, { de: 'yo', texto: mostrar }] }));
    try {
      const r = await api.post('/apolin/mensaje', { conversacion: estado.conversacion ?? undefined, texto: v });
      await new Promise((ok) => setTimeout(ok, 350)); // pausa corta: se ve "pensando"
      aplicar(r);
    } catch (err) { error(err); }
    finally { setCargando(false); }
  }

  function reiniciar() {
    borrar();
    setEstado({ conversacion: null, mensajes: [], opciones: [], entrada: 'numero', sugerencia: 'Número de ficha', cara: 'sonriente', usuario: null });
  }

  const fechaLegible = (iso) => iso.split('-').reverse().join('/');

  return (
    <>
      {abierto && (
        <section role="dialog" aria-label="Apolin, asistente virtual" aria-modal="false"
          style={movil ? { zIndex: Z } : { zIndex: Z, ...lugarDelChat(pos, amplio) }}
          className={`fixed flex flex-col overflow-hidden bg-paper ${movil ? 'inset-0' : 'rounded-3xl shadow-[0_18px_50px_-12px_rgba(22,54,38,.45)] ring-1 ring-line'}`}>
          <header {...(movil ? {} : manejadores)} title={movil ? undefined : 'Arrastra para mover a Apolin'}
            className={`flex touch-none select-none items-center gap-3 bg-pine px-4 py-3 text-white ${movil ? '' : arrastrando ? 'cursor-grabbing' : 'cursor-grab'}`}>
            <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-2 ring-white/60">
              <img src={cara(estado.cara)} alt="" className="size-full origin-top translate-y-0.5 scale-[1.7] object-contain" />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block font-display text-lg font-bold">Apolin</span>
              <span className="block truncate text-[13px] text-white/80">
                {estado.usuario ? `${estado.usuario.nombre} · ${estado.usuario.departamento}` : 'Asistente virtual de Sistemas'}
              </span>
            </span>
            {!movil && (
              <button type="button" data-no-arrastrar onClick={alternarAmplio} className="rounded-xl p-2 text-white/80 hover:bg-white/10 hover:text-white"
                title={amplio ? 'Achicar' : 'Agrandar'} aria-label={amplio ? 'Achicar el chat' : 'Agrandar el chat'} aria-pressed={amplio}>
                {amplio ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
              </button>
            )}
            <button type="button" data-no-arrastrar onClick={reiniciar} className="rounded-xl p-2 text-white/80 hover:bg-white/10 hover:text-white" title="Empezar de nuevo" aria-label="Empezar una conversación nueva">
              <RotateCcw className="size-5" />
            </button>
            <button type="button" data-no-arrastrar onClick={() => setAbierto(false)} className="rounded-xl p-2 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Cerrar Apolin">
              <X className="size-5" />
            </button>
          </header>

          <ol ref={lista} className="flex flex-1 flex-col gap-2.5 overflow-y-auto bg-sage-50 px-4 py-4" aria-live="polite" aria-relevant="additions">
            {estado.mensajes.map((m, i) => <Burbuja key={i} m={m} onNavegar={() => setAbierto(false)} />)}
            {cargando && (
              <li className="flex items-center gap-2 self-start rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-muted ring-1 ring-line" aria-label="Apolin está escribiendo">
                <span className="flex gap-1">{[0, 1, 2].map((k) => <span key={k} className="size-1.5 animate-bounce rounded-full bg-pine-600" style={{ animationDelay: `${k * 120}ms` }} />)}</span>
                {lento && <span className="text-sm">Pensando la respuesta…</span>}
              </li>
            )}
            {!cargando && estado.opciones.length > 0 && (
              <li className="flex flex-wrap gap-1.5 pt-1">
                {estado.opciones.map((o) => (
                  <button key={o} type="button" onClick={() => enviar(o)}
                    className="rounded-full bg-white px-3.5 py-1.5 text-left text-sm font-bold text-pine ring-1 ring-pine/30 transition-colors hover:bg-pine hover:text-white">
                    {o}
                  </button>
                ))}
              </li>
            )}
          </ol>

          {estado.entrada && (
            <form onSubmit={(e) => { e.preventDefault(); enviar(texto, estado.entrada === 'fecha' && /^\d{4}-/.test(texto) ? fechaLegible(texto) : texto); }}
              className="flex items-center gap-2 border-t border-line bg-white p-3">
              <input ref={campo} value={texto} onChange={(e) => setTexto(e.target.value)} disabled={cargando}
                type={estado.entrada === 'fecha' ? 'date' : 'text'} min={estado.entrada === 'fecha' ? hoyIso() : undefined}
                inputMode={estado.entrada === 'numero' ? 'numeric' : undefined} maxLength={estado.entrada === 'numero' ? 10 : 1000}
                placeholder={estado.sugerencia} aria-label={estado.sugerencia || 'Mensaje para Apolin'} autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-white px-3.5 text-ink placeholder:text-muted/70 focus:border-pine-600 focus:outline-none focus:ring-4 focus:ring-sage/60" />
              <button type="submit" disabled={cargando || !texto.trim()} aria-label="Enviar"
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-pine text-white hover:bg-pine-800 disabled:bg-pine/40">
                {cargando ? <LoaderCircle className="size-5 animate-spin" /> : <SendHorizontal className="size-5" />}
              </button>
            </form>
          )}
        </section>
      )}

      <button ref={boton} type="button" {...manejadores} onKeyDown={moverConTeclado}
        onClick={() => { if (!fueArrastre()) setAbierto((a) => !a); }} aria-expanded={abierto}
        aria-label={abierto ? 'Cerrar Apolin' : 'Abrir Apolin, asistente virtual de Sistemas. Alt y las flechas para moverlo'}
        title="Apolin: clic para hablar, arrástralo para moverlo"
        style={{ left: pos.x, top: pos.y, zIndex: Z + 1 }}
        className={`group fixed size-20 touch-none select-none sm:size-24 ${arrastrando ? 'scale-110 cursor-grabbing' : 'cursor-grab transition-transform hover:scale-105 focus-visible:scale-105'} ${abierto && movil ? 'hidden' : ''}`}>
        <img src={cara(arrastrando ? 'divertido' : abierto ? estado.cara : 'sonriente')} alt="" draggable={false}
          className={`size-full object-contain ${arrastrando ? 'drop-shadow-[0_16px_18px_rgba(22,54,38,.4)]' : 'drop-shadow-[0_6px_10px_rgba(22,54,38,.35)]'}`} />
        {!abierto && !arrastrando && (
          <span className={`pointer-events-none absolute mb-1 hidden whitespace-nowrap rounded-xl bg-white px-3 py-1.5 text-sm font-bold text-pine-800 shadow-lg ring-1 ring-line group-hover:block ${
            pos.y < 60 ? 'top-full mt-1' : 'bottom-full'} ${pos.x > ancho / 2 ? 'right-2' : 'left-2'}`}>
            ¿Te ayudo?
          </span>
        )}
      </button>
    </>
  );
}
