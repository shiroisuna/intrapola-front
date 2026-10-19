import { useMemo, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { useApi } from '../hooks/useApi.js';
import { archivoUrl } from '../api/client.js';
import { Buscador } from './ui/Buscador.jsx';
import { normalizar } from '../utils/texto.js';
import { Cargando, ErrorCarga, Vacio } from './ui/Feedback.jsx';

const extension = (url = '') => (url.split('?')[0].match(/\.([a-z0-9]+)$/i)?.[1] || '').toUpperCase();

/** Lista de documentos descargables con búsqueda (usada por Normas y Formatos). */
export function ListaDocumentos({ endpoint, vacio }) {
  const { data, loading, error, recargar } = useApi(endpoint);
  const [q, setQ] = useState('');
  const filtrados = useMemo(
    () => (data ?? []).filter((d) => normalizar(`${d.titulo} ${d.descripcion ?? ''}`).includes(normalizar(q))),
    [data, q],
  );

  if (loading) return <Cargando />;
  if (error) return <ErrorCarga error={error} onReintentar={recargar} />;
  if (!data?.length) return <Vacio icono={FileText} titulo={vacio} />;

  return (
    <>
      {data.length > 6 && <Buscador valor={q} onCambio={setQ} placeholder="Buscar por nombre" className="mb-5 max-w-md" />}
      {filtrados.length === 0 ? (
        <Vacio icono={FileText} titulo="Ningún documento coincide">Prueba con otra palabra.</Vacio>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
          {filtrados.map((d) => (
            <li key={d.id}>
              <a href={archivoUrl(d.archivoUrl)} target="_blank" rel="noreferrer" className="group flex items-center gap-4 px-5 py-4 hover:bg-sage-50">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sage-100 text-xs font-bold text-pine-800">
                  {extension(d.archivoUrl) || <FileText className="size-5" aria-hidden />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{d.titulo}</span>
                  {d.descripcion && <span className="block text-muted">{d.descripcion}</span>}
                </span>
                <Download className="size-5 shrink-0 text-muted group-hover:text-pine" aria-label="Abrir" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
