import { useRef, useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import { Field, Select, Textarea } from '../../../components/ui/Field.jsx';
import { Alert } from '../../../components/ui/Feedback.jsx';
import { useApi } from '../../../hooks/useApi.js';
import { FormularioSolicitud } from '../componentes/FormularioSolicitud.jsx';
import { solicitudesApi } from '../solicitudes.api.js';

const MAX_MB = 10;

export default function SoporteForm() {
  const { data: tipos } = useApi('/catalogos/tipos-soporte');
  const [tipoSoporteId, setTipo] = useState('');
  const [descripcion, setDesc] = useState('');
  const [archivo, setArchivo] = useState(null);
  const inputArchivo = useRef(null);

  const validar = () => {
    const e = {};
    if (!tipoSoporteId) e.tipoSoporteId = 'Seleccione el tipo de soporte';
    if (!descripcion.trim()) e.descripcion = 'Describa la falla';
    if (archivo && archivo.size > MAX_MB * 1024 * 1024) e.adjunto = `El archivo supera ${MAX_MB} MB`;
    return e;
  };

  const enviar = ({ cedula }) => {
    const fd = new FormData();
    fd.append('cedula', cedula);
    fd.append('tipoSoporteId', tipoSoporteId);
    fd.append('descripcion', descripcion);
    if (archivo) fd.append('adjunto', archivo);
    return solicitudesApi.soporte(fd);
  };

  const quitarArchivo = () => { setArchivo(null); if (inputArchivo.current) inputArchivo.current.value = ''; };

  return (
    <FormularioSolicitud
      titulo="Soporte de sistemas"
      descripcion="Reporta una falla de equipo, impresora, red, correo, SAP o telefonía."
      validar={validar}
      onReiniciar={() => { setTipo(''); setDesc(''); quitarArchivo(); }}
      onEnviar={enviar}
      accionesExito={(r) => r && (r.correoEnviado === false || r.adjuntoGuardado === false) && (
        <Alert tipo="aviso" className="text-left">
          La solicitud quedó registrada
          {r.adjuntoGuardado === false && ', pero el archivo adjunto no se pudo copiar a la carpeta de Sistemas'}
          {r.correoEnviado === false && (r.adjuntoGuardado === false ? ' y no se pudo enviar el aviso por correo' : ', pero no se pudo enviar el aviso por correo a Sistemas')}.
        </Alert>
      )}
    >
      {({ errores }) => (
        <>
          <Field label="Tipo de soporte" error={errores.tipoSoporteId} className="sm:max-w-md">
            <Select value={tipoSoporteId} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Seleccione una opción</option>
              {(tipos ?? []).filter((t) => !/desar+ol+o/i.test(t.nombre)).map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Descripción de la falla" error={errores.descripcion} hint="Qué pasa, desde cuándo y en qué equipo o sistema">
            <Textarea value={descripcion} onChange={(e) => setDesc(e.target.value)} maxLength={1000} className="min-h-36" />
          </Field>
          <div>
            <p className="mb-1.5 text-[15px] font-bold">Adjuntar archivo <span className="font-normal text-muted">(opcional)</span></p>
            {archivo ? (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-sage-50 px-4 py-3 ring-1 ring-sage-200">
                <span className="flex min-w-0 items-center gap-2"><Paperclip className="size-4 shrink-0 text-pine-600" aria-hidden /><span className="truncate">{archivo.name}</span></span>
                <button type="button" onClick={quitarArchivo} className="rounded-lg p-1 text-muted hover:bg-white" aria-label="Quitar archivo"><X className="size-4" /></button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-sage-400 px-4 py-4 text-muted hover:bg-sage-50 focus-within:ring-4 focus-within:ring-sage/60">
                <Paperclip className="size-5 text-pine-600" aria-hidden />
                <span><span className="font-bold text-pine">Elegir archivo</span> · captura de pantalla, foto o documento (máx. {MAX_MB} MB)</span>
                <input ref={inputArchivo} type="file" className="sr-only" accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
              </label>
            )}
            {errores.adjunto && <p className="mt-1.5 text-sm text-danger">{errores.adjunto}</p>}
          </div>
        </>
      )}
    </FormularioSolicitud>
  );
}
