import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleCheck } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Feedback.jsx';
import { useApi } from '../../../hooks/useApi.js';
import { Acceso } from './Acceso.jsx';
import { PanelAnticipo } from './PanelAnticipo.jsx';

/**
 * Anticipo de prestaciones: portal con clave (portal_solic.aspx) + solicitud (solic_antic_prest.aspx).
 * La sesión vive solo en memoria: al recargar la página o al terminar la solicitud se cierra, como en el C#.
 */
export default function AnticipoPage() {
  const { data: estado } = useApi('/solicitudes/anticipos/estado');
  const [sesion, setSesion] = useState(null);
  const [resultado, setResultado] = useState(null);

  return (
    <>
      <PageHeader
        titulo="Anticipo de prestaciones"
        descripcion={`Consulta tu saldo disponible y solicita un anticipo. Disponible del 1 al ${estado?.diaLimite ?? 10} de cada mes.`}
        volver={{ to: '/solicitudes', texto: 'Solicitudes' }}
      />

      {resultado ? (
        <div className="animar-entrada mx-auto max-w-xl rounded-3xl bg-white p-8 text-center ring-1 ring-line sm:p-10">
          <CircleCheck className="mx-auto size-14 text-pine-600" aria-hidden />
          <h2 className="mt-4 text-2xl font-bold">Solicitud enviada</h2>
          <p className="mt-2 text-muted">Anticipo de prestaciones a nombre de <strong className="text-ink">{resultado.solicitante}</strong>.</p>
          <p className="mt-6 text-[15px] text-muted">Monto solicitado</p>
          <p className="font-display text-5xl font-bold tracking-tight text-pine">{resultado.numero}</p>
          <p className="mt-6 text-muted">Recuerda imprimir, firmar y entregar tu planilla a Recursos Humanos.</p>
          {resultado.correoEnviado === false && (
            <Alert tipo="aviso" className="mt-4 text-left">La solicitud quedó registrada, pero no se pudo enviar el aviso por correo a Recursos Humanos.</Alert>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={() => setResultado(null)}>Listo</Button>
            <Link to="/solicitudes/mis-solicitudes" className="inline-flex h-11 items-center rounded-xl px-4 font-bold text-pine ring-1 ring-inset ring-line hover:bg-sage-50">Ver mis solicitudes</Link>
          </div>
        </div>
      ) : sesion ? (
        <PanelAnticipo
          sesion={sesion}
          onSalir={() => setSesion(null)}
          onSolicitado={(r) => { setSesion(null); setResultado(r); }}
        />
      ) : (
        <Acceso estado={estado} onIngreso={setSesion} />
      )}
    </>
  );
}
