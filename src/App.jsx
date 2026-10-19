import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { Cargando } from './components/ui/Feedback.jsx';
import InicioPage from './features/inicio/InicioPage.jsx';

// Cada módulo se carga solo cuando se visita (archivos más livianos)
const ComunicadosPage = lazy(() => import('./features/comunicados/ComunicadosPage.jsx'));
const SolicitudesPage = lazy(() => import('./features/solicitudes/SolicitudesPage.jsx'));
const MisSolicitudesPage = lazy(() => import('./features/solicitudes/MisSolicitudesPage.jsx'));
const PermisoForm = lazy(() => import('./features/solicitudes/formularios/PermisoForm.jsx'));
const RrhhForm = lazy(() => import('./features/solicitudes/formularios/RrhhForm.jsx'));
const ArticulosForm = lazy(() => import('./features/solicitudes/formularios/ArticulosForm.jsx'));
const DesarrolloForm = lazy(() => import('./features/solicitudes/formularios/DesarrolloForm.jsx'));
const SoporteForm = lazy(() => import('./features/solicitudes/formularios/SoporteForm.jsx'));
const VacacionesForm = lazy(() => import('./features/solicitudes/formularios/VacacionesForm.jsx'));
const AnticipoPage = lazy(() => import('./features/solicitudes/anticipo/AnticipoPage.jsx'));
const ReembolsoSeguroPage = lazy(() => import('./features/formatos/ReembolsoSeguroPage.jsx'));
const RelacionGastosPage = lazy(() => import('./features/formatos/RelacionGastosPage.jsx'));
const SalidaMaterialesPage = lazy(() => import('./features/formatos/SalidaMaterialesPage.jsx'));
const MaterialSapPage = lazy(() => import('./features/formatos/MaterialSapPage.jsx'));
const EvaluacionPage = lazy(() => import('./features/evaluaciones/EvaluacionPage.jsx'));
const UsuariosForm = lazy(() => import('./features/solicitudes/formularios/UsuariosForm.jsx'));
const NormasPage = lazy(() => import('./features/normas/NormasPage.jsx'));
const FormatosPage = lazy(() => import('./features/formatos/FormatosPage.jsx'));
const EventosPage = lazy(() => import('./features/eventos/EventosPage.jsx'));
const PreciosPage = lazy(() => import('./features/precios/PreciosPage.jsx'));
const DirectorioPage = lazy(() => import('./features/directorio/DirectorioPage.jsx'));
const CumpleanosPage = lazy(() => import('./features/cumpleanos/CumpleanosPage.jsx'));
const EmpresaPage = lazy(() => import('./features/empresa/EmpresaPage.jsx'));

function NoEncontrada() {
  return (
    <div className="py-16">
      <h1 className="text-4xl font-bold">Esta página no existe</h1>
      <p className="mt-3 text-[17px] text-muted">Puede que el enlace esté viejo. Vuelve al inicio para encontrar lo que buscas.</p>
      <Link to="/" className="mt-6 inline-flex h-11 items-center rounded-xl bg-pine px-5 font-bold text-white hover:bg-pine-800">Ir al inicio</Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Suspense fallback={<Cargando />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<InicioPage />} />
            <Route path="solicitudes">
              <Route index element={<SolicitudesPage />} />
              <Route path="mis-solicitudes" element={<MisSolicitudesPage />} />
              <Route path="permiso" element={<PermisoForm />} />
              <Route path="rrhh" element={<RrhhForm />} />
              <Route path="vacaciones" element={<VacacionesForm />} />
              <Route path="anticipo" element={<AnticipoPage />} />
              <Route path="papeleria" element={<ArticulosForm key="papeleria" tipo="papeleria" />} />
              <Route path="insumos" element={<ArticulosForm key="insumos" tipo="insumos" />} />
              <Route path="desarrollo" element={<DesarrolloForm />} />
              <Route path="soporte" element={<SoporteForm />} />
              <Route path="usuarios" element={<UsuariosForm />} />
            </Route>
            <Route path="comunicados" element={<ComunicadosPage />} />
            <Route path="normas" element={<NormasPage />} />
            <Route path="formatos">
              <Route index element={<FormatosPage />} />
              <Route path="reembolso-seguro" element={<ReembolsoSeguroPage />} />
              <Route path="relacion-gastos" element={<RelacionGastosPage />} />
              <Route path="salida-materiales" element={<SalidaMaterialesPage />} />
              <Route path="materiales-sap" element={<MaterialSapPage />} />
              <Route path="evaluacion-servicios" element={<EvaluacionPage key="servicios" clave="servicios" />} />
              <Route path="evaluacion-mpme" element={<EvaluacionPage key="mpme" clave="mpme" />} />
              <Route path="evaluacion-transporte" element={<EvaluacionPage key="transporte" clave="transporte" />} />
            </Route>
            <Route path="eventos" element={<EventosPage />} />
            <Route path="precios" element={<PreciosPage />} />
            <Route path="directorio" element={<DirectorioPage />} />
            <Route path="cumpleanos" element={<CumpleanosPage />} />
            <Route path="empresa" element={<EmpresaPage />} />
            <Route path="*" element={<NoEncontrada />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
