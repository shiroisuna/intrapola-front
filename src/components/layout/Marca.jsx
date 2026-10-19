import { useState } from 'react';
import { Link } from 'react-router-dom';

/** Logo de la empresa (public/logo.png) con respaldo tipográfico si aún no se ha copiado. */
export function Marca({ onClick }) {
  const [sinLogo, setSinLogo] = useState(false);
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-3 rounded-xl" aria-label="Intrapola, ir al inicio">
      {sinLogo ? (
        <span className="grid size-11 place-items-center rounded-xl bg-pine font-display text-lg font-bold text-sage" aria-hidden>IA</span>
      ) : (
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="size-11 object-contain" onError={() => setSinLogo(true)} />
      )}
      <span className="leading-tight">
        <span className="block font-display text-xl font-bold tracking-tight text-pine-800">Intrapola</span>
        <span className="block text-[13px] text-pine-600">Industrias Amapola</span>
      </span>
    </Link>
  );
}
