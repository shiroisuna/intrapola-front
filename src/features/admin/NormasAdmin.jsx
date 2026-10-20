import { useState } from 'react';
import { Check, FileText, Pencil, Upload, X } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Field, Input } from '../../components/ui/Field.jsx';
import { Alert, Cargando, ErrorCarga, Vacio } from '../../components/ui/Feedback.jsx';
import { archivoUrl } from '../../api/client.js';
import { useAdmin } from './sesion.js';
import { BotonEliminar, Progreso, SelectorArchivos, useAviso, useCarga } from './componentes.jsx';

const tamano = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const fecha = (iso) => new Date(iso).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' });

function Norma({ n, onRenombrar, onRetirar, ocupado }) {
  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState(n.titulo);

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sage-100 text-xs font-bold text-pine-800">PDF</span>
      {editando ? (
        <form className="flex min-w-0 flex-1 items-center gap-2" onSubmit={async (e) => {
          e.preventDefault();
          if (await onRenombrar(n, titulo)) setEditando(false);
        }}>
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={150} autoFocus aria-label="Nuevo nombre" className="min-w-0 flex-1" />
          <Button type="submit" tamano="icono" icono={Check} cargando={ocupado} aria-label="Guardar nombre" />
          <Button variante="fantasma" tamano="icono" icono={X} onClick={() => { setTitulo(n.titulo); setEditando(false); }} aria-label="Cancelar" />
        </form>
      ) : (
        <a href={archivoUrl(n.archivoUrl)} target="_blank" rel="noreferrer" className="min-w-0 flex-1 hover:text-pine">
          <span className="block font-bold">{n.titulo}</span>
          <span className="block text-sm text-muted">{tamano(n.tamano)} · {fecha(n.publicadoEn)}</span>
        </a>
      )}
      {!editando && (
        <span className="flex items-center gap-2">
          <Button variante="fantasma" tamano="sm" icono={Pencil} onClick={() => setEditando(true)}>Renombrar</Button>
          <BotonEliminar texto="Retirar" pregunta="¿Retirar?" cargando={ocupado} onConfirmar={() => onRetirar(n)} />
        </span>
      )}
    </li>
  );
}

export default function NormasAdmin() {
  const admin = useAdmin();
  const { data, loading, error, recargar, setData } = useCarga('/normas');
  const [archivos, setArchivos] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [reemplazar, setReemplazar] = useState(false);
  const [progreso, setProgreso] = useState(null);
  const [ocupado, setOcupado] = useState(null);
  const [aviso, avisar] = useAviso();

  async function publicar() {
    const form = new FormData();
    archivos.forEach((f) => form.append('archivos', f));
    if (archivos.length === 1 && titulo.trim()) form.append('titulo', titulo.trim());
    form.append('reemplazar', String(reemplazar));
    setProgreso(0); avisar(null);
    try {
      setData(await admin.subir('POST', '/normas', form, setProgreso));
      avisar(archivos.length === 1 ? 'Norma publicada.' : `${archivos.length} normas publicadas.`);
      setArchivos([]); setTitulo(''); setReemplazar(false);
    } catch (err) { avisar(err.message, 'error'); }
    finally { setProgreso(null); }
  }

  async function renombrar(n, nuevo) {
    if (nuevo.trim() === n.titulo) return true;
    setOcupado(n.id); avisar(null);
    try { setData(await admin.patch(`/normas/${encodeURIComponent(n.id)}`, { titulo: nuevo })); return true; }
    catch (err) { avisar(err.message, 'error'); return false; }
    finally { setOcupado(null); }
  }

  async function retirar(n) {
    setOcupado(n.id); avisar(null);
    try { setData(await admin.del(`/normas/${encodeURIComponent(n.id)}`)); avisar(`"${n.titulo}" se retiró. El archivo queda guardado en la carpeta _eliminadas del servidor.`); }
    catch (err) { avisar(err.message, 'error'); }
    finally { setOcupado(null); }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6">
        <div>
          <h2 className="text-xl font-bold">Publicar normas</h2>
          <p className="mt-1 text-muted">El nombre del archivo es el nombre que verán todos. Para actualizar una norma, súbala con el mismo nombre y marque “reemplazar”.</p>
        </div>
        <SelectorArchivos archivos={archivos} onCambio={setArchivos} aceptar="pdf" texto="Elegir PDF o soltarlos aquí" ayuda="Solo archivos PDF; puede elegir varios" />
        {archivos.length === 1 && (
          <Field label="Nombre que se mostrará" opcional hint={`Si lo deja vacío se usa “${archivos[0].name.replace(/\.pdf$/i, '')}”`}>
            <Input value={titulo} maxLength={150} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Código de ética" />
          </Field>
        )}
        {archivos.length > 0 && (
          <label className="flex items-center gap-2.5 text-[15px]">
            <input type="checkbox" checked={reemplazar} onChange={(e) => setReemplazar(e.target.checked)} className="size-4 accent-[var(--color-pine)]" />
            Reemplazar si ya existe una norma con el mismo nombre
          </label>
        )}
        <Progreso valor={progreso} />
        {aviso && <Alert tipo={aviso.tipo}>{aviso.texto}</Alert>}
        <Button icono={Upload} disabled={!archivos.length} cargando={progreso != null} onClick={publicar} className="self-start">Publicar</Button>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Normas publicadas {data && <span className="font-normal text-muted">({data.length})</span>}</h2>
        {loading && <Cargando />}
        {error && <ErrorCarga error={error} onReintentar={recargar} />}
        {data && !data.length && <Vacio icono={FileText} titulo="No hay normas publicadas" />}
        {data?.length > 0 && (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
            {data.map((n) => <Norma key={n.id} n={n} onRenombrar={renombrar} onRetirar={retirar} ocupado={ocupado === n.id} />)}
          </ul>
        )}
      </section>
    </div>
  );
}
