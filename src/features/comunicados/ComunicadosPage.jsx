import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Cargando, ErrorCarga, Vacio } from '../../components/ui/Feedback.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useLeidos } from './useLeidos.js';
import { ListaComunicados } from './ListaComunicados.jsx';
import { DetalleComunicado } from './DetalleComunicado.jsx';

export default function ComunicadosPage() {
  const { data, loading, error, recargar } = useApi('/contenido/comunicados?limite=50');
  const { esLeido, marcar } = useLeidos();
  const [abierto, setAbierto] = useState(null);

  return (
    <>
      <PageHeader titulo="Comunicados" descripcion="Avisos y anuncios vigentes de la empresa." />
      {loading && <Cargando />}
      {error && <ErrorCarga error={error} onReintentar={recargar} />}
      {data && !data.length && <Vacio icono={Megaphone} titulo="No hay comunicados vigentes" />}
      {data?.length > 0 && (
        <ListaComunicados comunicados={data} esLeido={esLeido} onAbrir={(c) => { setAbierto(c); marcar(c.id); }} />
      )}
      <DetalleComunicado comunicado={abierto} onCerrar={() => setAbierto(null)} />
    </>
  );
}
