import { useState } from 'react';
import { Cake, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Cargando, ErrorCarga, Vacio } from '../../components/ui/Feedback.jsx';
import { useApi } from '../../hooks/useApi.js';
import { MESES } from '../../utils/fechas.js';

const capitalizar = (s) => s.toLowerCase().replace(/(^|\s)\p{L}/gu, (m) => m.toUpperCase());

export default function CumpleanosPage() {
  const ahora = new Date();
  const [mes, setMes] = useState(ahora.getMonth() + 1);
  const { data, loading, error, recargar } = useApi(`/cumpleanos?mes=${mes}`);
  const esMesActual = mes === ahora.getMonth() + 1;
  const hoy = ahora.getDate();

  // Agrupa por día
  const porDia = (data?.cumpleaneros ?? []).reduce((acc, c) => ((acc[c.dia] ||= []).push(c), acc), {});
  const mover = (d) => setMes((m) => ((m - 1 + d + 12) % 12) + 1);

  return (
    <>
      <PageHeader
        titulo="Cumpleañeros"
        descripcion="Felicita a tus compañeros en su día."
        acciones={
          <div className="flex items-center gap-1 rounded-xl bg-white p-1 ring-1 ring-line">
            <Button variante="fantasma" tamano="icono" icono={ChevronLeft} onClick={() => mover(-1)} aria-label="Mes anterior" />
            <span className="w-28 text-center font-display text-lg font-bold capitalize" aria-live="polite">{MESES[mes - 1]}</span>
            <Button variante="fantasma" tamano="icono" icono={ChevronRight} onClick={() => mover(1)} aria-label="Mes siguiente" />
          </div>
        }
      />

      {loading && <Cargando />}
      {error && <ErrorCarga error={error} onReintentar={recargar} />}
      {data && !data.cumpleaneros.length && <Vacio icono={Cake} titulo={`No hay cumpleaños registrados en ${MESES[mes - 1]}`} />}

      {data?.cumpleaneros?.length > 0 && (
        <ol className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Object.entries(porDia).map(([dia, personas]) => {
            const esHoy = esMesActual && Number(dia) === hoy;
            const pasado = esMesActual && Number(dia) < hoy;
            return (
              <li key={dia} className={`flex gap-4 rounded-2xl p-4 ${esHoy ? 'bg-biscuit-100 ring-2 ring-biscuit' : 'bg-white ring-1 ring-line'} ${pasado ? 'opacity-60' : ''}`}>
                <span className={`w-12 shrink-0 text-center font-display font-bold leading-none ${esHoy ? 'text-[#7a4e10]' : 'text-pine'}`}>
                  <span className="block text-4xl">{dia}</span>
                  {esHoy && <span className="text-xs">hoy</span>}
                </span>
                <ul className="min-w-0 space-y-1.5 pt-0.5">
                  {personas.map((p) => (
                    <li key={`${p.nombres}${p.apellidos}`}>
                      <span className="block font-bold">{capitalizar(`${p.nombres} ${p.apellidos}`)}</span>
                      {p.departamento && <span className="block text-[15px] text-muted">{p.departamento}</span>}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
