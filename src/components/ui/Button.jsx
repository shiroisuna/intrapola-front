import { LoaderCircle } from 'lucide-react';

const VARIANTES = {
  primario: 'bg-pine text-white hover:bg-pine-800 disabled:bg-pine/50',
  secundario: 'bg-white text-pine ring-1 ring-inset ring-line hover:bg-sage-50 hover:ring-sage-400',
  suave: 'bg-sage-100 text-pine hover:bg-sage-200',
  fantasma: 'text-pine hover:bg-sage-100',
  peligro: 'bg-white text-danger ring-1 ring-inset ring-danger/30 hover:bg-danger-50',
};

const TAMANOS = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 gap-2',
  lg: 'h-12 px-6 text-[17px] gap-2',
  icono: 'h-10 w-10 justify-center',
};

export function Button({ variante = 'primario', tamano = 'md', cargando = false, icono: Icono, className = '', children, ...props }) {
  return (
    <button
      type="button"
      disabled={cargando || props.disabled}
      className={`inline-flex shrink-0 items-center justify-center rounded-xl font-bold transition-colors disabled:cursor-not-allowed ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      {...props}
    >
      {cargando ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : Icono && <Icono className="size-[18px]" aria-hidden />}
      {children}
    </button>
  );
}
