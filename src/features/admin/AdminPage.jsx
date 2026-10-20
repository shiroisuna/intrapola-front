import { useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Bot, Building2, CalendarDays, FileText, GalleryHorizontal, LockKeyhole, LogIn, LogOut, Megaphone, Palette, Phone } from 'lucide-react';
import { Field, Input } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Alert } from '../../components/ui/Feedback.jsx';
import { AdminContexto, useSesionAdmin } from './sesion.js';

export const SECCIONES = [
  { to: 'banners', texto: 'Banners', icono: GalleryHorizontal },
  { to: 'comunicados', texto: 'Comunicados', icono: Megaphone },
  { to: 'eventos', texto: 'Eventos', icono: CalendarDays },
  { to: 'normas', texto: 'Normas', icono: FileText },
  { to: 'directorio', texto: 'Directorio', icono: Phone },
  { to: 'empresa', texto: 'Empresa', icono: Building2 },
  { to: 'apolin', texto: 'Apolin', icono: Bot },
  { to: 'apariencia', texto: 'Apariencia', icono: Palette },
];

function Ingreso({ entrar }) {
  const [usuario, setUsuario] = useState('admin');
  const [clave, setClave] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function enviar(e) {
    e.preventDefault();
    if (!usuario.trim() || !clave) { setError('Escriba el usuario y la clave.'); return; }
    setEnviando(true); setError('');
    try { await entrar(usuario.trim(), clave); }
    catch (err) { setError(err.message); setClave(''); }
    finally { setEnviando(false); }
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <form onSubmit={enviar} noValidate className="flex flex-col gap-5 rounded-3xl bg-white p-6 ring-1 ring-line sm:p-8">
        <div>
          <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-sage-100 text-pine"><LockKeyhole className="size-6" aria-hidden /></span>
          <h1 className="text-2xl font-bold">Administración</h1>
          <p className="mt-1 text-muted">Banners, comunicados, eventos, normas, directorio, datos de la empresa y apariencia.</p>
        </div>
        <Field label="Usuario">
          <Input autoComplete="username" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        </Field>
        <Field label="Clave">
          <Input type="password" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} autoFocus />
        </Field>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" icono={LogIn} cargando={enviando} className="self-start">Ingresar</Button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const ctx = useSesionAdmin();
  const { pathname } = useLocation();

  if (!ctx.sesion) return <Ingreso entrar={ctx.entrar} />;
  if (/\/admin\/?$/.test(pathname)) return <Navigate to="banners" replace />;

  return (
    <AdminContexto.Provider value={ctx}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-pine-600">Administración</p>
          <h1 className="text-3xl font-bold sm:text-[2.5rem]">Contenido de la Intrapola</h1>
        </div>
        <Button variante="secundario" tamano="sm" icono={LogOut} onClick={ctx.salir}>Salir ({ctx.sesion.usuario})</Button>
      </header>

      <nav aria-label="Secciones de administración" className="-mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-1 rounded-2xl bg-white p-1.5 ring-1 ring-line lg:w-auto lg:flex-wrap">
          {SECCIONES.map(({ to, texto, icono: Icono }) => (
            <li key={to}>
              <NavLink to={to} className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3.5 py-2 text-[15px] font-bold transition-colors ${isActive ? 'bg-pine text-white' : 'text-pine-800 hover:bg-sage-100'}`}>
                <Icono className="size-[18px]" aria-hidden />{texto}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Outlet />
    </AdminContexto.Provider>
  );
}
