import { useState } from 'react';
import { Printer } from 'lucide-react';
import { Field, Input, Textarea } from '../../../components/ui/Field.jsx';
import { Alert } from '../../../components/ui/Feedback.jsx';
import { useApi } from '../../../hooks/useApi.js';
import { apiUrl } from '../../../api/client.js';
import { FormularioSolicitud } from '../componentes/FormularioSolicitud.jsx';
import { solicitudesApi } from '../solicitudes.api.js';

const INICIAL = { nombreUsuario: '', cedulaUsuario: '', cargoUsuario: '', comunicacion: [], sap: [], spi: [], otrosSistemas: [], observaciones: '' };

/** Grupo de opciones tipo "chip" (checkbox). */
function Chips({ titulo, opciones, seleccion, onToggle }) {
  return (
    <fieldset className="grid gap-2 sm:grid-cols-[9rem_1fr] sm:items-start">
      <legend className="contents"><span className="pt-2 text-[15px] font-bold">{titulo}</span></legend>
      <div className="flex flex-wrap gap-2">
        {opciones.map((o) => {
          const activo = seleccion.includes(o.codigo);
          return (
            <label key={o.codigo} className={`cursor-pointer select-none rounded-xl px-4 py-2 font-bold ring-1 ring-inset transition-colors focus-within:ring-4 focus-within:ring-sage ${activo ? 'bg-pine text-white ring-pine' : 'bg-white text-ink ring-line hover:bg-sage-50'}`}>
              <input type="checkbox" className="sr-only" checked={activo} onChange={() => onToggle(o.codigo)} />
              {o.nombre}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

const abrirHoja = (r) => r?.pdfUrl && window.open(apiUrl(r.pdfUrl), '_blank', 'noopener');

export default function UsuariosForm() {
  const { data: op } = useApi('/solicitudes/usuarios/opciones');
  const [f, setF] = useState(INICIAL);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const toggle = (k) => (codigo) => setF((s) => ({ ...s, [k]: s[k].includes(codigo) ? s[k].filter((x) => x !== codigo) : [...s[k], codigo] }));
  const [usaSap, setUsaSap] = useState(false);
  const [usaSpi, setUsaSpi] = useState(false);

  const validar = () => {
    const e = {};
    if (!f.nombreUsuario.trim()) e.nombreUsuario = 'Indique el nombre del usuario';
    if (!f.cargoUsuario.trim()) e.cargoUsuario = 'Indique el cargo';
    if (f.cedulaUsuario && !/^\d{5,10}$/.test(f.cedulaUsuario)) e.cedulaUsuario = 'Cédula inválida';
    if (usaSap && !f.sap.length) e.sap = 'Seleccione los módulos de SAP';
    if (usaSpi && !f.spi.length) e.spi = 'Seleccione los módulos de SPI';
    return e;
  };

  const enviar = async ({ cedula }) => {
    const r = await solicitudesApi.usuarios({ ...f, sap: usaSap ? f.sap : [], spi: usaSpi ? f.spi : [], cedula });
    abrirHoja(r);
    return r;
  };

  return (
    <FormularioSolicitud
      titulo="Usuario nuevo"
      descripcion="Para jefes de área: pide crear el usuario de una persona nueva con sus accesos. Al guardar se genera la hoja para firmar."
      textoBoton="Guardar y emitir"
      validar={validar}
      onReiniciar={() => { setF(INICIAL); setUsaSap(false); setUsaSpi(false); }}
      onEnviar={enviar}
      accionesExito={(r) => r && (
        <div className="flex flex-col items-center gap-4">
          {r.pdfUrl && (
            <a href={apiUrl(r.pdfUrl)} target="_blank" rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-pine px-6 text-[17px] font-bold text-white hover:bg-pine-800">
              <Printer className="size-5" aria-hidden /> Imprimir solicitud de usuario
            </a>
          )}
          {r.correoEnviado === false && <Alert tipo="aviso" className="text-left">La solicitud quedó registrada, pero no se pudo enviar el aviso por correo a Sistemas.</Alert>}
        </div>
      )}
    >
      {({ errores }) => (
        <>
          <h3 className="-mb-1 font-bold text-pine">Datos del usuario nuevo</h3>
          <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
            <Field label="Nombres y apellidos" error={errores.nombreUsuario}>
              <Input value={f.nombreUsuario} onChange={set('nombreUsuario')} maxLength={150} />
            </Field>
            <Field label="Cédula" opcional error={errores.cedulaUsuario}>
              <Input inputMode="numeric" value={f.cedulaUsuario} onChange={(e) => setF((s) => ({ ...s, cedulaUsuario: e.target.value.replace(/\D/g, '').slice(0, 10) }))} />
            </Field>
          </div>
          <Field label="Cargo" error={errores.cargoUsuario} className="sm:max-w-md">
            <Input value={f.cargoUsuario} onChange={set('cargoUsuario')} maxLength={150} />
          </Field>

          {op && (
            <>
              <h3 className="-mb-1 mt-2 font-bold text-pine">Comunicación</h3>
              {op.comunicacion.map((g) => (
                <Chips key={g.grupo} titulo={g.grupo} opciones={g.opciones} seleccion={f.comunicacion} onToggle={toggle('comunicacion')} />
              ))}

              <h3 className="-mb-1 mt-2 font-bold text-pine">Sistemas</h3>
              <Chips titulo="Acceso a" seleccion={[...(usaSap ? ['SAP'] : []), ...(usaSpi ? ['SPI'] : []), ...f.otrosSistemas]}
                opciones={['SAP', 'SPI', ...op.otrosSistemas].map((n) => ({ codigo: n, nombre: n }))}
                onToggle={(c) => (c === 'SAP' ? setUsaSap((v) => !v) : c === 'SPI' ? setUsaSpi((v) => !v) : toggle('otrosSistemas')(c))} />
              {usaSap && (
                <div>
                  <Chips titulo="Módulos SAP" opciones={op.sap} seleccion={f.sap} onToggle={toggle('sap')} />
                  {errores.sap && <p className="mt-1.5 text-sm text-danger sm:ml-[9.5rem]">{errores.sap}</p>}
                </div>
              )}
              {usaSpi && (
                <div>
                  <Chips titulo="Módulos SPI" opciones={op.spi} seleccion={f.spi} onToggle={toggle('spi')} />
                  {errores.spi && <p className="mt-1.5 text-sm text-danger sm:ml-[9.5rem]">{errores.spi}</p>}
                </div>
              )}
            </>
          )}

          <Field label="Recursos especiales u observaciones" opcional hint="Carpetas compartidas, impresoras, equipos, etc." error={errores.observaciones}>
            <Textarea value={f.observaciones} onChange={set('observaciones')} maxLength={500} />
          </Field>
        </>
      )}
    </FormularioSolicitud>
  );
}
