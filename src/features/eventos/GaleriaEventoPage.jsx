import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download, Images, X } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Cargando, ErrorCarga, Vacio } from '../../components/ui/Feedback.jsx';
import { useApi } from '../../hooks/useApi.js';
import { archivoUrl } from '../../api/client.js';

/** Visor a pantalla completa: flechas del teclado, Escape para cerrar. */
function Visor({ fotos, indice, onCambiar, onCerrar }) {
  const ir = useCallback((d) => onCambiar((indice + d + fotos.length) % fotos.length), [indice, fotos.length, onCambiar]);
  useEffect(() => {
    const tecla = (e) => {
      if (e.key === 'Escape') onCerrar();
      if (e.key === 'ArrowRight') ir(1);
      if (e.key === 'ArrowLeft') ir(-1);
    };
    window.addEventListener('keydown', tecla);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', tecla); document.body.style.overflow = ''; };
  }, [ir, onCerrar]);

  const url = archivoUrl(fotos[indice].url);
  const boton = 'grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20';
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0d1410]/95" role="dialog" aria-modal="true" aria-label={`Foto ${indice + 1} de ${fotos.length}`}>
      <div className="flex items-center justify-between gap-2 p-3 text-white">
        <span className="px-2 text-sm tabular-nums">{indice + 1} / {fotos.length}</span>
        <span className="flex gap-2">
          <a href={url} download className={boton} aria-label="Descargar foto"><Download className="size-5" /></a>
          <button type="button" onClick={onCerrar} className={boton} aria-label="Cerrar" autoFocus><X className="size-5" /></button>
        </span>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6 sm:px-16" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
        <img src={url} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
        {fotos.length > 1 && (
          <>
            <button type="button" onClick={() => ir(-1)} className={`${boton} absolute left-2 sm:left-4`} aria-label="Foto anterior"><ChevronLeft className="size-6" /></button>
            <button type="button" onClick={() => ir(1)} className={`${boton} absolute right-2 sm:right-4`} aria-label="Foto siguiente"><ChevronRight className="size-6" /></button>
          </>
        )}
      </div>
    </div>
  );
}

export default function GaleriaEventoPage() {
  const { id } = useParams();
  const { data, loading, error, recargar } = useApi(`/eventos/${id}`);
  const [abierta, setAbierta] = useState(null);
  const cerrar = useCallback(() => setAbierta(null), []);

  return (
    <>
      <PageHeader titulo={data?.titulo ?? 'Evento'} volver={{ to: '/eventos', texto: 'Eventos' }}
        descripcion={data ? `${data.fotos.length} ${data.fotos.length === 1 ? 'foto' : 'fotos'}` : null} />
      {loading && <Cargando />}
      {error && <ErrorCarga error={error} onReintentar={recargar} />}
      {data && !data.fotos.length && <Vacio icono={Images} titulo="Este evento todavía no tiene fotos" />}
      {data?.fotos.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {data.fotos.map((f, i) => (
            <li key={f.archivo}>
              <button type="button" onClick={() => setAbierta(i)} className="group block aspect-square w-full overflow-hidden rounded-xl bg-sage-50" aria-label={`Ver foto ${i + 1}`}>
                <img src={archivoUrl(f.url)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {abierta != null && <Visor fotos={data.fotos} indice={abierta} onCambiar={setAbierta} onCerrar={cerrar} />}
    </>
  );
}
