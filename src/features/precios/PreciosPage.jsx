import { useMemo, useState } from 'react';
import { Tags } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Cargando, ErrorCarga, Vacio } from '../../components/ui/Feedback.jsx';
import { Buscador } from '../../components/ui/Buscador.jsx';
import { normalizar } from '../../utils/texto.js';
import { useApi } from '../../hooks/useApi.js';

const moneda = (v, m) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: m || 'USD' }).format(v);

export default function PreciosPage() {
  const { data, loading, error, recargar } = useApi('/precios');
  const [q, setQ] = useState('');
  const [marca, setMarca] = useState('');

  const marcas = useMemo(() => [...new Set((data ?? []).map((p) => p.marca).filter(Boolean))], [data]);
  const filtrados = useMemo(() => (data ?? []).filter((p) =>
    (!marca || p.marca === marca) && normalizar(`${p.codigo} ${p.descripcion} ${p.presentacion ?? ''}`).includes(normalizar(q))),
  [data, q, marca]);

  return (
    <>
      <PageHeader titulo="Lista de precios" descripcion="Precios vigentes de nuestros productos." />
      {loading && <Cargando />}
      {error && <ErrorCarga error={error} onReintentar={recargar} />}
      {data && !data.length && <Vacio icono={Tags} titulo="No hay precios cargados" />}
      {data?.length > 0 && (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Buscador valor={q} onCambio={setQ} placeholder="Código o producto" className="w-full sm:w-80" />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por marca">
              {['', ...marcas].map((m) => (
                <button key={m || 'todas'} type="button" onClick={() => setMarca(m)} aria-pressed={marca === m}
                  className={`h-10 rounded-full px-4 font-bold ring-1 ring-inset ${marca === m ? 'bg-pine text-white ring-pine' : 'bg-white ring-line hover:bg-sage-50'}`}>
                  {m || 'Todas'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-line">
            <table className="w-full min-w-[36rem] text-left">
              <thead className="bg-sage-50 text-[15px] text-pine-800">
                <tr>
                  <th scope="col" className="px-5 py-3">Código</th>
                  <th scope="col" className="px-5 py-3">Producto</th>
                  <th scope="col" className="px-5 py-3">Presentación</th>
                  <th scope="col" className="px-5 py-3 text-right">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtrados.map((p) => (
                  <tr key={p.codigo} className="hover:bg-sage-50/50">
                    <td className="px-5 py-3 text-muted tabular-nums">{p.codigo}</td>
                    <td className="px-5 py-3 font-bold">{p.descripcion}</td>
                    <td className="px-5 py-3">{p.presentacion}</td>
                    <td className="px-5 py-3 text-right font-bold tabular-nums">{moneda(p.precio, p.moneda)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtrados.length === 0 && <p className="px-5 py-8 text-center text-muted">Ningún producto coincide con la búsqueda.</p>}
          </div>
        </>
      )}
    </>
  );
}
