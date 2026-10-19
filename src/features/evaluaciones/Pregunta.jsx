/** Una pregunta de la encuesta: ¿cumple? y, si cumple, cuántos puntos (0 al máximo). */
export function Pregunta({ numero, pregunta, valor, onChange, error }) {
  const { cumple, puntos } = valor ?? {};
  const opcion = (v, texto) => (
    <label className={`flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl px-4 font-bold ring-1 ring-inset focus-within:ring-4 focus-within:ring-sage sm:flex-none sm:px-6 ${
      cumple === v ? (v ? 'bg-pine text-white ring-pine' : 'bg-danger text-white ring-danger') : 'bg-white ring-line hover:bg-sage-50'}`}>
      <input type="radio" className="sr-only" name={`p-${pregunta.id}`} checked={cumple === v}
        onChange={() => onChange({ cumple: v, puntos: v ? pregunta.max : 0 })} />
      {texto}
    </label>
  );

  return (
    <fieldset className={`rounded-2xl p-5 ring-1 ring-inset ${error ? 'bg-danger-50/40 ring-danger/40' : 'bg-white ring-line'}`}>
      <legend className="sr-only">Pregunta {numero}</legend>
      <div className="flex gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sage-100 text-sm font-bold text-pine">{numero}</span>
        <p className="text-[17px] leading-snug">{pregunta.texto}</p>
      </div>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:pl-11">
        <div className="flex gap-2" role="group" aria-label="¿Cumple?">
          {opcion(true, 'Sí cumple')}{opcion(false, 'No cumple')}
        </div>
        <div className={`flex items-center gap-3 ${cumple ? '' : 'opacity-40'}`}>
          <input type="range" min={0} max={pregunta.max} step={1} value={puntos ?? 0} disabled={!cumple}
            onChange={(e) => onChange({ cumple, puntos: Number(e.target.value) })}
            className="w-36 accent-[#1f4a33]" aria-label={`Puntos (máximo ${pregunta.max})`} />
          <span className="w-20 text-right tabular-nums"><strong className="text-lg">{puntos ?? 0}</strong><span className="text-muted"> / {pregunta.max}</span></span>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-danger sm:pl-11">{error}</p>}
    </fieldset>
  );
}
