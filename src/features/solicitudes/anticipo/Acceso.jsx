import { useState } from 'react';
import { KeyRound, LogIn, Search, UserPlus } from 'lucide-react';
import { Field, Input } from '../../../components/ui/Field.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Feedback.jsx';
import { anticipoApi } from './anticipo.api.js';

const soloDigitos = (v) => v.replace(/\D/g, '').slice(0, 10);

/** Inicio de sesión (btnLogin_Click de portal_solic.aspx). */
function Ingresar({ abierto, cedulaInicial, onIngreso }) {
  const [cedula, setCedula] = useState(cedulaInicial);
  const [clave, setClave] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function enviar(e) {
    e.preventDefault();
    if (cedula.length < 5 || !clave) { setError('Escriba su cédula y su clave.'); return; }
    setEnviando(true); setError('');
    try { onIngreso(await anticipoApi.ingresar({ cedula, clave })); }
    catch (err) { setError(err.message); }
    finally { setEnviando(false); }
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-5 rounded-3xl bg-white p-6 ring-1 ring-line sm:p-8">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold"><KeyRound className="size-5 text-pine" aria-hidden /> Ingresar</h2>
        <p className="mt-1 text-muted">Con la cédula y la clave que registraste en el portal.</p>
      </div>
      <Field label="Cédula de identidad">
        <Input inputMode="numeric" autoComplete="username" value={cedula} onChange={(e) => setCedula(soloDigitos(e.target.value))} placeholder="Ej. 12345678" />
      </Field>
      <Field label="Clave">
        <Input type="password" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} />
      </Field>
      {error && <Alert>{error}</Alert>}
      <Button type="submit" icono={LogIn} cargando={enviando} disabled={!abierto} className="self-start">Ingresar</Button>
    </form>
  );
}

/** Registro de acceso (btnRegister_Click): datos del SPI, el trabajador pone correo y clave. */
function Registrarse({ onRegistro }) {
  const [cedula, setCedula] = useState('');
  const [datos, setDatos] = useState(null);
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [clave2, setClave2] = useState('');
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function buscar() {
    if (cedula.length < 5) { setErrores({ cedula: 'Escriba la cédula completa' }); return; }
    setCargando(true); setError(''); setErrores({});
    try {
      const d = await anticipoApi.datosRegistro(cedula);
      setDatos(d);
      setCorreo(d.correo || '');
    } catch (err) { setError(err.message); setDatos(null); }
    finally { setCargando(false); }
  }

  async function registrar(e) {
    e.preventDefault();
    const er = {};
    if (!/^\S+@\S+\.\S+$/.test(correo)) er.correo = 'Escriba un correo válido';
    if (clave.length < 4) er.clave = 'Mínimo 4 caracteres';
    if (clave !== clave2) er.clave2 = 'Las claves no coinciden';
    setErrores(er);
    if (Object.keys(er).length) return;
    setCargando(true); setError('');
    try {
      await anticipoApi.registrar({ cedula, clave, correo });
      onRegistro(cedula);
    } catch (err) { setError(err.message); setErrores(err.porCampo || {}); }
    finally { setCargando(false); }
  }

  return (
    <form onSubmit={registrar} noValidate className="flex flex-col gap-5 rounded-3xl bg-sage-50 p-6 ring-1 ring-line sm:p-8">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold"><UserPlus className="size-5 text-pine" aria-hidden /> ¿Primera vez?</h2>
        <p className="mt-1 text-muted">Crea tu acceso. Tus datos se toman del sistema de nómina.</p>
      </div>
      <div className="flex items-end gap-2">
        <Field label="Cédula de identidad" error={errores.cedula} className="flex-1">
          <Input inputMode="numeric" value={cedula}
            onChange={(e) => { setCedula(soloDigitos(e.target.value)); setDatos(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscar(); } }} placeholder="Ej. 12345678" />
        </Field>
        <Button type="button" variante="secundario" icono={Search} cargando={cargando && !datos} onClick={buscar} className={errores.cedula ? 'mb-7' : ''}>Buscar</Button>
      </div>

      {datos?.registrado && <Alert tipo="aviso">Esta cédula ya tiene acceso. Ingresa con tu clave.</Alert>}
      {datos && !datos.registrado && (
        <>
          <dl className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-inset ring-line sm:grid-cols-2">
            {[['Nombre', `${datos.nombre} ${datos.apellido}`], ['Nómina', datos.nomina], ['Departamento', datos.departamento], ['Cargo', datos.cargo]].map(([k, v]) => (
              <div key={k}><dt className="text-sm text-muted">{k}</dt><dd className="font-bold">{v || '—'}</dd></div>
            ))}
          </dl>
          <Field label="Correo" hint="Aquí te llegarán los avisos de Recursos Humanos" error={errores.correo}>
            <Input type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Clave" error={errores.clave}>
              <Input type="password" autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} />
            </Field>
            <Field label="Repite la clave" error={errores.clave2}>
              <Input type="password" autoComplete="new-password" value={clave2} onChange={(e) => setClave2(e.target.value)} />
            </Field>
          </div>
          <Button type="submit" icono={UserPlus} cargando={cargando} className="self-start">Crear acceso</Button>
        </>
      )}
      {error && <Alert>{error}</Alert>}
    </form>
  );
}

export function Acceso({ estado, onIngreso }) {
  const [cedulaLogin, setCedulaLogin] = useState('');
  const [registrado, setRegistrado] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {estado && !estado.abierto && (
        <Alert tipo="aviso">
          Las solicitudes de anticipo se hacen del 1 al {estado.diaLimite} de cada mes. Puedes crear tu acceso ahora y solicitar el próximo mes.
        </Alert>
      )}
      {registrado && <Alert tipo="exito">Acceso creado. Ya puedes ingresar con tu clave.</Alert>}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Ingresar key={cedulaLogin} abierto={estado?.abierto !== false} cedulaInicial={cedulaLogin} onIngreso={onIngreso} />
        <Registrarse onRegistro={(c) => { setCedulaLogin(c); setRegistrado(true); }} />
      </div>
    </div>
  );
}
