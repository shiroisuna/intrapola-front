import { Link } from 'react-router-dom';
import { ChevronRight, Inbox } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { SOLICITUDES } from '../../config/navegacion.js';

const AREAS = ['Recursos Humanos', 'Servicios', 'Sistemas'];

export default function SolicitudesPage() {
  return (
    <>
      <PageHeader
        titulo="Solicitudes"
        descripcion="Elige el tipo de solicitud. Solo necesitas tu cédula: tus datos se completan solos."
        acciones={
          <Link to="/solicitudes/mis-solicitudes" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 font-bold text-pine ring-1 ring-inset ring-line hover:bg-sage-50">
            <Inbox className="size-[18px]" aria-hidden /> Mis solicitudes
          </Link>
        }
      />

      <div className="grid gap-10">
        {AREAS.map((area) => (
          <section key={area} aria-labelledby={`area-${area}`}>
            <h2 id={`area-${area}`} className="mb-3 text-xl font-bold text-pine">{area}</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
              {SOLICITUDES.filter((s) => s.area === area).map(({ slug, titulo, descripcion, icono: Icono }) => (
                <li key={slug}>
                  <Link to={`/solicitudes/${slug}`} className="group flex items-center gap-4 px-5 py-4 hover:bg-sage-50">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sage text-pine-800">
                      <Icono className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[17px] font-bold">{titulo}</span>
                      <span className="block text-muted">{descripcion}</span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-pine" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
