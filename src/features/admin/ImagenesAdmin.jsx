import { useState } from 'react';
import { Eye, EyeOff, Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Alert, Cargando, ErrorCarga } from '../../components/ui/Feedback.jsx';
import { archivoUrl } from '../../api/client.js';
import { useAdmin } from './sesion.js';
import { Progreso, SelectorArchivos, useAviso, useCarga } from './componentes.jsx';

/*
 * Banners del carrusel y comunicados: imágenes en amapolanet (intrapola_banner / intrapola_comunicado).
 * "Quitar" deja la imagen INACTIVA (no se borra), así se puede volver a mostrar.
 */
const CONFIG = {
  banners: {
    titulo: 'Banners del carrusel',
    descripcion: 'Las imágenes que rotan en el inicio. Se recomienda formato horizontal (por ejemplo 1600 × 600 px).',
    activos: 'En el carrusel',
    inactivos: 'Ocultos',
    multiple: true,
    campo: 'imagenes',
    proporcion: 'aspect-[8/3]',
    textoSubir: 'Agregar al carrusel',
  },
  comunicados: {
    titulo: 'Comunicado vigente',
    descripcion: 'La imagen que se abre a cada persona al entrar a la Intrapola y que aparece en Comunicados.',
    activos: 'Vigente',
    inactivos: 'Anteriores',
    multiple: false,
    campo: 'imagen',
    proporcion: 'aspect-[4/5]',
    textoSubir: 'Publicar comunicado',
  },
};

function Tarjeta({ item, proporcion, onCambiar, ocupado }) {
  return (
    <li className={`flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ${item.activo ? 'ring-line' : 'ring-line/60'}`}>
      <a href={archivoUrl(item.imagenUrl)} target="_blank" rel="noreferrer" className={`block ${proporcion} overflow-hidden bg-sage-50`}>
        <img src={archivoUrl(item.imagenUrl)} alt={item.titulo} loading="lazy" className={`size-full object-cover ${item.activo ? '' : 'opacity-50 grayscale'}`} />
      </a>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <span className="min-w-0 truncate text-sm text-muted" title={item.titulo}>{item.titulo}</span>
        <Button variante={item.activo ? 'secundario' : 'suave'} tamano="sm" icono={item.activo ? EyeOff : Eye} cargando={ocupado} onClick={() => onCambiar(item)}>
          {item.activo ? 'Quitar' : 'Mostrar'}
        </Button>
      </div>
    </li>
  );
}

export default function ImagenesAdmin({ tipo }) {
  const c = CONFIG[tipo];
  const admin = useAdmin();
  const { data, loading, error, recargar, setData } = useCarga(`/${tipo}`);
  const [archivos, setArchivos] = useState([]);
  const [reemplazar, setReemplazar] = useState(true);
  const [progreso, setProgreso] = useState(null);
  const [ocupado, setOcupado] = useState(null);
  const [aviso, avisar] = useAviso();

  async function publicar() {
    const form = new FormData();
    archivos.forEach((f) => form.append(c.campo, f));
    if (tipo === 'comunicados') form.append('reemplazar', String(reemplazar));
    setProgreso(0); avisar(null);
    try {
      setData(await admin.subir('POST', `/${tipo}`, form, setProgreso));
      setArchivos([]);
      avisar(tipo === 'banners' ? `${archivos.length === 1 ? 'Imagen agregada' : `${archivos.length} imágenes agregadas`} al carrusel.` : 'Comunicado publicado.');
    } catch (err) { avisar(err.message, 'error'); }
    finally { setProgreso(null); }
  }

  async function cambiar(item) {
    setOcupado(item.id); avisar(null);
    try { setData(await admin.patch(`/${tipo}/${item.id}`, { activo: !item.activo })); }
    catch (err) { avisar(err.message, 'error'); }
    finally { setOcupado(null); }
  }

  const activos = data?.filter((x) => x.activo) ?? [];
  const inactivos = data?.filter((x) => !x.activo) ?? [];
  const rejilla = tipo === 'banners' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6">
        <h2 className="text-xl font-bold">{c.titulo}</h2>
        <p className="mt-1 text-muted">{c.descripcion}</p>
        <div className="mt-5 flex flex-col gap-4">
          <SelectorArchivos archivos={archivos} onCambio={setArchivos} multiple={c.multiple}
            ayuda={`JPG, PNG o WEBP${c.multiple ? '. Puede elegir varias a la vez' : ''}`} />
          {tipo === 'comunicados' && (
            <label className="flex items-start gap-2.5 text-[15px]">
              <input type="checkbox" checked={reemplazar} onChange={(e) => setReemplazar(e.target.checked)} className="mt-1 size-4 accent-[var(--color-pine)]" />
              <span><b>Reemplazar el comunicado vigente.</b> <span className="text-muted">Si lo desmarca, los dos quedan publicados.</span></span>
            </label>
          )}
          <Progreso valor={progreso} />
          {aviso && <Alert tipo={aviso.tipo}>{aviso.texto}</Alert>}
          <Button icono={Upload} disabled={!archivos.length} cargando={progreso != null} onClick={publicar} className="self-start">{c.textoSubir}</Button>
        </div>
      </section>

      {loading && <Cargando />}
      {error && <ErrorCarga error={error} onReintentar={recargar} />}
      {data && (
        <>
          <section>
            <h2 className="mb-3 text-lg font-bold">{c.activos} <span className="font-normal text-muted">({activos.length})</span></h2>
            {activos.length
              ? <ul className={`grid gap-4 ${rejilla}`}>{activos.map((x) => <Tarjeta key={x.id} item={x} proporcion={c.proporcion} onCambiar={cambiar} ocupado={ocupado === x.id} />)}</ul>
              : <p className="rounded-2xl border border-dashed border-line bg-white px-5 py-6 text-muted">{tipo === 'banners' ? 'El carrusel está vacío: no se mostrará en el inicio.' : 'No hay comunicado vigente.'}</p>}
          </section>
          {inactivos.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">{c.inactivos} <span className="font-normal text-muted">({inactivos.length})</span></h2>
              <ul className={`grid gap-4 ${rejilla}`}>{inactivos.map((x) => <Tarjeta key={x.id} item={x} proporcion={c.proporcion} onCambiar={cambiar} ocupado={ocupado === x.id} />)}</ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
