import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { archivoUrl } from '../api/client.js';

const INTERVALO = 6000;
const reduceMovimiento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Carrusel de banners: transición por fundido, avance automático (se pausa al pasar el
 * mouse, al enfocar con teclado o con la pestaña oculta), flechas, puntos y deslizar en móvil.
 * Las imágenes de cualquier proporción se ven completas sobre un fondo difuminado de sí mismas.
 */
export function Carrusel({ banners = [] }) {
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(reduceMovimiento);
  const [enfocado, setEnfocado] = useState(false);
  const inicioToque = useRef(null);
  const total = banners.length;

  const ir = useCallback((i) => setActual(((i % total) + total) % total), [total]);

  useEffect(() => {
    if (total < 2 || pausado || enfocado) return undefined;
    const t = setInterval(() => { if (!document.hidden) setActual((i) => (i + 1) % total); }, INTERVALO);
    return () => clearInterval(t);
  }, [total, pausado, enfocado]);

  if (!total) return null;

  const onPointerDown = (e) => { inicioToque.current = e.clientX; };
  const onPointerUp = (e) => {
    if (inicioToque.current == null) return;
    const dx = e.clientX - inicioToque.current;
    inicioToque.current = null;
    if (Math.abs(dx) > 50) ir(actual + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Anuncios"
      className="group relative overflow-hidden rounded-3xl bg-pine-800 ring-1 ring-line"
      onMouseEnter={() => setEnfocado(true)}
      onMouseLeave={() => setEnfocado(false)}
      onFocus={() => setEnfocado(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setEnfocado(false); }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') ir(actual - 1);
        if (e.key === 'ArrowRight') ir(actual + 1);
      }}
    >
      <div
        className="relative aspect-[16/9] touch-pan-y select-none sm:aspect-[16/7] lg:aspect-[16/5]"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        aria-live={pausado || enfocado ? 'polite' : 'off'}
      >
        {banners.map((b, i) => {
          const visible = i === actual;
          const img = archivoUrl(b.imagenUrl);
          const contenido = (
            <>
              <img src={img} alt="" aria-hidden className="absolute inset-0 size-full scale-110 object-cover opacity-60 blur-2xl" draggable={false} />
              <img src={img} alt={b.titulo} className="relative size-full object-contain" draggable={false} loading={i === 0 ? 'eager' : 'lazy'} />
            </>
          );
          return (
            <div
              key={b.id}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${total}: ${b.titulo}`}
              aria-hidden={!visible}
              className={`absolute inset-0 transition-opacity duration-700 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              {b.enlace ? (
                <a href={b.enlace} tabIndex={visible ? 0 : -1} target={/^https?:/.test(b.enlace) ? '_blank' : undefined} rel="noreferrer" className="block size-full">
                  {contenido}
                </a>
              ) : contenido}
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <>
          <button type="button" onClick={() => ir(actual - 1)} aria-label="Anuncio anterior"
            className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-pine-800 shadow-sm transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={() => ir(actual + 1)} aria-label="Anuncio siguiente"
            className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-pine-800 shadow-sm transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100">
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 bg-gradient-to-t from-black/45 to-transparent px-4 pb-3 pt-8">
            <div className="flex items-center gap-1.5">
              {banners.map((b, i) => (
                <button key={b.id} type="button" onClick={() => ir(i)} aria-label={`Ir al anuncio ${i + 1}`} aria-current={i === actual}
                  className="grid h-6 place-items-center px-0.5">
                  <span className={`block h-1.5 rounded-full transition-all ${i === actual ? 'w-6 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80'}`} />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setPausado((p) => !p)} aria-label={pausado ? 'Reanudar anuncios' : 'Pausar anuncios'}
              className="grid size-7 place-items-center rounded-full text-white/85 hover:bg-white/15 hover:text-white">
              {pausado ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
