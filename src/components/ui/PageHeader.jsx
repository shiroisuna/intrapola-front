import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PageHeader({ titulo, descripcion, volver, acciones }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {volver && (
          <Link to={volver.to} className="mb-3 inline-flex items-center gap-1.5 rounded-lg text-[15px] font-bold text-pine-600 hover:text-pine">
            <ArrowLeft className="size-4" aria-hidden /> {volver.texto}
          </Link>
        )}
        <h1 className="text-3xl font-bold sm:text-[2.5rem]">{titulo}</h1>
        {descripcion && <p className="mt-2 text-[17px] text-muted">{descripcion}</p>}
      </div>
      {acciones && <div className="flex gap-2">{acciones}</div>}
    </header>
  );
}
