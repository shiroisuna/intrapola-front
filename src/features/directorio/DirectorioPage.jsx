import { useMemo, useState } from 'react';
import { Mail, Phone, Siren, Wrench, Users } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Cargando, ErrorCarga, Vacio } from '../../components/ui/Feedback.jsx';
import { Buscador } from '../../components/ui/Buscador.jsx';
import { normalizar } from '../../utils/texto.js';
import { useApi } from '../../hooks/useApi.js';

const PESTANAS = [
  { id: 'extensiones', texto: 'Extensiones', icono: Users },
  { id: 'emergencias', texto: 'Emergencias', icono: Siren },
  { id: 'proveedores', texto: 'Proveedores de servicio', icono: Wrench },
];

function Extensiones() {
  const { data, loading, error, recargar } = useApi('/directorio/extensiones');
  const [q, setQ] = useState('');

  const grupos = useMemo(() => {
    const n = normalizar(q);
    const filtrados = (data ?? []).filter((x) => normalizar(`${x.nombre} ${x.departamento} ${x.extension} ${x.correo ?? ''}`).includes(n));
    return filtrados.reduce((acc, x) => ((acc[x.departamento] ||= []).push(x), acc), {});
  }, [data, q]);

  if (loading) return <Cargando />;
  if (error) return <ErrorCarga error={error} onReintentar={recargar} />;

  return (
    <>
      <Buscador valor={q} onCambio={setQ} placeholder="Nombre, departamento o extensión" etiqueta="Buscar en el directorio" className="mb-6 max-w-md" />
      {Object.keys(grupos).length === 0 ? (
        <Vacio icono={Phone} titulo="Nadie coincide con la búsqueda">Prueba con el apellido o el número de extensión.</Vacio>
      ) : (
        <div className="grid gap-x-8 gap-y-8 lg:grid-cols-2">
          {Object.entries(grupos).map(([depto, personas]) => (
            <section key={depto} aria-labelledby={`d-${depto}`}>
              <h2 id={`d-${depto}`} className="mb-2 border-b-2 border-sage pb-1.5 text-lg font-bold text-pine">{depto}</h2>
              <ul>
                {personas.map((p) => (
                  <li key={`${p.nombre}-${p.extension}`} className="flex items-center gap-4 border-b border-line py-2.5 last:border-0">
                    <span className="w-14 shrink-0 font-display text-2xl font-bold tabular-nums text-pine" aria-label={`Extensión ${p.extension}`}>{p.extension}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block ${p.esPersona ? 'font-bold' : 'text-muted'}`}>{p.nombre}</span>
                      {p.correo && (
                        <a href={`mailto:${p.correo}`} className="inline-flex max-w-full items-center gap-1.5 text-[15px] text-pine-600 hover:underline">
                          <Mail className="size-3.5 shrink-0" aria-hidden /><span className="truncate">{p.correo}</span>
                        </a>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function Contactos({ endpoint, vacio }) {
  const { data, loading, error, recargar } = useApi(endpoint);
  if (loading) return <Cargando />;
  if (error) return <ErrorCarga error={error} onReintentar={recargar} />;
  if (!data?.length) return <Vacio icono={Phone} titulo={vacio} />;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {data.map((c) => (
        <li key={c.id} className="rounded-2xl bg-white p-5 ring-1 ring-line">
          <p className="font-bold">{c.nombre}</p>
          {c.servicio && <p className="text-muted">{c.servicio}</p>}
          <a href={`tel:${c.telefono.replace(/[^\d+]/g, '')}`} className="mt-2 inline-flex items-center gap-2 font-display text-xl font-bold text-pine hover:underline">
            <Phone className="size-4" aria-hidden />{c.telefono}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function DirectorioPage() {
  const [tab, setTab] = useState('extensiones');
  return (
    <>
      <PageHeader titulo="Directorio" descripcion="Extensiones telefónicas y correos de todos los departamentos." />
      <div role="tablist" aria-label="Secciones del directorio" className="mb-6 flex flex-wrap gap-2">
        {PESTANAS.map(({ id, texto, icono: Icono }) => (
          <button key={id} role="tab" type="button" aria-selected={tab === id} aria-controls={`panel-${id}`} id={`tab-${id}`} onClick={() => setTab(id)}
            className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 font-bold ring-1 ring-inset ${tab === id ? 'bg-pine text-white ring-pine' : 'bg-white ring-line hover:bg-sage-50'}`}>
            <Icono className="size-[18px]" aria-hidden />{texto}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'extensiones' && <Extensiones />}
        {tab === 'emergencias' && <Contactos endpoint="/directorio/emergencias" vacio="No hay números de emergencia cargados" />}
        {tab === 'proveedores' && <Contactos endpoint="/directorio/proveedores" vacio="No hay proveedores cargados" />}
      </div>
    </>
  );
}
