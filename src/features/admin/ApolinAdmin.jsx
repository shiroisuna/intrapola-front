import { useState } from 'react';
import { BellPlus, Bot, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Field, Input, Select, Textarea } from '../../components/ui/Field.jsx';
import { Alert, Cargando, ErrorCarga, Vacio } from '../../components/ui/Feedback.jsx';
import { archivoUrl } from '../../api/client.js';
import { useAdmin } from './sesion.js';
import { BotonEliminar, SelectorArchivos, useAviso, useCarga } from './componentes.jsx';

/*
 * Apolin: recordatorios que muestra al abrir el chat (CAA.intrapola_recordatorios_apolin),
 * préstamos de equipos (CAA.intrapola_prestamos_equipos) y estado de la IA (Ollama).
 */
const hoy = () => new Date().toISOString().slice(0, 10);
const fecha = (iso) => (iso ? iso.split('-').reverse().join('/') : '—');

function EstadoIa() {
  const { data, loading, recargar } = useCarga('/apolin/estado');
  if (loading && !data) return <Cargando texto="Revisando la IA…" />;
  if (!data) return null;
  const { ia } = data;
  if (!ia.configurada) {
    return (
      <p className="flex items-start gap-2.5 rounded-2xl bg-white px-4 py-3 text-[15px] text-muted ring-1 ring-line">
        <Bot className="mt-0.5 size-5 shrink-0" aria-hidden />
        Preguntas generales desactivadas: Apolin funciona solo con el menú. Configure APOLIN_NUBE_* o APOLIN_OLLAMA_URL en el .env del servidor.
      </p>
    );
  }
  const estado = (p) => {
    if (!p.configurado) return ['No configurado', 'text-muted'];
    if (p.agotadoHasta) return [`Sin cuota hasta ${new Date(p.agotadoHasta).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}`, 'text-[#7a4e10]'];
    if (p.disponible === false) return [`Sin conexión (${p.error})`, 'text-danger'];
    if (p.id === 'local' && p.modeloInstalado === false) return [`Falta el modelo: ollama pull ${p.modelo}`, 'text-[#7a4e10]'];
    return ['Disponible', 'text-pine'];
  };
  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Bot className="size-5 text-pine" aria-hidden />Preguntas generales</h2>
        <Button variante="fantasma" tamano="sm" onClick={recargar} cargando={loading}>Actualizar</Button>
      </div>
      <p className="mb-3 text-sm text-muted">
        Orden: {ia.orden.map((o) => (o === 'nube' ? 'nube' : 'servidor (Ollama)')).join(' → ')} · {ia.preguntasPorPersona} preguntas por persona al día · {ia.personasHoy} {ia.personasHoy === 1 ? 'persona' : 'personas'} hoy
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {ia.proveedores.map((p) => {
          const [texto, clase] = estado(p);
          return (
            <li key={p.id} className="rounded-xl bg-sage-50 p-3.5">
              <p className="font-bold">{p.id === 'nube' ? `Nube: ${p.nombre}` : 'Servidor: Ollama'}</p>
              {p.modelo && <p className="text-sm text-muted">Modelo {p.modelo}</p>}
              {p.id === 'nube' && p.configurado && (
                <p className="text-sm text-muted">Búsqueda en internet: {{ activa: 'activa', apagada: 'apagada', rechazada: 'el modelo no la admite' }[p.busqueda]}</p>
              )}
              <p className={`mt-1 text-sm font-bold ${clase}`}>{texto}</p>
              {p.configurado && <p className="mt-1 text-sm text-muted">Hoy: {p.uso.preguntas} {p.uso.preguntas === 1 ? "respuesta" : "respuestas"} · {p.uso.tokens.toLocaleString('es-VE')} tokens{p.uso.errores ? ` · ${p.uso.errores} fallas` : ''}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Recordatorios() {
  const admin = useAdmin();
  const { data, loading, error, recargar, setData } = useCarga('/apolin/recordatorios');
  const vacio = { titulo: '', mensaje: '', tipo: 'Recordatorio', fechaInicio: hoy(), fechaFin: hoy() };
  const [d, setD] = useState(vacio);
  const [imagen, setImagen] = useState([]);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [ocupado, setOcupado] = useState(null);
  const [aviso, avisar] = useAviso();
  const set = (k) => (e) => { setD((x) => ({ ...x, [k]: e.target.value })); setErrores((x) => ({ ...x, [k]: undefined })); };

  async function guardar(e) {
    e.preventDefault();
    const er = {};
    if (!d.titulo.trim()) er.titulo = 'Indique el título';
    if (!d.mensaje.trim()) er.mensaje = 'Escriba el mensaje';
    if (d.fechaFin < d.fechaInicio) er.fechaFin = 'Debe ser igual o posterior al inicio';
    setErrores(er);
    if (Object.keys(er).length) return;
    const form = new FormData();
    Object.entries(d).forEach(([k, v]) => form.append(k, v.trim ? v.trim() : v));
    if (imagen[0]) form.append('imagen', imagen[0]);
    setGuardando(true); avisar(null);
    try {
      setData(await admin.subir('POST', '/apolin/recordatorios', form));
      setD(vacio); setImagen([]);
      avisar('Recordatorio publicado: Apolin lo mostrará al abrir el chat en esas fechas.');
    } catch (err) { avisar(err.message, 'error'); setErrores(err.porCampo); }
    finally { setGuardando(false); }
  }

  async function quitar(r) {
    setOcupado(r.id); avisar(null);
    try { setData(await admin.del(`/apolin/recordatorios/${r.id}`)); }
    catch (err) { avisar(err.message, 'error'); }
    finally { setOcupado(null); }
  }

  const vigente = (r) => r.fechaInicio <= hoy() && hoy() <= r.fechaFin;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <form onSubmit={guardar} noValidate className="flex flex-col gap-4 self-start rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6">
        <h2 className="text-xl font-bold">Nuevo recordatorio</h2>
        <Field label="Título" error={errores.titulo}><Input value={d.titulo} maxLength={200} onChange={set('titulo')} placeholder="Ej. Mantenimiento de la red" /></Field>
        <Field label="Mensaje" error={errores.mensaje}><Textarea value={d.mensaje} maxLength={2000} onChange={set('mensaje')} className="min-h-24" /></Field>
        <Field label="Tipo"><Select value={d.tipo} onChange={set('tipo')}>{['Recordatorio', 'Evento', 'Aviso'].map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Desde" error={errores.fechaInicio}><Input type="date" value={d.fechaInicio} onChange={set('fechaInicio')} /></Field>
          <Field label="Hasta" error={errores.fechaFin}><Input type="date" value={d.fechaFin} min={d.fechaInicio} onChange={set('fechaFin')} /></Field>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[15px] font-bold">Imagen <span className="font-normal text-muted">(opcional, máx. 5 MB)</span></span>
          <SelectorArchivos archivos={imagen} onCambio={setImagen} multiple={false} compacto />
        </div>
        {aviso && <Alert tipo={aviso.tipo}>{aviso.texto}</Alert>}
        <Button type="submit" icono={BellPlus} cargando={guardando} className="self-start">Publicar recordatorio</Button>
      </form>

      <section>
        <h2 className="mb-3 text-lg font-bold">Recordatorios activos {data && <span className="font-normal text-muted">({data.length})</span>}</h2>
        {loading && <Cargando />}
        {error && <ErrorCarga error={error} onReintentar={recargar} />}
        {data && !data.length && <Vacio icono={BellPlus} titulo="No hay recordatorios">Apolin solo saludará y pedirá la ficha.</Vacio>}
        {data?.length > 0 && (
          <ul className="flex flex-col gap-3">
            {data.map((r) => (
              <li key={r.id} className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-line">
                {r.tieneImagen && <img src={archivoUrl(`/api/apolin/recordatorios/${r.id}/imagen`)} alt="" className="size-20 shrink-0 rounded-xl object-cover" loading="lazy" />}
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-bold uppercase tracking-wide text-biscuit">{r.tipo}</span>
                    <span className="text-muted">{fecha(r.fechaInicio)} – {fecha(r.fechaFin)}</span>
                    {vigente(r) && <span className="rounded-full bg-pine px-2 py-0.5 text-xs font-bold text-white">Hoy</span>}
                  </p>
                  <p className="font-bold">{r.titulo}</p>
                  <p className="line-clamp-2 text-muted">{r.mensaje}</p>
                </div>
                <BotonEliminar texto="Quitar" pregunta="¿Quitar?" cargando={ocupado === r.id} onConfirmar={() => quitar(r)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Prestamos() {
  const admin = useAdmin();
  const { data, loading, error, recargar, setData } = useCarga('/apolin/prestamos');
  const [ocupado, setOcupado] = useState(null);
  const [aviso, avisar] = useAviso();
  const [verTodos, setVerTodos] = useState(false);

  async function cambiar(p, estado) {
    setOcupado(p.id); avisar(null);
    try { setData(await admin.patch(`/apolin/prestamos/${p.id}`, { estado })); avisar(`Préstamo #${p.id}: ${estado.toLowerCase()}.`); }
    catch (err) { avisar(err.message, 'error'); }
    finally { setOcupado(null); }
  }

  if (loading && !data) return <Cargando />;
  if (error) return <ErrorCarga error={error} onReintentar={recargar} />;
  const lista = verTodos ? data : data.filter((p) => p.estado === 'Pendiente');

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted">Préstamos que se piden por Apolin. Al marcarlo como devuelto, deja de salir el aviso de préstamo vencido.</p>
        <label className="flex items-center gap-2 text-[15px]">
          <input type="checkbox" checked={verTodos} onChange={(e) => setVerTodos(e.target.checked)} className="size-4 accent-[var(--color-pine)]" />
          Ver también devueltos y cancelados
        </label>
      </div>
      {aviso && <Alert tipo={aviso.tipo}>{aviso.texto}</Alert>}
      {!lista.length ? <Vacio icono={Bot} titulo="No hay préstamos pendientes" /> : (
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-line">
          <table className="w-full min-w-[720px] text-left text-[15px]">
            <thead className="bg-sage-50 text-sm text-pine-800">
              <tr>{['#', 'Trabajador', 'Equipo', 'Préstamo', 'Devolver', 'Estado', ''].map((h) => <th key={h} className="px-4 py-2.5 font-bold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-line">
              {lista.map((p) => (
                <tr key={p.id} className={p.vencido ? 'bg-danger-50/50' : ''}>
                  <td className="px-4 py-3 tabular-nums text-muted">{p.id}</td>
                  <td className="px-4 py-3"><span className="block font-bold">{p.nombre}</span><span className="text-sm text-muted">Ficha {p.ficha} · {p.departamento}</span></td>
                  <td className="px-4 py-3">{p.equipo}</td>
                  <td className="px-4 py-3 tabular-nums">{fecha(p.fechaPrestamo)}</td>
                  <td className={`px-4 py-3 tabular-nums ${p.vencido ? 'font-bold text-danger' : ''}`}>{fecha(p.fechaDevolucion)}{p.vencido ? ' · vencido' : ''}</td>
                  <td className="px-4 py-3">{p.estado}</td>
                  <td className="px-4 py-3 text-right">
                    {p.estado === 'Pendiente' ? (
                      <span className="inline-flex gap-1.5">
                        <Button tamano="sm" variante="suave" icono={Save} cargando={ocupado === p.id} onClick={() => cambiar(p, 'Devuelto')}>Devuelto</Button>
                        <Button tamano="sm" variante="fantasma" onClick={() => cambiar(p, 'Cancelado')} disabled={ocupado === p.id}>Cancelar</Button>
                      </span>
                    ) : (
                      <Button tamano="sm" variante="fantasma" onClick={() => cambiar(p, 'Pendiente')} disabled={ocupado === p.id}>Reabrir</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function ApolinAdmin() {
  const [pestana, setPestana] = useState('recordatorios');
  return (
    <div className="flex flex-col gap-6">
      <EstadoIa />
      <div className="flex w-max gap-1 rounded-2xl bg-white p-1.5 ring-1 ring-line" role="tablist">
        {[['recordatorios', 'Recordatorios'], ['prestamos', 'Préstamos de equipos']].map(([id, texto]) => (
          <button key={id} type="button" role="tab" aria-selected={pestana === id} onClick={() => setPestana(id)}
            className={`rounded-xl px-3.5 py-2 text-[15px] font-bold ${pestana === id ? 'bg-sage-100 text-pine-800' : 'text-muted hover:text-pine-800'}`}>{texto}</button>
        ))}
      </div>
      {pestana === 'recordatorios' ? <Recordatorios /> : <Prestamos />}
    </div>
  );
}
