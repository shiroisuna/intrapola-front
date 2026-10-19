import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Megaphone } from 'lucide-react';
import { useLeidos } from './useLeidos.js';
import { ListaComunicados } from './ListaComunicados.jsx';
import { DetalleComunicado } from './DetalleComunicado.jsx';

/**
 * Bloque de comunicados del inicio.
 * Reemplaza el modal que salía siempre: los comunicados quedan en una lista con marca de
 * "sin leer", y solo un comunicado marcado como URGENTE y no leído se abre solo, una vez.
 */
export function ComunicadosInicio({ comunicados = [] }) {
  const { esLeido, marcar } = useLeidos();
  const [abierto, setAbierto] = useState(null);
  const yaMostroUrgente = useRef(false);

  const abrir = (c) => { setAbierto(c); marcar(c.id); };

  useEffect(() => {
    if (yaMostroUrgente.current || !comunicados.length) return;
    yaMostroUrgente.current = true;
    // Se abre solo el primero urgente o destacado que la persona no haya visto
    const urgente = comunicados.find((c) => (c.prioridad === 'URGENTE' || c.destacado) && !esLeido(c.id));
    if (urgente) {
      const t = setTimeout(() => abrir(urgente), 600);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comunicados]);

  if (!comunicados.length) return null;
  const sinLeer = comunicados.filter((c) => !esLeido(c.id)).length;

  return (
    <section aria-labelledby="t-comunicados" className="rounded-3xl bg-white p-6 ring-1 ring-line">
      <div className="flex items-center gap-2">
        <Megaphone className="size-5 text-pine-600" aria-hidden />
        <h2 id="t-comunicados" className="text-lg font-bold">Comunicados</h2>
        {sinLeer > 0 && <span className="ml-auto rounded-full bg-pine px-2 text-sm font-bold leading-6 text-white">{sinLeer} sin leer</span>}
      </div>
      <div className="mt-3">
        <ListaComunicados comunicados={comunicados.slice(0, 4)} esLeido={esLeido} onAbrir={abrir} compacta />
      </div>
      <Link to="/comunicados" className="mt-3 inline-flex items-center gap-1 font-bold text-pine hover:underline">
        Ver todos <ChevronRight className="size-4" aria-hidden />
      </Link>
      <DetalleComunicado comunicado={abierto} onCerrar={() => setAbierto(null)} />
    </section>
  );
}
