import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, Trash2, Upload, X } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { useAdmin } from './sesion.js';

/** Carga un recurso del panel; data se puede reemplazar con la respuesta de una acción. */
export function useCarga(path) {
  const admin = useAdmin();
  const [estado, setEstado] = useState({ data: null, loading: true, error: null });
  const recargar = useCallback(() => {
    setEstado((s) => ({ ...s, loading: true, error: null }));
    admin.get(path)
      .then((data) => setEstado({ data, loading: false, error: null }))
      .catch((error) => setEstado({ data: null, loading: false, error }));
  }, [admin, path]);
  useEffect(() => { recargar(); }, [recargar]);
  const setData = useCallback((data) => setEstado({ data, loading: false, error: null }), []);
  return { ...estado, recargar, setData };
}

/** Zona para soltar o elegir archivos, con vista previa de imágenes. */
export function SelectorArchivos({ archivos, onCambio, multiple = true, aceptar = 'image/*', texto, ayuda, compacto = false }) {
  const id = useId();
  const [arrastrando, setArrastrando] = useState(false);
  const previas = useRef(new Map());

  const vista = (f) => {
    if (!f.type.startsWith('image/')) return null;
    if (!previas.current.has(f)) previas.current.set(f, URL.createObjectURL(f));
    return previas.current.get(f);
  };
  useEffect(() => () => previas.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const agregar = (lista) => {
    const nuevos = [...lista].filter((f) => aceptar === 'image/*' ? f.type.startsWith('image/') : f.name.toLowerCase().endsWith('.pdf'));
    onCambio(multiple ? [...archivos, ...nuevos] : nuevos.slice(0, 1));
  };

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={id}
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => { e.preventDefault(); setArrastrando(false); agregar(e.dataTransfer.files); }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed text-center transition-colors ${
          compacto ? 'px-4 py-5' : 'px-6 py-9'
        } ${arrastrando ? 'border-pine-600 bg-sage-100' : 'border-line bg-white hover:border-sage-400 hover:bg-sage-50'}`}
      >
        {aceptar === 'image/*' ? <ImagePlus className="size-7 text-pine-600" aria-hidden /> : <Upload className="size-7 text-pine-600" aria-hidden />}
        <span className="font-bold text-pine">{texto ?? (multiple ? 'Elegir archivos o soltarlos aquí' : 'Elegir archivo o soltarlo aquí')}</span>
        {ayuda && <span className="text-sm text-muted">{ayuda}</span>}
        <input id={id} type="file" accept={aceptar === 'image/*' ? 'image/png,image/jpeg,image/webp,image/gif' : 'application/pdf,.pdf'}
          multiple={multiple} className="sr-only" onChange={(e) => { agregar(e.target.files); e.target.value = ''; }} />
      </label>

      {archivos.length > 0 && (
        aceptar === 'image/*' ? (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
            {archivos.map((f, i) => (
              <li key={`${f.name}-${f.size}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl bg-sage-50 ring-1 ring-line">
                <img src={vista(f)} alt="" className="size-full object-cover" />
                <button type="button" onClick={() => onCambio(archivos.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 grid size-7 place-items-center rounded-lg bg-white/90 text-ink shadow hover:bg-white" aria-label={`Quitar ${f.name}`}>
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="divide-y divide-line rounded-xl bg-white ring-1 ring-line">
            {archivos.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="min-w-0 truncate">{f.name}</span>
                <button type="button" onClick={() => onCambio(archivos.filter((_, j) => j !== i))} className="rounded-lg p-1.5 text-muted hover:bg-sage-100 hover:text-ink" aria-label={`Quitar ${f.name}`}>
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

export function Progreso({ valor }) {
  if (valor == null) return null;
  const pct = Math.round(valor * 100);
  return (
    <div className="flex items-center gap-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Subiendo">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-sage-100">
        <div className="h-full rounded-full bg-pine-600 transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-20 text-right text-sm tabular-nums text-muted">{pct < 100 ? `${pct} %` : 'Procesando…'}</span>
    </div>
  );
}

/** Interruptor visible / oculto. */
export function Interruptor({ activo, onCambio, etiqueta, deshabilitado }) {
  return (
    <button type="button" role="switch" aria-checked={activo} disabled={deshabilitado} onClick={() => onCambio(!activo)}
      className="inline-flex items-center gap-2.5 rounded-xl py-1 text-[15px] font-bold text-ink disabled:opacity-50">
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${activo ? 'bg-pine' : 'bg-line'}`}>
        <span className={`absolute left-0 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${activo ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </span>
      {etiqueta}
    </button>
  );
}

/** Botón de borrar que pide una segunda confirmación en el mismo lugar (sin ventanas emergentes). */
export function BotonEliminar({ onConfirmar, texto = 'Eliminar', pregunta = '¿Seguro?', cargando, tamano = 'sm' }) {
  const [confirmando, setConfirmando] = useState(false);
  useEffect(() => {
    if (!confirmando) return undefined;
    const t = setTimeout(() => setConfirmando(false), 5000);
    return () => clearTimeout(t);
  }, [confirmando]);
  if (!confirmando) return <Button variante="peligro" tamano={tamano} icono={Trash2} onClick={() => setConfirmando(true)}>{texto}</Button>;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-sm font-bold text-danger">{pregunta}</span>
      <Button variante="peligro" tamano={tamano} cargando={cargando} onClick={() => { setConfirmando(false); onConfirmar(); }}>Sí</Button>
      <Button variante="fantasma" tamano={tamano} onClick={() => setConfirmando(false)}>No</Button>
    </span>
  );
}

/** Mensaje breve que desaparece solo. */
export function useAviso() {
  const [aviso, setAviso] = useState(null);
  useEffect(() => {
    if (!aviso || aviso.tipo === 'error') return undefined;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);
  return [aviso, (texto, tipo = 'exito') => setAviso(texto ? { texto, tipo } : null)];
}
