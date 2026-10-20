import { useMemo, useRef, useState } from 'react';
import { Pencil, Phone, Plus, RotateCcw, Save, X } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Field, Input, Select } from '../../components/ui/Field.jsx';
import { Alert, Cargando, ErrorCarga, Vacio } from '../../components/ui/Feedback.jsx';
import { Buscador } from '../../components/ui/Buscador.jsx';
import { normalizar } from '../../utils/texto.js';
import { useAdmin } from './sesion.js';
import { BotonEliminar, useAviso, useCarga } from './componentes.jsx';

/*
 * Directorio telefónico (amapolanet.extenciones): extensiones, números de emergencia y proveedores.
 */
const TIPOS = [
  { id: 'extension', texto: 'Extensiones', uno: 'extensión', grupo: 'Departamento' },
  { id: 'emergencia', texto: 'Emergencias', uno: 'número de emergencia', grupo: 'Servicio' },
  { id: 'proveedor', texto: 'Proveedores', uno: 'proveedor', grupo: 'Servicio' },
  { id: 'inactiva', texto: 'Desactivadas', uno: 'extensión', grupo: 'Departamento' },
];
const VACIO = { tipo: 'extension', departamento: '', nombre: '', extension: '', telefono: '', asterisco: '', correo: '', esPersona: true };

function Formulario({ inicial, departamentos, onGuardar, onCancelar }) {
  const [d, setD] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => { setD((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })); setErrores((x) => ({ ...x, [k]: undefined })); };
  const esExt = d.tipo === 'extension';
  const tipo = TIPOS.find((t) => t.id === d.tipo);

  async function enviar(e) {
    e.preventDefault();
    const er = {};
    if (!d.departamento.trim()) er.departamento = `Indique el ${tipo.grupo.toLowerCase()}`;
    if (!d.nombre.trim()) er.nombre = 'Indique el nombre';
    if (esExt && !/^\d{1,9}$/.test(d.extension.trim())) er.extension = 'Solo números';
    if (!esExt && !d.telefono.trim()) er.telefono = 'Indique el teléfono';
    if (d.correo && !/^\S+@\S+\.\S+$/.test(d.correo)) er.correo = 'Correo inválido';
    setErrores(er);
    if (Object.keys(er).length) return;
    setEnviando(true); setError('');
    try { await onGuardar(d); }
    catch (err) { setError(err.message); setErrores(err.porCampo); setEnviando(false); }
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4 rounded-3xl bg-white p-5 ring-2 ring-pine/20 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{inicial.id ? `Editar ${tipo.uno}` : 'Nuevo registro'}</h2>
        <Button variante="fantasma" tamano="icono" icono={X} onClick={onCancelar} aria-label="Cerrar" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo">
          <Select value={d.tipo} onChange={set('tipo')} disabled={Boolean(inicial.id) && inicial.tipo !== 'extension'}>
            {TIPOS.slice(0, 3).map((t) => <option key={t.id} value={t.id}>{t.uno[0].toUpperCase() + t.uno.slice(1)}</option>)}
          </Select>
        </Field>
        <Field label={tipo.grupo} error={errores.departamento}>
          <Input value={d.departamento} onChange={set('departamento')} list="lista-departamentos" maxLength={150} placeholder={esExt ? 'Ej. SISTEMAS' : 'Ej. Bomberos'} />
        </Field>
        <Field label={esExt ? 'Nombre' : 'Nombre o empresa'} error={errores.nombre}>
          <Input value={d.nombre} onChange={set('nombre')} maxLength={150} placeholder={esExt ? 'Ej. JOSE MARIN o Recepción' : ''} />
        </Field>
        {esExt ? (
          <Field label="Extensión" error={errores.extension}>
            <Input value={d.extension} onChange={set('extension')} inputMode="numeric" maxLength={9} placeholder="Ej. 1234" />
          </Field>
        ) : (
          <Field label="Teléfono" error={errores.telefono}>
            <Input value={d.telefono} onChange={set('telefono')} inputMode="tel" maxLength={50} placeholder="Ej. 0239-5551234" />
          </Field>
        )}
        <Field label="Correo" opcional error={errores.correo}>
          <Input type="email" value={d.correo} onChange={set('correo')} maxLength={150} />
        </Field>
        {esExt && (
          <Field label="Marcación rápida" opcional hint="El código con * si lo tiene">
            <Input value={d.asterisco} onChange={set('asterisco')} maxLength={50} />
          </Field>
        )}
      </div>
      {esExt && (
        <label className="flex items-center gap-2.5 text-[15px]">
          <input type="checkbox" checked={d.esPersona} onChange={set('esPersona')} className="size-4 accent-[var(--color-pine)]" />
          Es una persona <span className="text-muted">(desmárquelo para áreas como “Recepción” o “Comedor”)</span>
        </label>
      )}
      <datalist id="lista-departamentos">{departamentos.map((x) => <option key={x} value={x} />)}</datalist>
      {error && <Alert>{error}</Alert>}
      <div className="flex gap-2">
        <Button type="submit" icono={Save} cargando={enviando}>Guardar</Button>
        <Button variante="secundario" onClick={onCancelar}>Cancelar</Button>
      </div>
    </form>
  );
}

