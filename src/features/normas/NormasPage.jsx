import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { ListaDocumentos } from '../../components/ListaDocumentos.jsx';

export default function NormasPage() {
  return (
    <>
      <PageHeader titulo="Normas" descripcion="Código de ética, normas de planta y políticas internas vigentes." />
      <ListaDocumentos endpoint="/documentos/normas" vacio="Aún no hay normas publicadas" />
    </>
  );
}
