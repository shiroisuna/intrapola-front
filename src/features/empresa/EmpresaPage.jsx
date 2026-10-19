import { MapPin, Phone, Mail, Printer } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Cargando, ErrorCarga } from '../../components/ui/Feedback.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function EmpresaPage() {
  const { data, loading, error, recargar } = useApi('/contenido/inicio');
  const e = data?.empresa;

  return (
    <>
      <PageHeader titulo={e?.nombre || 'La empresa'} descripcion="Quiénes somos, hacia dónde vamos y dónde encontrarnos." />
      {loading && <Cargando />}
      {error && <ErrorCarga error={error} onReintentar={recargar} />}
      {e && (
        <div className="grid gap-12">
          <section className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl bg-sage p-8">
              <h2 className="text-2xl font-bold text-pine-800">Misión</h2>
              <p className="mt-3 text-[17px] leading-relaxed text-pine-800">{e.mision}</p>
            </div>
            <div className="rounded-3xl bg-white p-8 ring-1 ring-line">
              <h2 className="text-2xl font-bold text-pine-800">Visión</h2>
              <p className="mt-3 text-[17px] leading-relaxed">{e.vision}</p>
            </div>
          </section>

          <section aria-labelledby="t-valores">
            <h2 id="t-valores" className="text-2xl font-bold">Nuestros valores</h2>
            <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              {e.valores.map((v) => (
                <li key={v} className="font-display text-2xl font-semibold text-pine sm:text-3xl">{v}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="t-ubicacion" className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <h2 id="t-ubicacion" className="text-2xl font-bold">Ubicación y contacto</h2>
              <ul className="mt-4 space-y-4">
                <li className="flex gap-3"><MapPin className="mt-1 size-5 shrink-0 text-pine-600" aria-hidden /><span>{e.direccion}</span></li>
                {e.telefono && <li className="flex gap-3"><Phone className="mt-1 size-5 shrink-0 text-pine-600" aria-hidden /><a href={`tel:${e.telefono.replace(/\D/g, '')}`} className="hover:underline">{e.telefono}</a></li>}
                {e.fax && <li className="flex gap-3"><Printer className="mt-1 size-5 shrink-0 text-pine-600" aria-hidden /><span>Fax {e.fax}</span></li>}
                {e.correo && <li className="flex gap-3"><Mail className="mt-1 size-5 shrink-0 text-pine-600" aria-hidden /><a href={`mailto:${e.correo}`} className="text-pine-600 hover:underline">{e.correo}</a></li>}
              </ul>
              {e.rif && <p className="mt-6 text-muted">RIF {e.rif}</p>}
            </div>
            {e.mapaUrl && (
              <iframe title="Mapa de la planta" src={e.mapaUrl} loading="lazy" className="aspect-[4/3] w-full rounded-3xl bg-sage-50 ring-1 ring-line" referrerPolicy="no-referrer-when-downgrade" />
            )}
          </section>
        </div>
      )}
    </>
  );
}
