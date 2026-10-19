import { CircleAlert, CircleCheck, LoaderCircle, RotateCw } from 'lucide-react';
import { Button } from './Button.jsx';

export function Alert({ tipo = 'error', children, className = '' }) {
  const estilos = {
    error: 'bg-danger-50 text-danger ring-danger/20',
    aviso: 'bg-biscuit-100 text-[#7a4e10] ring-biscuit/30',
  }[tipo] ?? 'bg-sage-100 text-pine ring-sage-400/40';
  const Icono = tipo === 'error' || tipo === 'aviso' ? CircleAlert : CircleCheck;
  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2.5 rounded-xl px-4 py-3 ring-1 ring-inset ${estilos} ${className}`}>
      <Icono className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="text-[15px]">{children}</div>
    </div>
  );
}

export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="flex items-center gap-3 py-10 text-muted" role="status">
      <LoaderCircle className="size-5 animate-spin text-pine-600" aria-hidden />
      {texto}
    </div>
  );
}

export function ErrorCarga({ error, onReintentar }) {
  // 501 = módulo aún sin fuente de datos: aviso neutro, sin botón de reintentar
  if (error?.status === 501) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
        <p className="font-display text-lg font-semibold">Esta sección estará disponible pronto</p>
        <p className="mt-1 text-muted">Se está conectando a la base de datos de la empresa.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-danger/30 bg-white p-6">
      <p className="text-danger">{error?.message || 'No se pudo cargar la información.'}</p>
      {onReintentar && <Button variante="secundario" tamano="sm" icono={RotateCw} onClick={onReintentar}>Intentar de nuevo</Button>}
    </div>
  );
}

export function Vacio({ icono: Icono, titulo, children }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
      {Icono && <Icono className="size-8 text-sage-400" aria-hidden />}
      <p className="font-display text-lg font-semibold">{titulo}</p>
      {children && <p className="max-w-md text-muted">{children}</p>}
    </div>
  );
}

const ESTADOS = {
  PENDIENTE: ['Pendiente', 'bg-biscuit-100 text-[#7a4e10]'],
  EN_PROCESO: ['En proceso', 'bg-sage-100 text-pine'],
  APROBADA: ['Aprobada', 'bg-pine text-white'],
  RECHAZADA: ['Rechazada', 'bg-danger-50 text-danger'],
  CERRADA: ['Cerrada', 'bg-line text-muted'],
  REGISTRADA: ['Registrada', 'bg-sage-100 text-pine'],
};

export function EstadoBadge({ estado }) {
  const [texto, clase] = ESTADOS[estado] || [estado, 'bg-line text-muted'];
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-bold ${clase}`}>{texto}</span>;
}
