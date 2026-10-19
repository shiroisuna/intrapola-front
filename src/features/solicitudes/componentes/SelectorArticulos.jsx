import { useState } from 'react';
import { Minus, Plus, Trash2, Package } from 'lucide-react';
import { Field, Select } from '../../../components/ui/Field.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Cargando, ErrorCarga } from '../../../components/ui/Feedback.jsx';
import { useApi } from '../../../hooks/useApi.js';

/**
 * Lista de artículos con cantidades. value: [{ articuloId, cantidad }]
 * Sustituye el flujo viejo de "Seleccionar + cantidad + Guardar" por una lista editable.
 */
export function SelectorArticulos({ categoria, value, onChange, error }) {
  const { data: articulos, loading, error: errCarga, recargar } = useApi(`/catalogos/articulos?categoria=${categoria}`);
  const [elegido, setElegido] = useState('');

  if (loading) return <Cargando texto="Cargando artículos…" />;
  if (errCarga) return <ErrorCarga error={errCarga} onReintentar={recargar} />;

  const porId = Object.fromEntries((articulos ?? []).map((a) => [a.id, a]));
  const disponibles = (articulos ?? []).filter((a) => !value.some((v) => v.articuloId === a.id));

  const agregar = () => {
    if (!elegido) return;
    onChange([...value, { articuloId: Number(elegido), cantidad: 1 }]);
    setElegido('');
  };
  const cambiar = (id, delta) =>
    onChange(value.map((v) => (v.articuloId === id ? { ...v, cantidad: Math.max(1, Math.min(999, v.cantidad + delta)) } : v)));
  const fijar = (id, n) =>
    onChange(value.map((v) => (v.articuloId === id ? { ...v, cantidad: Math.max(1, Math.min(999, Number(n) || 1)) } : v)));
  const quitar = (id) => onChange(value.filter((v) => v.articuloId !== id));

  return (
    <div className="grid gap-4">
      <div className="flex items-end gap-2">
        <Field label="Artículo" error={error} className="flex-1">
          <Select value={elegido} onChange={(e) => setElegido(e.target.value)}>
            <option value="">Seleccione un artículo</option>
            {disponibles.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </Select>
        </Field>
        <Button variante="suave" icono={Plus} onClick={agregar} disabled={!elegido} className={error ? 'mb-[1.625rem]' : ''}>Agregar</Button>
      </div>

      {value.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-line px-4 py-5 text-muted">
          <Package className="size-5 text-sage-400" aria-hidden /> Aún no has agregado artículos.
        </div>
      ) : (
        <ul className="divide-y divide-line rounded-xl ring-1 ring-line" aria-label="Artículos solicitados">
          {value.map((v) => (
            <li key={v.articuloId} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{porId[v.articuloId]?.nombre ?? `Artículo ${v.articuloId}`}</span>
                <span className="text-sm text-muted">{porId[v.articuloId]?.unidad}</span>
              </span>
              <span className="flex items-center gap-1">
                <Button variante="fantasma" tamano="icono" icono={Minus} onClick={() => cambiar(v.articuloId, -1)} aria-label="Restar uno" />
                <input
                  type="number" min="1" max="999" value={v.cantidad}
                  onChange={(e) => fijar(v.articuloId, e.target.value)}
                  aria-label={`Cantidad de ${porId[v.articuloId]?.nombre}`}
                  className="h-10 w-16 rounded-lg border border-line text-center font-bold [appearance:textfield] focus:border-pine-600 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button variante="fantasma" tamano="icono" icono={Plus} onClick={() => cambiar(v.articuloId, 1)} aria-label="Sumar uno" />
              </span>
              <Button variante="fantasma" tamano="icono" icono={Trash2} onClick={() => quitar(v.articuloId)} aria-label="Quitar artículo" className="text-danger hover:bg-danger-50" />
            </li>
          ))}
          <li className="flex justify-between bg-sage-50 px-4 py-2.5 text-[15px] rounded-b-xl">
            <span className="text-muted">Total de unidades</span>
            <strong>{value.reduce((s, v) => s + v.cantidad, 0)}</strong>
          </li>
        </ul>
      )}
    </div>
  );
}
