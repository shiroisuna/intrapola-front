import { Link } from 'react-router-dom';
import { Cake, CalendarDays, ChevronRight } from 'lucide-react';
import { SOLICITUDES } from '../../config/navegacion.js';
import { useApi } from '../../hooks/useApi.js';
import { archivoUrl } from '../../api/client.js';
import { Carrusel } from '../../components/Carrusel.jsx';
import { ComunicadosInicio } from '../comunicados/ComunicadosInicio.jsx';
import { fechaLarga, fechaCorta, saludo } from '../../utils/fechas.js';

function Lanzador() {
  return (
    <section aria-labelledby="t-lanzador" className="rounded-3xl bg-white p-2 ring-1 ring-line">
      <h2 id="t-lanzador" className="px-4 pb-2 pt-4 text-xl font-bold">¿Qué necesitas solicitar?</h2>
      <ul className="grid sm:grid-cols-2">
        {SOLICITUDES.map(({ slug, titulo, descripcion, icono: Icono }) => (
          <li key={slug}>
            <Link to={`/solicitudes/${slug}`} className="group flex h-full items-start gap-4 rounded-2xl p-4 transition-colors hover:bg-sage-50">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sage text-pine-800 transition-colors group-hover:bg-pine group-hover:text-sage">
                <Icono className="size-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-ink">{titulo}</span>
                <span className="block text-[15px] leading-snug text-muted">{descripcion}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CumpleHoy() {
  const { data, error } = useApi('/cumpleanos');
  if (error) return null; // sin fuente de datos todavía: no mostrar un "no hay cumpleaños" engañoso
  const dia = new Date().getDate();
  const hoy = data?.cumpleaneros?.filter((c) => c.dia === dia) ?? [];
  const proximos = data?.cumpleaneros?.filter((c) => c.dia > dia).slice(0, 3) ?? [];

  return (
    <section aria-labelledby="t-cumple" className="rounded-3xl bg-biscuit-100 p-6">
      <div className="flex items-center gap-2 text-[#7a4e10]">
        <Cake className="size-5" aria-hidden />
        <h2 id="t-cumple" className="text-lg font-bold text-[#5c3a0b]">Cumpleañeros de hoy</h2>
      </div>
      {hoy.length ? (
        <ul className="mt-3 space-y-1.5">
          {hoy.map((c) => (
            <li key={`${c.nombres}${c.apellidos}`}>
              <span className="font-display text-xl font-semibold capitalize text-[#3f2808]">{`${c.nombres} ${c.apellidos}`.toLowerCase()}</span>
              <span className="block text-[15px] text-[#7a4e10]">{c.departamento}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[#7a4e10]">Hoy no hay cumpleaños registrados.</p>
      )}
      {proximos.length > 0 && (
        <p className="mt-4 border-t border-[#d99a3a]/30 pt-3 text-[15px] text-[#7a4e10]">
          Próximos: {proximos.map((c) => `${c.nombres.split(' ')[0]} (${c.dia})`).join(', ')}
        </p>
      )}
      <Link to="/cumpleanos" className="mt-4 inline-flex items-center gap-1 font-bold text-[#5c3a0b] hover:underline">
        Ver todos los del mes <ChevronRight className="size-4" aria-hidden />
      </Link>
    </section>
  );
}

/** Últimos eventos (galerías de fotos). Se oculta si no hay eventos o si el módulo falla. */
function EventosRecientes() {
  const { data } = useApi('/eventos?limite=30');
  const eventos = (data ?? []).slice(0, 3);
  if (!eventos.length) return null;
  return (
    <section aria-labelledby="t-eventos" className="rounded-3xl bg-white p-6 ring-1 ring-line">
      <div className="flex items-center gap-2">
        <CalendarDays className="size-5 text-pine-600" aria-hidden />
        <h2 id="t-eventos" className="text-lg font-bold">Eventos</h2>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {eventos.map((e) => {
          const Elemento = e.enlace ? 'a' : 'div';
          return (
            <li key={e.id}>
              <Elemento {...(e.enlace ? { href: e.enlace, target: '_blank', rel: 'noreferrer' } : {})}
                className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-sage-50">
                <span className="size-14 shrink-0 overflow-hidden rounded-xl bg-sage-100">
                  {e.imagenUrl && <img src={archivoUrl(e.imagenUrl)} alt="" className="size-full object-cover" loading="lazy" />}
                </span>
                <span className="min-w-0">
                  <span className="block font-bold leading-snug">{e.titulo}</span>
                  {e.fecha
                    ? <span className="text-sm text-muted">{fechaCorta(e.fecha)}</span>
                    : e.enlace && <span className="text-sm text-muted">Ver fotos</span>}
                </span>
              </Elemento>
            </li>
          );
        })}
      </ul>
      <Link to="/eventos" className="mt-3 inline-flex items-center gap-1 font-bold text-pine hover:underline">
        Ver todos <ChevronRight className="size-4" aria-hidden />
      </Link>
    </section>
  );
}

function Productos({ productos }) {
  if (!productos?.length) return null;
  return (
    <section aria-labelledby="t-productos" className="mt-14">
      <h2 id="t-productos" className="text-2xl font-bold">Lo que hacemos</h2>
      <ul className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {productos.map((p) => (
          <li key={p.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
            <div className="grid aspect-[4/3] place-items-center bg-sage-50">
              {p.imagenUrl
                ? <img src={archivoUrl(p.imagenUrl)} alt={p.nombre} className="size-full object-contain p-3" loading="lazy" />
                : <span className="font-display text-2xl font-bold text-pine/40">{p.marca}</span>}
            </div>
            <div className="p-4">
              <p className="font-bold">{p.nombre}</p>
              <p className="text-[15px] text-muted">{p.presentacion}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function InicioPage() {
  const { data } = useApi('/contenido/inicio');

  return (
    <>
      <div className="animar-entrada">
        <header className="mb-8">
          <p className="text-[17px] text-muted first-letter:uppercase">{fechaLarga(new Date())}</p>
          <h1 className="mt-1 text-4xl font-bold sm:text-5xl">{saludo()}</h1>
        </header>

        {data?.banners?.length > 0 && <div className="mb-6"><Carrusel banners={data.banners} /></div>}

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <Lanzador />
          <div className="flex flex-col gap-6">
            <ComunicadosInicio comunicados={data?.comunicados} />
            <CumpleHoy />
            <EventosRecientes />
          </div>
        </div>
      </div>

      <Productos productos={data?.productos} />

      {data?.empresa?.mision && (
        <section className="mt-14 grid gap-8 border-t border-line pt-10 md:grid-cols-3">
          <div>
            <h2 className="text-lg font-bold text-pine">Misión</h2>
            <p className="mt-2 text-muted">{data.empresa.mision}</p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-pine">Visión</h2>
            <p className="mt-2 text-muted">{data.empresa.vision}</p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-pine">Valores</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {data.empresa.valores.map((v) => (
                <li key={v} className="rounded-full bg-sage-100 px-3 py-1 text-[15px] font-bold text-pine-800">{v}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
