import { Megaphone } from 'lucide-react';
import { archivoUrl } from '../../api/client.js';
import { fechaCorta } from '../../utils/fechas.js';

/** Lista de comunicados con miniatura y marca de no leído. compacta = versión del inicio. */
export function ListaComunicados({ comunicados, esLeido, onAbrir, compacta = false }) {
  return (
    <ul className={compacta ? 'divide-y divide-line' : 'divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line'}>
      {comunicados.map((c) => {
        const nuevo = !esLeido(c.id);
        const detalle = [c.publicadoEn && fechaCorta(c.publicadoEn), nuevo && 'sin leer'].filter(Boolean).join(' · ');
        return (
          <li key={c.id}>
            <button type="button" onClick={() => onAbrir(c)}
              className={`flex w-full items-center gap-3 text-left hover:bg-sage-50 ${compacta ? '-mx-2 rounded-xl px-2 py-2.5' : 'px-5 py-4'}`}>
              <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-sage-100 ${compacta ? 'size-14' : 'size-20'}`}>
                {c.imagenUrl
                  ? <img src={archivoUrl(c.imagenUrl)} alt="" className="size-full object-cover" loading="lazy" />
                  : <Megaphone className="size-5 text-pine-600" aria-hidden />}
                {nuevo && <span className="absolute right-1 top-1 size-2.5 rounded-full bg-pine-600 ring-2 ring-white" aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2">
                  <span className={`${nuevo ? 'font-bold' : 'font-normal'} text-ink`}>{c.titulo}</span>
                  {c.prioridad === 'URGENTE' && <span className="rounded-full bg-biscuit-100 px-2 text-xs font-bold leading-5 text-[#7a4e10]">Importante</span>}
                </span>
                {!compacta && c.resumen && <span className="mt-0.5 block text-muted">{c.resumen}</span>}
                {detalle && <span className="block text-sm text-muted">{detalle}</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
