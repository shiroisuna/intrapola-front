import { useState } from 'react';
import { Printer } from 'lucide-react';
import { apiUrl } from '../../../api/client.js';
import { Field, Input } from '../../../components/ui/Field.jsx';
import { FormularioSolicitud } from '../componentes/FormularioSolicitud.jsx';
import { SelectorArticulos } from '../componentes/SelectorArticulos.jsx';
import { solicitudesApi } from '../solicitudes.api.js';

const CONFIG = {
  papeleria: {
    titulo: 'Papelería',
    descripcion: 'Pide el material de oficina que necesitas. Puedes agregar varios artículos en una sola solicitud.',
    categoria: 'PAPELERIA',
    enviar: solicitudesApi.papeleria,
    textoBoton: 'Guardar y emitir',
    textoImprimir: 'Imprimir solicitud de papelería',
  },
  insumos: {
    titulo: 'Insumos de sistemas',
    descripcion: 'Tóner, mouse, teclados, cables y otros consumibles que entrega el departamento de Sistemas.',
    categoria: 'INSUMO_SIST',
    enviar: solicitudesApi.insumos,
  },
};

/** Un solo componente para papelería e insumos: cambia solo el catálogo y el endpoint. */
export default function ArticulosForm({ tipo }) {
  const c = CONFIG[tipo];
  const [items, setItems] = useState([]);
  const [observaciones, setObs] = useState('');

  return (
    <FormularioSolicitud
      key={tipo}
      titulo={c.titulo}
      descripcion={c.descripcion}
      validar={() => (items.length ? {} : { items: 'Agregue al menos un artículo' })}
      onReiniciar={() => { setItems([]); setObs(''); }}
      textoBoton={c.textoBoton}
      onEnviar={async ({ cedula }) => {
        const r = await c.enviar({ cedula, items, observaciones });
        // Igual que la Intrapola actual: al guardar se abre la hoja para imprimir
        if (r?.pdfUrl) window.open(apiUrl(r.pdfUrl), '_blank', 'noopener');
        return r;
      }}
      accionesExito={(r) => r?.pdfUrl && (
        <a href={apiUrl(r.pdfUrl)} target="_blank" rel="noreferrer"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-pine px-6 text-[17px] font-bold text-white hover:bg-pine-800">
          <Printer className="size-5" aria-hidden /> {c.textoImprimir ?? 'Imprimir solicitud'}
        </a>
      )}
    >
      {({ errores }) => (
        <>
          <SelectorArticulos categoria={c.categoria} value={items} onChange={setItems} error={errores.items} />
          <Field label="Observaciones" opcional error={errores.observaciones}>
            <Input value={observaciones} onChange={(e) => setObs(e.target.value)} maxLength={300} placeholder="Ej. Para el área de despacho" />
          </Field>
        </>
      )}
    </FormularioSolicitud>
  );
}
