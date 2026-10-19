import { useState } from 'react';
import { Plus, Printer, Trash2 } from 'lucide-react';
import { Field, Input, Textarea } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { api, apiUrl } from '../../api/client.js';
import { hoyISO } from '../../utils/fechas.js';
import { FormularioSolicitud } from '../solicitudes/componentes/FormularioSolicitud.jsx';

const INICIAL = { fechaSalida: hoyISO(), retorna: null, fechaRetorno: '', retira: '', cedulaRetira: '', observacion: '' };

/** Renglones de material: se arman aquí y se guardan juntos (sin temp_salidas). */
function Materiales({ items, setItems, error }) {
  const [desc, setDesc] = useState('');
  const [cant, setCant] = useState('1');
  const [err, setErr] = useState({});

  function agregar() {
    const e = {};
    if (!desc.trim()) e.desc = 'Describa el material o equipo';
    const n = Number(String(cant).replace(',', '.'));
    if (!(n > 0)) e.cant = 'Cantidad inválida';
    setErr(e);
    if (Object.keys(e).length) return;
    setItems((xs) => [...xs, { descripcion: desc.trim(), cantidad: n, clave: `${Date.now()}-${Math.random()}` }]);
    setDesc(''); setCant('1');
  }

  return (
    <div className="grid gap-4">
      <h3 className="font-bold text-pine">Materiales y equipos</h3>
      <div className="grid items-start gap-3 rounded-2xl bg-sage-50 p-4 ring-1 ring-inset ring-line sm:grid-cols-[1fr_7rem_auto]">
        <Field label="Descripción" error={err.desc} hint="Incluya marca, modelo o serial si aplica">
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={300}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } }} />
        </Field>
        <Field label="Cantidad" error={err.cant}>
          <Input inputMode="decimal" value={cant} onChange={(e) => setCant(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } }} />
        </Field>
        <Button type="button" variante="secundario" icono={Plus} onClick={agregar} className="sm:mt-[1.85rem]">Agregar</Button>
      </div>
      {items.length > 0 && (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl ring-1 ring-line">
          {items.map((x, i) => (
            <li key={x.clave} className="grid grid-cols-[2rem_1fr_auto_auto] items-center gap-3 px-4 py-2.5">
              <span className="text-muted">{i + 1}</span>
              <span className="min-w-0 font-bold">{x.descripcion}</span>
              <span className="tabular-nums">{x.cantidad}</span>
              <button type="button" onClick={() => setItems((xs) => xs.filter((y) => y.clave !== x.clave))}
                className="rounded-lg p-1.5 text-danger hover:bg-danger-50" aria-label={`Quitar renglón ${i + 1}`}>
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="-mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}

export default function SalidaMaterialesPage() {
  const [f, setF] = useState(INICIAL);
  const [items, setItems] = useState([]);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const validar = () => {
    const e = {};
    if (!f.fechaSalida) e.fechaSalida = 'Indique la fecha de salida';
    if (f.retorna === null) e.retorna = 'Indique si el material retorna';
    if (f.retorna && !f.fechaRetorno) e.fechaRetorno = 'Indique la fecha estimada de retorno';
    if (f.retorna && f.fechaRetorno && f.fechaRetorno < f.fechaSalida) e.fechaRetorno = 'El retorno no puede ser antes de la salida';
    if (!f.retira.trim()) e.retira = 'Indique quién retira';
    if (!items.length) e.items = 'Agregue al menos un material o equipo';
    return e;
  };

  const enviar = async ({ cedula }) => {
    const r = await api.post('/formatos/salida-materiales', {
      ...f, cedula, fechaRetorno: f.retorna ? f.fechaRetorno : '',
      items: items.map(({ descripcion, cantidad }) => ({ descripcion, cantidad })),
    });
    if (r?.pdfUrl) window.open(apiUrl(r.pdfUrl), '_blank', 'noopener');
    return r;
  };

  const opcion = (valor, texto) => (
    <label className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 font-bold ring-1 ring-inset focus-within:ring-4 focus-within:ring-sage ${f.retorna === valor ? 'bg-pine text-white ring-pine' : 'bg-white ring-line hover:bg-sage-50'}`}>
      <input type="radio" name="retorna" className="sr-only" checked={f.retorna === valor} onChange={() => setF((s) => ({ ...s, retorna: valor }))} />
      {texto}
    </label>
  );

  return (
    <FormularioSolicitud
      titulo="Salida de materiales y equipos"
      descripcion="Autoriza el retiro de materiales o equipos de la planta. La hoja se presenta firmada en la caseta de seguridad."
      volver={{ to: '/formatos', texto: 'Formatos' }}
      textoBoton="Guardar e imprimir"
      validar={validar}
      onReiniciar={() => { setF(INICIAL); setItems([]); }}
      onEnviar={enviar}
      accionesExito={(r) => r?.pdfUrl && (
        <a href={apiUrl(r.pdfUrl)} target="_blank" rel="noreferrer"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-pine px-6 text-[17px] font-bold text-white hover:bg-pine-800">
          <Printer className="size-5" aria-hidden /> Imprimir autorización
        </a>
      )}
    >
      {({ errores }) => (
        <>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Fecha de salida" error={errores.fechaSalida}>
              <Input type="date" value={f.fechaSalida} onChange={set('fechaSalida')} />
            </Field>
            <fieldset>
              <legend className="mb-1.5 text-[15px] font-bold">¿Retorna?</legend>
              <div className="flex gap-2">{opcion(true, 'Sí')}{opcion(false, 'No')}</div>
              {errores.retorna && <p className="mt-1.5 text-sm text-danger">{errores.retorna}</p>}
            </fieldset>
            {f.retorna && (
              <Field label="Fecha estimada de retorno" error={errores.fechaRetorno}>
                <Input type="date" value={f.fechaRetorno} min={f.fechaSalida} onChange={set('fechaRetorno')} />
              </Field>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
            <Field label="Persona o empresa que retira" error={errores.retira}>
              <Input value={f.retira} onChange={set('retira')} maxLength={150} />
            </Field>
            <Field label="Cédula o RIF" opcional error={errores.cedulaRetira}>
              <Input value={f.cedulaRetira} onChange={set('cedulaRetira')} maxLength={20} />
            </Field>
          </div>

          <Materiales items={items} setItems={setItems} error={errores.items} />

          <Field label="Observación" opcional error={errores.observacion} hint="Motivo de la salida, ej. reparación, préstamo, devolución a proveedor">
            <Textarea value={f.observacion} onChange={set('observacion')} maxLength={500} />
          </Field>
        </>
      )}
    </FormularioSolicitud>
  );
}
