import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { ListaDocumentos } from '../../components/ListaDocumentos.jsx';

export default function FormatosPage() {
  return (
    <>
      <PageHeader titulo="Formatos" descripcion="Planillas y formatos para descargar, llenar y entregar al área correspondiente." />
      <ListaDocumentos endpoint="/documentos/formatos" vacio="Aún no hay formatos publicados" />
    </>
  );
}
