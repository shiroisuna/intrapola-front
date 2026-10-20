import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, ExternalLink, Settings } from 'lucide-react';
import { NAVEGACION } from '../../config/navegacion.js';
import { useApi } from '../../hooks/useApi.js';
import { archivoUrl } from '../../api/client.js';
import { Marca } from './Marca.jsx';
import { Apolin } from '../apolin/Apolin.jsx';

function Navegacion({ onNavegar }) {
  return (
    <nav aria-label="Principal">
      <ul className="flex flex-col gap-0.5">
        {NAVEGACION.map(({ to, texto, icono: Icono, fin }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={fin}
              onClick={onNavegar}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-bold transition-colors ${
                  isActive ? 'bg-white text-pine-800 shadow-[0_1px_0_rgba(22,54,38,.08)]' : 'text-pine-800/80 hover:bg-white/50 hover:text-pine-800'
                }`
              }
            >
              <Icono className="size-[19px]" aria-hidden />
              {texto}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function OtrosSistemas() {
  const { data } = useApi('/contenido/inicio');
  if (!data?.enlaces?.length) return null;
  return (
    <div className="mt-8 border-t border-pine/15 pt-5">
      <p className="mb-2 px-3 text-sm font-bold text-pine-800/70">Otros sistemas</p>
      <ul className="flex flex-col">
        {data.enlaces.map((e) => (
          <li key={e.id}>
            <a href={archivoUrl(e.url)} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[15px] text-pine-800 hover:bg-white/50" title={e.descripcion}>
              {e.titulo}
              <ExternalLink className="size-4 opacity-50 group-hover:opacity-100" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AppLayout() {
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : '';
    const esc = (e) => e.key === 'Escape' && setAbierto(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [abierto]);

  const cerrar = () => setAbierto(false);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_1fr]">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Saltar al contenido</a>

      {/* Barra superior móvil */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-sage px-4 py-3 lg:hidden">
        <Marca />
        <button type="button" onClick={() => setAbierto(true)} className="rounded-xl p-2 text-pine-800 hover:bg-white/50" aria-label="Abrir menú" aria-expanded={abierto}>
          <Menu className="size-6" />
        </button>
      </header>

      {/* Fondo del menú móvil */}
      {abierto && <div className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={cerrar} aria-hidden />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto bg-sage px-4 pb-6 pt-5 transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:w-auto lg:translate-x-0 ${abierto ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Menú"
      >
        <div className="mb-7 flex items-center justify-between px-1">
          <Marca onClick={cerrar} />
          <button type="button" onClick={cerrar} className="rounded-xl p-2 text-pine-800 hover:bg-white/50 lg:hidden" aria-label="Cerrar menú">
            <X className="size-5" />
          </button>
        </div>
        <Navegacion onNavegar={cerrar} />
        <OtrosSistemas />
        <p className="mt-auto flex items-center justify-between gap-2 px-3 pt-8 text-[13px] text-pine-800/60">
          Departamento de Sistemas
          <NavLink to="/admin" onClick={cerrar} className="rounded-lg p-1.5 hover:bg-white/50 hover:text-pine-800" title="Administración" aria-label="Administración">
            <Settings className="size-4" aria-hidden />
          </NavLink>
        </p>
      </aside>

      <main id="contenido" className="min-w-0 px-4 pb-32 pt-8 sm:px-8 lg:px-12 lg:pt-12">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
      <Apolin />
    </div>
  );
}
