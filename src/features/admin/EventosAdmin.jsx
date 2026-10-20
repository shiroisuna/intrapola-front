import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ImagePlus, Images, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Field, Input } from '../../components/ui/Field.jsx';
import { Alert, Cargando, ErrorCarga, Vacio } from '../../components/ui/Feedback.jsx';
import { archivoUrl } from '../../api/client.js';
import { useAdmin } from './sesion.js';
import { BotonEliminar, Interruptor, Progreso, SelectorArchivos, useAviso, useCarga } from './componentes.jsx';

const Volver = () => (
  <Link to=".." relative="path" className="mb-4 inline-flex items-center gap-1.5 text-[15px] font-bold text-pine-600 hover:text-pine">
    <ArrowLeft className="size-4" aria-hidden /> Todos los eventos
  </Link>
);

/* ------------------------------- Lista ------------------------------- */
export function ListaEventos() {
  const { data, loading, error, recargar } = useCarga('/eventos');
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-muted">Cada evento es una galería: foto de portada y las fotos de la actividad. Los eventos de la Intrapola anterior se pueden ocultar o renombrar.</p>
        <Link to="nuevo" className="inline-flex h-11 items-center gap-2 rounded-xl bg-pine px-4 font-bold text-white hover:bg-pine-800">
          <Plus className="size-[18px]" aria-hidden /> Nuevo evento
        </Link>
      </div>
      {loading && <Cargando />}
      {error && <ErrorCarga error={error} onReintentar={recargar} />}
      {data && !data.length && <Vacio icono={Images} titulo="Todavía no hay eventos" />}
      {data?.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((e) => (
            <li key={e.id}>
              <Link to={String(e.id)} className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-line hover:ring-sage-400">
                <div className="relative aspect-[4/3] bg-sage-50">
                  {e.imagenUrl
                    ? <img src={archivoUrl(e.imagenUrl)} alt="" loading="lazy" className={`size-full object-cover ${e.activo ? '' : 'opacity-50 grayscale'}`} />
                    : <Images className="absolute inset-0 m-auto size-9 text-sage-400" aria-hidden />}
                  <span className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-bold ${e.activo ? 'bg-pine text-white' : 'bg-white text-muted'}`}>
                    {e.activo ? 'Publicado' : 'Oculto'}
                  </span>
                  {!e.galeria && <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold text-muted">Intrapola anterior</span>}
                </div>
                <span className="p-4 font-bold leading-snug group-hover:text-pine">{e.titulo || 'Sin título'}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------- Nuevo ------------------------------- */
export function NuevoEvento() {
  const admin = useAdmin();
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [portada, setPortada] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [publicar, setPublicar] = useState(true);
  const [errores, setErrores] = useState({});
  const [progreso, setProgreso] = useState(null);
  const [error, setError] = useState('');

  async function guardar(e) {
    e.preventDefault();
    const er = {};
    if (titulo.trim().length < 3) er.titulo = 'Escriba el nombre del evento';
    if (!portada.length) er.portada = 'Elija la foto de portada';
    setErrores(er);
    if (Object.keys(er).length) return;
    const form = new FormData();
    form.append('titulo', titulo.trim());
    form.append('activo', String(publicar));
    form.append('portada', portada[0]);
    fotos.forEach((f) => form.append('fotos', f));
    setProgreso(0); setError('');
    try {
      const ev = await admin.subir('POST', '/eventos', form, setProgreso);
      navigate(`../${ev.id}`, { relative: 'path', replace: true });
    } catch (err) { setError(err.message); setErrores(err.porCampo); setProgreso(null); }
  }

  return (
    <form onSubmit={guardar} noValidate>
      <Volver />
      <div className="flex flex-col gap-6 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-7">
        <h2 className="text-xl font-bold">Nuevo evento</h2>
        <Field label="Nombre del evento" error={errores.titulo}>
          <Input value={titulo} maxLength={150} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Celebración del Día del Trabajador 2026" />
        </Field>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="flex flex-col gap-1.5">
            <span className="text-[15px] font-bold">Foto de portada</span>
            <SelectorArchivos archivos={portada} onCambio={setPortada} multiple={false} compacto ayuda="Se ve en la lista de eventos" />
            {errores.portada && <p className="text-sm text-danger">{errores.portada}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[15px] font-bold">Fotos de la galería <span className="font-normal text-muted">(opcional, se pueden agregar después)</span></span>
            <SelectorArchivos archivos={fotos} onCambio={setFotos} compacto ayuda="Puede elegir muchas a la vez (hasta 80 por envío)" />
          </div>
        </div>
        <Interruptor activo={publicar} onCambio={setPublicar} etiqueta={publicar ? 'Publicado: se ve en Eventos' : 'Oculto: solo se ve aquí'} />
        <Progreso valor={progreso} />
        {error && <Alert>{error}</Alert>}
        <Button type="submit" icono={Save} cargando={progreso != null} className="self-start">Crear evento</Button>
      </div>
    </form>
  );
}

/* ------------------------------- Editar ------------------------------- */
export function EditarEvento() {
  const { id } = useParams();
  const admin = useAdmin();
  const navigate = useNavigate();
  const { data: ev, loading, error, recargar, setData } = useCarga(`/eventos/${id}`);
  const [titulo, setTitulo] = useState(null);
  const [nuevas, setNuevas] = useState([]);
  const [portada, setPortada] = useState([]);
  const [progreso, setProgreso] = useState(null);
  const [ocupado, setOcupado] = useState('');
  const [aviso, avisar] = useAviso();

  if (loading && !ev) return <><Volver /><Cargando /></>;
  if (error) return <><Volver /><ErrorCarga error={error} onReintentar={recargar} /></>;
  if (!ev) return null;
  const nombre = titulo ?? ev.titulo;

  const accion = async (clave, fn, exito) => {
    setOcupado(clave); avisar(null);
    try { await fn(); if (exito) avisar(exito); }
    catch (err) { avisar(err.message, 'error'); }
    finally { setOcupado(''); }
  };

  const guardarTitulo = () => accion('titulo', async () => {
    setData(await admin.patch(`/eventos/${id}`, { titulo: nombre.trim() }));
    setTitulo(null);
  }, 'Nombre actualizado.');

  const cambiarVisible = (activo) => accion('visible', async () => setData(await admin.patch(`/eventos/${id}`, { activo })),
    activo ? 'El evento está publicado.' : 'El evento quedó oculto.');

  async function subirPortada() {
    const form = new FormData();
    form.append('portada', portada[0]);
    setProgreso(0); avisar(null);
    try { setData(await admin.subir('PATCH', `/eventos/${id}`, form, setProgreso)); setPortada([]); avisar('Portada cambiada.'); }
    catch (err) { avisar(err.message, 'error'); }
    finally { setProgreso(null); }
  }

  async function subirFotos() {
    const form = new FormData();
    nuevas.forEach((f) => form.append('fotos', f));
    setProgreso(0); avisar(null);
    try {
      const fotos = await admin.subir('POST', `/eventos/${id}/fotos`, form, setProgreso);
      setData({ ...ev, fotos });
      avisar(`${nuevas.length === 1 ? 'Foto agregada' : `${nuevas.length} fotos agregadas`}.`);
      setNuevas([]);
    } catch (err) { avisar(err.message, 'error'); }
    finally { setProgreso(null); }
  }

  const quitarFoto = (archivo) => accion(archivo, async () => {
    setData({ ...ev, fotos: await admin.del(`/eventos/${id}/fotos/${encodeURIComponent(archivo)}`) });
  });

  const eliminar = () => accion('eliminar', async () => {
    await admin.del(`/eventos/${id}`);
    navigate('..', { relative: 'path', replace: true });
  });

  return (
    <div className="flex flex-col gap-6">
      <div><Volver /></div>
      {aviso && <Alert tipo={aviso.tipo}>{aviso.texto}</Alert>}

      <section className="grid gap-6 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-7 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-3">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-sage-50">
            {ev.imagenUrl && <img src={archivoUrl(ev.imagenUrl)} alt="Portada" className="size-full object-cover" />}
          </div>
          {ev.galeria && (
            <>
              <SelectorArchivos archivos={portada} onCambio={setPortada} multiple={false} compacto texto="Cambiar portada" />
              {portada.length > 0 && <Button tamano="sm" icono={ImagePlus} cargando={progreso != null} onClick={subirPortada} className="self-start">Usar esta portada</Button>}
            </>
          )}
        </div>
        <div className="flex flex-col gap-5">
          <Field label="Nombre del evento">
            <Input value={nombre} maxLength={150} onChange={(e) => setTitulo(e.target.value)} />
          </Field>
          {titulo !== null && titulo.trim() !== ev.titulo && (
            <Button tamano="sm" icono={Save} cargando={ocupado === 'titulo'} disabled={nombre.trim().length < 3} onClick={guardarTitulo} className="-mt-2 self-start">Guardar nombre</Button>
          )}
          <Interruptor activo={ev.activo} deshabilitado={ocupado === 'visible'} onCambio={cambiarVisible}
            etiqueta={ev.activo ? 'Publicado: se ve en Eventos' : 'Oculto: solo se ve aquí'} />
          {!ev.galeria && (
            <Alert tipo="aviso">
              Evento de la Intrapola anterior: sus fotos están en el servidor IIS.{' '}
              {ev.enlace && <a href={ev.enlace} target="_blank" rel="noreferrer" className="font-bold underline">Ver galería <ExternalLink className="inline size-3.5" aria-hidden /></a>}
            </Alert>
          )}
          {ev.galeria && ev.activo && (
            <Link to={`/eventos/${ev.id}`} className="inline-flex items-center gap-1.5 self-start font-bold text-pine hover:underline">
              Ver como lo ven todos <ExternalLink className="size-4" aria-hidden />
            </Link>
          )}
          <div className="mt-auto border-t border-line pt-4">
            <BotonEliminar texto={ev.galeria ? 'Eliminar evento' : 'Ocultar evento'} pregunta={ev.galeria ? '¿Eliminar el evento y todas sus fotos?' : '¿Ocultarlo?'}
              cargando={ocupado === 'eliminar'} onConfirmar={eliminar} />
          </div>
        </div>
      </section>

      {ev.galeria && (
        <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-7">
          <h2 className="text-xl font-bold">Fotos <span className="font-normal text-muted">({ev.fotos.length})</span></h2>
          <SelectorArchivos archivos={nuevas} onCambio={setNuevas} compacto texto="Agregar fotos" ayuda="Puede elegir muchas a la vez" />
          <Progreso valor={progreso} />
          {nuevas.length > 0 && <Button icono={ImagePlus} cargando={progreso != null} onClick={subirFotos} className="self-start">Subir {nuevas.length} {nuevas.length === 1 ? 'foto' : 'fotos'}</Button>}
          {ev.fotos.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {ev.fotos.map((f) => (
                <li key={f.archivo} className="group relative aspect-square overflow-hidden rounded-xl bg-sage-50 ring-1 ring-line">
                  <img src={archivoUrl(f.url)} alt="" loading="lazy" className="size-full object-cover" />
                  <button type="button" onClick={() => quitarFoto(f.archivo)} disabled={ocupado === f.archivo}
                    className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-lg bg-white/90 text-danger shadow opacity-100 hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                    aria-label="Quitar esta foto">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="text-muted">Este evento todavía no tiene fotos.</p>}
        </section>
      )}
    </div>
  );
}
