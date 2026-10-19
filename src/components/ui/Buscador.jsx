import { Search, X } from 'lucide-react';

export function Buscador({ valor, onCambio, placeholder = 'Buscar', etiqueta = 'Buscar', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted" aria-hidden />
      <input
        type="search"
        aria-label={etiqueta}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-10 placeholder:text-muted/70 focus:border-pine-600 focus:outline-none focus:ring-4 focus:ring-sage/60 [&::-webkit-search-cancel-button]:hidden"
      />
      {valor && (
        <button type="button" onClick={() => onCambio('')} aria-label="Limpiar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:bg-sage-100">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
