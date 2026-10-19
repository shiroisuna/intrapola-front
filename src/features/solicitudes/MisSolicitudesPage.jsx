import { useState } from 'react';
import { Inbox, Printer, Search } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Field, Input } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Alert, EstadoBadge, Vacio } from '../../components/ui/Feedback.jsx';
import { fechaHora, fechaLarga } from '../../utils/fechas.js';
import { apiUrl } from '../../api/client.js';
import { solicitudesApi } from './solicitudes.api.js';

/** Los permisos traen la fecha DEL permiso; las demás, la fecha de registro. */
const textoFecha = (s) => {
  if (s.fechaTipo === 'para') return `Para el ${fechaLarga(s.fecha)}`;
  return String(s.fecha).length <= 10 ? `Registrada el ${fechaLarga(s.fecha)}` : fechaHora(s.fecha);
};

export default function MisSolicitudesPage() {
  const [cedula, setCedula] = useState('');
  const [lista, setLista] = useState(null);
  const [avisos, setAvisos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function consultar(e) {
    e.preventDefault();
    if (cedula.length < 5) { setError('Escriba la cédula completa, solo números'); return; }
    setCargando(true); setError('');
    try {
      const r = await solicitudesApi.mias(cedula);
      setLista(r.solicitudes);
      setAvisos(r.avisos ?? []);
    } catch (err) { setError(err.message); setLista(null); setAvisos([]); }
    finally { setCargando(false); }
  }

  return (
    <>
      <PageHeader titulo="Mis solicitudes" descripcion="Consulta el estado de las solicitudes hechas con tu cédula." volver={{ to: '/solicitudes', texto: 'Solicitudes' }} />

      <form onSubmit={consultar} className="mb-8 flex max-w-md items-end gap-2">
        <Field label="Cédula de identidad" className="flex-1">
          <Input inputMode="numeric" value={cedula} onChange={(e) => { setCedula(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }} placeholder="Ej. 12345678" />
        </Field>
        <Button type="submit" icono={Search} cargando={cargando}>Consultar</Button>
      </form>

      {error && <Alert className="mb-6 max-w-xl">{error}</Alert>}
      {avisos.map((a) => <Alert key={a} tipo="aviso" className="mb-4 max-w-xl">{a}</Alert>)}

      {lista && (lista.length === 0 ? (
        <Vacio icono={Inbox} titulo="No hay solicitudes con esta cédula">Cuando hagas una solicitud aparecerá aquí con su estado.</Vacio>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
          {lista.map((s) => (
            <li key={s.clave} className="grid gap-2 px-5 py-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center sm:gap-4">
              <span className="font-display text-lg font-bold text-pine">{s.numero != null ? `N.º ${String(s.numero).padStart(6, '0')}` : '—'}</span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{s.tipo}</span>
                  <EstadoBadge estado={s.estado} />
                </span>
                <span className="block truncate text-muted">{s.descripcion}</span>
                <span className="text-sm text-muted">{textoFecha(s)}</span>
              </span>
              {s.pdfUrl && (
                <a href={apiUrl(s.pdfUrl)} target="_blank" rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 font-bold text-pine ring-1 ring-inset ring-line hover:bg-sage-50">
                  <Printer className="size-5" aria-hidden /> Ver hoja
                </a>
              )}
            </li>
          ))}
        </ul>
      ))}
    </>
  );
}
