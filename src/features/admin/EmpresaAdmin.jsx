import { useEffect, useState } from 'react';
import { Plus, Save, Undo2, X } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Field, Input, Textarea } from '../../components/ui/Field.jsx';
import { Alert, Cargando, ErrorCarga } from '../../components/ui/Feedback.jsx';
import { useAdmin } from './sesion.js';
import { useAviso, useCarga } from './componentes.jsx';

/* Datos de la empresa: se ven en "La empresa", en el inicio y en el encabezado de los PDF. */
const CAMPOS = ['nombre', 'rif', 'telefono', 'fax', 'correo', 'direccion', 'mapaUrl', 'mision', 'vision', 'valores'];
const tomar = (e) => Object.fromEntries(CAMPOS.map((k) => [k, k === 'valores' ? [...(e[k] ?? [])] : (e[k] ?? '')]));

function Valores({ valores, onCambio, error }) {
  const [nuevo, setNuevo] = useState('');
  const agregar = () => {
    const v = nuevo.trim();
    if (v && !valores.some((x) => x.toLowerCase() === v.toLowerCase())) onCambio([...valores, v]);
    setNuevo('');
  };
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[15px] font-bold">Valores</span>
      <ul className="flex flex-wrap gap-2">
        {valores.map((v, i) => (
          <li key={v} className="inline-flex items-center gap-1 rounded-full bg-sage-100 py-1 pl-3 pr-1 font-bold text-pine-800">
            {v}
            <button type="button" onClick={() => onCambio(valores.filter((_, j) => j !== i))} className="grid size-6 place-items-center rounded-full hover:bg-white" aria-label={`Quitar ${v}`}>
              <X className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex max-w-md gap-2">
        <Input value={nuevo} maxLength={60} onChange={(e) => setNuevo(e.target.value)} placeholder="Nuevo valor"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } }} aria-label="Nuevo valor" />
        <Button variante="suave" icono={Plus} onClick={agregar} disabled={!nuevo.trim()}>Agregar</Button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

export default function EmpresaAdmin() {
  const admin = useAdmin();
  const { data, loading, error, recargar, setData } = useCarga('/empresa');
  const [d, setD] = useState(null);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [aviso, avisar] = useAviso();

  useEffect(() => { if (data) setD(tomar(data)); }, [data]);
  if (loading && !data) return <Cargando />;
  if (error) return <ErrorCarga error={error} onReintentar={recargar} />;
  if (!d) return null;

  const set = (k) => (e) => { setD((x) => ({ ...x, [k]: e.target.value })); setErrores((x) => ({ ...x, [k]: undefined })); };
  const cambios = JSON.stringify(d) !== JSON.stringify(tomar(data));

  async function guardar(e) {
    e.preventDefault();
    const er = {};
    if (!d.nombre.trim()) er.nombre = 'Indique el nombre';
    if (!d.rif.trim()) er.rif = 'Indique el RIF';
    if (!d.mision.trim()) er.mision = 'Escriba la misión';
    if (!d.vision.trim()) er.vision = 'Escriba la visión';
    if (!d.valores.length) er.valores = 'Agregue al menos un valor';
    if (d.correo && !/^\S+@\S+\.\S+$/.test(d.correo)) er.correo = 'Correo inválido';
    setErrores(er);
    if (Object.keys(er).length) return;
    setGuardando(true); avisar(null);
    try { setData(await admin.put('/empresa', d)); avisar('Datos de la empresa guardados.'); }
    catch (err) { avisar(err.message, 'error'); setErrores(err.porCampo); }
    finally { setGuardando(false); }
  }

  return (
    <form onSubmit={guardar} noValidate className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6">
        <h2 className="text-xl font-bold">Datos de contacto</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre de la empresa" error={errores.nombre}><Input value={d.nombre} maxLength={150} onChange={set('nombre')} /></Field>
          <Field label="RIF" error={errores.rif}><Input value={d.rif} maxLength={20} onChange={set('rif')} /></Field>
          <Field label="Teléfono" opcional error={errores.telefono}><Input value={d.telefono} maxLength={60} onChange={set('telefono')} inputMode="tel" /></Field>
          <Field label="Fax" opcional error={errores.fax}><Input value={d.fax} maxLength={60} onChange={set('fax')} inputMode="tel" /></Field>
          <Field label="Correo" opcional error={errores.correo}><Input type="email" value={d.correo} maxLength={150} onChange={set('correo')} /></Field>
          <Field label="Enlace del mapa" opcional error={errores.mapaUrl} hint="En Google Maps: Compartir → Insertar un mapa → copie la dirección que está dentro de src=&quot;…&quot;">
            <Input value={d.mapaUrl} maxLength={600} onChange={set('mapaUrl')} placeholder="https://www.google.com/maps/embed?..." />
          </Field>
        </div>
        <Field label="Dirección" opcional error={errores.direccion}><Textarea value={d.direccion} maxLength={300} onChange={set('direccion')} className="min-h-20" /></Field>
        <p className="text-sm text-muted">El nombre, el RIF, la dirección y el teléfono también salen en el encabezado y el pie de las hojas PDF.</p>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6">
        <h2 className="text-xl font-bold">Misión, visión y valores</h2>
        <Field label="Misión" error={errores.mision}><Textarea value={d.mision} maxLength={1500} onChange={set('mision')} /></Field>
        <Field label="Visión" error={errores.vision}><Textarea value={d.vision} maxLength={1500} onChange={set('vision')} /></Field>
        <Valores valores={d.valores} error={errores.valores} onCambio={(valores) => { setD((x) => ({ ...x, valores })); setErrores((x) => ({ ...x, valores: undefined })); }} />
      </section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-lg ring-1 ring-line backdrop-blur">
        <Button type="submit" icono={Save} cargando={guardando} disabled={!cambios}>Guardar cambios</Button>
        {cambios && <Button variante="secundario" icono={Undo2} onClick={() => { setD(tomar(data)); setErrores({}); }}>Descartar</Button>}
        {aviso ? <Alert tipo={aviso.tipo} className="flex-1 py-2">{aviso.texto}</Alert> : !cambios && <span className="text-sm text-muted">Sin cambios pendientes</span>}
      </div>
    </form>
  );
}
