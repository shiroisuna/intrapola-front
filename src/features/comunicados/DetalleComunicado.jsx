import { useEffect, useRef } from 'react';
import { Paperclip, X } from 'lucide-react';
import { archivoUrl } from '../../api/client.js';
import { fechaLarga } from '../../utils/fechas.js';

/**
 * Lectura de un comunicado en un panel lateral (escritorio) u hoja inferior (móvil).
 * Usa <dialog> nativo: atrapa el foco, cierra con Esc y con clic fuera.
 */
export function DetalleComunicado({ comunicado, onCerrar }) {
  const ref = useRef(null);
  const soloImagen = comunicado?.imagenUrl && !comunicado?.contenido;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (comunicado && !d.open) d.showModal();
    if (!comunicado && d.open) d.close();
  }, [comunicado]);

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onClick={(e) => { if (e.target === ref.current) ref.current.close(); }}
      aria-labelledby="titulo-comunicado"
      className={`m-0 mt-auto max-h-[92dvh] w-full max-w-none rounded-t-3xl bg-white p-0 text-ink backdrop:bg-ink/40 sm:ml-auto sm:mt-0 sm:h-dvh sm:max-h-none sm:rounded-none sm:rounded-l-3xl ${soloImagen ? 'sm:w-[46rem]' : 'sm:w-[34rem]'}`}
    >
      {comunicado && (
        <article className="flex h-full flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div>
              {comunicado.prioridad === 'URGENTE' && (
                <span className="mb-2 inline-flex rounded-full bg-biscuit-100 px-2.5 py-0.5 text-sm font-bold text-[#7a4e10]">Importante</span>
              )}
              <h2 id="titulo-comunicado" className="text-2xl font-bold">{comunicado.titulo}</h2>
              {comunicado.publicadoEn && <p className="mt-1 text-[15px] text-muted first-letter:uppercase">{fechaLarga(comunicado.publicadoEn)}</p>}
            </div>
            <button type="button" onClick={() => ref.current?.close()} className="rounded-xl p-2 text-muted hover:bg-sage-100 hover:text-ink" aria-label="Cerrar comunicado" autoFocus>
              <X className="size-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {comunicado.imagenUrl && (
              <a href={archivoUrl(comunicado.imagenUrl)} target="_blank" rel="noreferrer" title="Abrir la imagen en tamaño completo">
                <img src={archivoUrl(comunicado.imagenUrl)} alt={comunicado.textoAlternativo || comunicado.titulo} className={`w-full rounded-2xl ring-1 ring-line ${comunicado.contenido ? 'mb-5' : ''}`} />
              </a>
            )}
            {comunicado.contenido && <div className="whitespace-pre-line text-[17px] leading-relaxed">{comunicado.contenido}</div>}
            {comunicado.adjuntoUrl && (
              <a href={archivoUrl(comunicado.adjuntoUrl)} target="_blank" rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sage-100 px-4 py-2.5 font-bold text-pine-800 hover:bg-sage-200">
                <Paperclip className="size-4" aria-hidden /> Abrir documento adjunto
              </a>
            )}
          </div>
        </article>
      )}
    </dialog>
  );
}
