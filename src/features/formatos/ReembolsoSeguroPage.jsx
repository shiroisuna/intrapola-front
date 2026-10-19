import { useEffect, useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Alert } from '../../components/ui/Feedback.jsx';
import { api, apiUrl } from '../../api/client.js';

const RUTA = '/formatos/archivo/reembolso-seguro';

/** Planilla del banco (PDF fijo en el servidor): vista previa, abrir en otra pestaña o descargar. */
export default function ReembolsoSeguroPage() {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let creada;
    let vigente = true;
    api.blob(RUTA)
      .then((blob) => { if (vigente && blob) { creada = URL.createObjectURL(blob); setUrl(creada); } })
      .catch((err) => vigente && setError(err.message));
    return () => { vigente = false; if (creada) URL.revokeObjectURL(creada); };
  }, []);

  const boton = 'inline-flex h-11 items-center gap-2 rounded-xl px-4 font-bold';
  return (
    <>
      <PageHeader
        titulo="Planilla de reembolso de seguro"
        descripcion="Formato de Banesco Seguros. Descárgalo, llénalo y entrégalo a Recursos Humanos con las facturas e informes."
        volver={{ to: '/formatos', texto: 'Formatos' }}
        acciones={!error && (
          <>
            <a href={apiUrl(`/api${RUTA}`)} target="_blank" rel="noreferrer" className={`${boton} bg-white text-pine ring-1 ring-inset ring-line hover:bg-sage-50`}>
              <ExternalLink className="size-[18px]" aria-hidden /> Abrir
            </a>
            <a href={apiUrl(`/api${RUTA}?descargar`)} className={`${boton} bg-pine text-white hover:bg-pine-800`}>
              <Download className="size-[18px]" aria-hidden /> Descargar
            </a>
          </>
        )}
      />
      {error ? (
        <Alert>{error}</Alert>
      ) : url ? (
        <iframe title="Planilla de reembolso de seguro" src={url} className="h-[78vh] min-h-[520px] w-full rounded-2xl bg-white ring-1 ring-line" />
      ) : (
        <div className="grid h-[60vh] place-items-center rounded-2xl bg-white text-muted ring-1 ring-line">Cargando planilla…</div>
      )}
    </>
  );
}
