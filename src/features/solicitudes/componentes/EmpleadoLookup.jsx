import { CircleCheck, Search } from 'lucide-react';
import { Field, Input } from '../../../components/ui/Field.jsx';
import { Button } from '../../../components/ui/Button.jsx';

/** Cédula + botón Buscar; muestra la ficha del trabajador cuando se encuentra. */
export function EmpleadoLookup({ empleadoHook, error: errorExterno }) {
  const { cedula, setCedula, empleado, buscando, error, buscar } = empleadoHook;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,18rem)_1fr] md:items-start">
      <div className="flex items-end gap-2">
        <Field label="Cédula de identidad" error={error || errorExterno} hint={!empleado ? 'Escríbela y presiona Enter' : undefined} className="flex-1">
          <Input
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ej. 12345678"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscar(); } }}
            onBlur={() => { if (cedula.length >= 5 && !empleado && !buscando) buscar(); }}
          />
        </Field>
        <Button
          variante="suave"
          tamano="icono"
          icono={Search}
          cargando={buscando}
          onClick={buscar}
          aria-label="Buscar trabajador"
          className={error || errorExterno || !empleado ? 'mb-[1.625rem]' : ''}
        />
      </div>

      <div aria-live="polite" className="md:pt-[1.85rem]">
        {empleado && (
          <div className="flex items-center gap-3 rounded-xl bg-sage-50 px-4 py-2.5 ring-1 ring-sage-200">
            <CircleCheck className="size-5 shrink-0 text-pine-600" aria-hidden />
            <div className="min-w-0">
              <p className="truncate font-bold">{empleado.nombreCompleto}</p>
              <p className="truncate text-[15px] text-muted">
                {empleado.departamento}{empleado.cargo ? ` · ${empleado.cargo}` : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