export default function DirectorioAdmin() {
  const admin = useAdmin();
  const { data, loading, error, recargar, setData } = useCarga('/directorio');
  const [tipo, setTipo] = useState('extension');
  const [q, setQ] = useState('');
  const [editando, setEditando] = useState(null);
  const [ocupado, setOcupado] = useState(null);
  const [aviso, avisar] = useAviso();
  const arriba = useRef(null);

  const conteo = useMemo(() => (data ?? []).reduce((a, x) => ({ ...a, [x.tipo]: (a[x.tipo] ?? 0) + 1 }), {}), [data]);
  const departamentos = useMemo(() => [...new Set((data ?? []).filter((x) => x.tipo === (editando?.tipo ?? tipo)).map((x) => x.departamento).filter(Boolean))].sort(), [data, editando, tipo]);
  const grupos = useMemo(() => {
    const n = normalizar(q);
    return (data ?? [])
      .filter((x) => x.tipo === tipo && normalizar(`${x.nombre} ${x.departamento} ${x.extension} ${x.telefono} ${x.correo}`).includes(n))
      .reduce((acc, x) => ((acc[x.departamento || 'Sin departamento'] ||= []).push(x), acc), {});
  }, [data, tipo, q]);

  const abrir = (x) => { setEditando(x); avisar(null); setTimeout(() => arriba.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0); };

  async function guardar(d) {
    const cuerpo = { ...d, tipo: d.tipo === 'inactiva' ? 'extension' : d.tipo };
    const lista = d.id ? await admin.put(`/directorio/${d.id}`, cuerpo) : await admin.post('/directorio', cuerpo);
    setData(lista);
    setEditando(null);
    setTipo(d.tipo === 'inactiva' ? 'inactiva' : cuerpo.tipo);
    avisar(d.id ? 'Cambios guardados.' : 'Registro agregado al directorio.');
  }

  async function accion(x, fn, texto) {
    setOcupado(x.id); avisar(null);
    try { setData(await fn()); avisar(texto); }
    catch (err) { avisar(err.message, 'error'); }
    finally { setOcupado(null); }
  }

  if (loading && !data) return <Cargando />;
  if (error) return <ErrorCarga error={error} onReintentar={recargar} />;
  const t = TIPOS.find((x) => x.id === tipo);

  return (
    <div className="flex flex-col gap-6" ref={arriba}>
      {editando && (
        <Formulario key={editando.id ?? 'nuevo'} inicial={editando.tipo === 'inactiva' ? { ...editando, tipo: 'extension' } : editando}
          departamentos={departamentos} onGuardar={guardar} onCancelar={() => setEditando(null)} />
      )}
      {aviso && <Alert tipo={aviso.tipo}>{aviso.texto}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-2xl bg-white p-1.5 ring-1 ring-line" role="tablist">
          {TIPOS.filter((x) => x.id !== 'inactiva' || conteo.inactiva).map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={tipo === x.id} onClick={() => setTipo(x.id)}
              className={`rounded-xl px-3.5 py-2 text-[15px] font-bold transition-colors ${tipo === x.id ? 'bg-sage-100 text-pine-800' : 'text-muted hover:text-pine-800'}`}>
              {x.texto} <span className="font-normal">({conteo[x.id] ?? 0})</span>
            </button>
          ))}
        </div>
        <Button icono={Plus} onClick={() => abrir({ ...VACIO, tipo: tipo === 'inactiva' ? 'extension' : tipo })}>Agregar</Button>
      </div>

      <Buscador valor={q} onCambio={setQ} placeholder="Nombre, departamento o número" etiqueta="Buscar en el directorio" className="max-w-md" />

      {Object.keys(grupos).length === 0 ? (
        <Vacio icono={Phone} titulo={q ? 'Nada coincide con la búsqueda' : `No hay ${t.texto.toLowerCase()}`} />
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b, 'es')).map(([grupo, filas]) => (
            <section key={grupo}>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-pine-600">{grupo}</h3>
              <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
                {filas.map((x) => (
                  <li key={x.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                    <span className="w-28 shrink-0 font-display text-xl font-bold tabular-nums text-pine">{x.tipo === 'extension' || x.tipo === 'inactiva' ? x.extension : x.telefono}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block ${x.esPersona || x.tipo !== 'extension' ? 'font-bold' : 'text-muted'}`}>{x.nombre}</span>
                      {x.correo && <span className="block truncate text-sm text-muted">{x.correo}</span>}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Button variante="fantasma" tamano="sm" icono={Pencil} onClick={() => abrir(x)}>Editar</Button>
                      {x.tipo === 'extension' && (
                        <BotonEliminar texto="Desactivar" pregunta="¿Desactivar?" cargando={ocupado === x.id}
                          onConfirmar={() => accion(x, () => admin.patch(`/directorio/${x.id}`, { activo: false }), `${x.nombre} se quitó del directorio.`)} />
                      )}
                      {x.tipo === 'inactiva' && (
                        <>
                          <Button variante="suave" tamano="sm" icono={RotateCcw} cargando={ocupado === x.id}
                            onClick={() => accion(x, () => admin.patch(`/directorio/${x.id}`, { activo: true }), `${x.nombre} volvió al directorio.`)}>Reactivar</Button>
                          <BotonEliminar texto="Eliminar" cargando={ocupado === x.id} onConfirmar={() => accion(x, () => admin.del(`/directorio/${x.id}`), 'Registro eliminado.')} />
                        </>
                      )}
                      {(x.tipo === 'emergencia' || x.tipo === 'proveedor') && (
                        <BotonEliminar texto="Eliminar" cargando={ocupado === x.id} onConfirmar={() => accion(x, () => admin.del(`/directorio/${x.id}`), 'Registro eliminado.')} />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
