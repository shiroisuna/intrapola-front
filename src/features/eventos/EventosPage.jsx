import { CalendarDays, ExternalLink, Images, MapPin } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Cargando, ErrorCarga, Vacio } from '../../components/ui/Feedback.jsx';
import { useApi } from '../../hooks/useApi.js';
import { archivoUrl } from '../../api/client.js';
import { fechaLarga } from '../../utils/fechas.js';

/** Tarjeta de evento: foto de portada, título y enlace a la galería (o fecha y lugar si los tiene). */
function Evento({ e }) {
  const contenido = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-sage-50">
        {e.imagenUrl
          ? <img src={archivoUrl(e.imagenUrl)} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />
          : <div className="grid size-full place-items-center"><Images className="size-10 text-sage-400" aria-hidden /></div>}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <h3 className="text-lg font-bold leading-snug">{e.titulo}</h3>
        {e.fecha && (
          <p className="flex items-center gap-1.5 text-[15px] text-muted first-letter:uppercase">
            <CalendarDays className="size-4" aria-hidden />{fechaLarga(e.fecha.slice(0, 10))}
          </p>
        )}
        {e.lugar && <p className="flex items-center gap-1.5 text-[15px] text-muted"><MapPin className="size-4" aria-hidden />{e.lugar}</p>}
        {e.descripcion && <p className="mt-1">{e.descripcion}</p>}
        {e.enlace && (
          <span className="mt-auto inline-flex items-center gap-1.5 pt-3 font-bold text-pine group-hover:underline">
            Ver fotos <ExternalLink className="size-4" aria-hidden />
          </span>
        )}
      </div>
    </>
  );

  const clase = 'group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-line';
  return (
    <li>
      {e.enlace
        ? <a href={e.enlace} target="_blank" rel="noreferrer" className={`${clase} hover:ring-sage-400`}>{contenido}</a>
        : <div className={clase}>{contenido}</div>}
    </li>
  );
}

export default function EventosPage() {
  const { data, loading, error, recargar } = useApi('/eventos?limite=30');

  return (
    <>
      <PageHeader titulo="Eventos" descripcion="Fotos de las actividades, jornadas y celebraciones de la empresa." />
      {loading && <Cargando />}
      {error && <ErrorCarga error={error} onReintentar={recargar} />}
      {data && !data.length && <Vacio icono={CalendarDays} titulo="No hay eventos publicados" />}
      {data?.length > 0 && (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((e) => <Evento key={e.id} e={e} />)}
        </ul>
      )}
    </>
  );
}
