import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { FORMATOS, GRUPOS_FORMATOS } from '../../config/formatos.js';

function Tarjeta({ slug, titulo, descripcion, icono: Icono, disponible }) {
  const contenido = (
    <>
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${disponible ? 'bg-sage text-pine-800' : 'bg-line/60 text-muted'}`}>
        <Icono className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className={`text-[17px] font-bold ${disponible ? '' : 'text-muted'}`}>{titulo}</span>
          {!disponible && <span className="rounded-full bg-biscuit-100 px-2 py-0.5 text-xs font-bold text-[#7a4e10]">Próximamente</span>}
        </span>
        <span className="block text-muted">{descripcion}</span>
      </span>
      {disponible && <ChevronRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-pine" aria-hidden />}
    </>
  );
  return disponible
    ? <Link to={`/formatos/${slug}`} className="group flex items-center gap-4 px-5 py-4 hover:bg-sage-50">{contenido}</Link>
    : <div className="flex items-center gap-4 px-5 py-4" aria-disabled="true">{contenido}</div>;
}

export default function FormatosPage() {
  return (
    <>
      <PageHeader titulo="Formatos" descripcion="Planillas para llenar en línea o descargar y entregar al área correspondiente." />
      <div className="grid gap-10">
        {GRUPOS_FORMATOS.map((grupo) => (
          <section key={grupo} aria-labelledby={`grupo-${grupo}`}>
            <h2 id={`grupo-${grupo}`} className="mb-3 text-xl font-bold text-pine">{grupo}</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
              {FORMATOS.filter((f) => f.grupo === grupo).map((f) => <li key={f.slug}><Tarjeta {...f} /></li>)}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
