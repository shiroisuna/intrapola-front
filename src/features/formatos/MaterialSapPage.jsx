import { useState } from 'react';
import { Field, Input, Select, Textarea } from '../../components/ui/Field.jsx';
import { Alert } from '../../components/ui/Feedback.jsx';
import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import { hoyISO } from '../../utils/fechas.js';
import { FormularioSolicitud } from '../solicitudes/componentes/FormularioSolicitud.jsx';

const INICIAL = () => ({
  solicitud: '', fecha: hoyISO(), motivo: '', autoriza: '', existe: '', codigo: '', observaciones: '',
  material: '', codigoAnterior: '', almacen: '', um: '', grCompras: '',
  grArt: '', ptoPedido: '', max: '', stockSeg: '', obsPlanificacion: '',
});

function Bloque({ titulo, children }) {
  return (
    <section className="grid gap-5">
      <h3 className="border-b border-line pb-2 font-bold text-pine">{titulo}</h3>
      {children}
    </section>
  );
}

export default function MaterialSapPage() {
  const { data: op } = useApi('/formatos/materiales-sap/opciones');
  const [f, setF] = useState(INICIAL);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const verif = op?.verificacion.find((v) => v.valor === f.existe);
  const sinCodigo = verif && !verif.conCodigo;

  const validar = () => {
    const e = {};
    const req = { solicitud: 'Seleccione el tipo de solicitud', fecha: 'Indique la fecha', motivo: 'Indique el motivo', autoriza: 'Indique quién autoriza',
      existe: 'Indique si existe en SAP', observaciones: 'Escriba las observaciones', material: 'Escriba el texto descriptivo', almacen: 'Indique el almacén', um: 'Indique la unidad' };
    for (const [k, msg] of Object.entries(req)) if (!String(f[k]).trim()) e[k] = msg;
    if (verif?.conCodigo && !f.codigo.trim()) e.codigo = 'Indique el código SAP';
    return e;
  };

  return (
    <FormularioSolicitud
      titulo="Material SAP"
      descripcion="Solicita la creación, modificación o desincorporación de un material en SAP. Repuestos recibe la solicitud por correo para aprobarla."
      volver={{ to: '/formatos', texto: 'Formatos' }}
      validar={validar}
      onReiniciar={() => setF(INICIAL())}
      onEnviar={({ cedula }) => api.post('/formatos/materiales-sap', { ...f, cedula, codigo: sinCodigo ? '' : f.codigo })}
      accionesExito={(r) => r?.correoEnviado === false && (
        <Alert tipo="aviso" className="text-left">La solicitud quedó registrada, pero no se pudo enviar el correo de aprobación a Repuestos.</Alert>
      )}
    >
      {({ errores }) => (
        <>
          <Bloque titulo="Solicitud">
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Tipo de solicitud" error={errores.solicitud}>
                <Select value={f.solicitud} onChange={set('solicitud')}>
                  <option value="">Seleccione</option>
                  {op?.tipos.map((t) => <option key={t.valor} value={t.valor}>{t.texto}</option>)}
                </Select>
              </Field>
              <Field label="Fecha de solicitud" error={errores.fecha}>
                <Input type="date" value={f.fecha} onChange={set('fecha')} />
              </Field>
              <Field label="Autorizado por" error={errores.autoriza}>
                <Input value={f.autoriza} onChange={set('autoriza')} maxLength={150} />
              </Field>
            </div>
            <Field label="Motivo de la solicitud" error={errores.motivo}>
              <Input value={f.motivo} onChange={set('motivo')} maxLength={500} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-[1fr_1fr_2fr]">
              <Field label="¿Existe en SAP?" error={errores.existe}>
                <Select value={f.existe} onChange={set('existe')}>
                  <option value="">Seleccione</option>
                  {op?.verificacion.map((v) => <option key={v.valor} value={v.valor}>{v.texto}</option>)}
                </Select>
              </Field>
              <Field label="Código SAP" error={errores.codigo} hint={sinCodigo ? 'Sin código (S/C)' : undefined}>
                <Input value={sinCodigo ? 'S/C' : f.codigo} disabled={sinCodigo} onChange={set('codigo')} maxLength={50} />
              </Field>
              <Field label="Observaciones C-M-D" error={errores.observaciones} hint="Qué crear, qué cambiar o por qué desincorporar">
                <Input value={f.observaciones} onChange={set('observaciones')} maxLength={1000} />
              </Field>
            </div>
          </Bloque>

          <Bloque titulo="Información del producto">
            <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
              <Field label="Texto descriptivo del material" error={errores.material}>
                <Input value={f.material} onChange={set('material')} maxLength={300} />
              </Field>
              <Field label="Código anterior" opcional>
                <Input value={sinCodigo ? 'S/C' : f.codigoAnterior} disabled={sinCodigo} onChange={set('codigoAnterior')} maxLength={50} />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-[2fr_1fr_1fr]">
              <Field label="Almacén" error={errores.almacen}>
                <Input value={f.almacen} onChange={set('almacen')} maxLength={100} />
              </Field>
              <Field label="Unidad de medida" error={errores.um}>
                <Input value={f.um} onChange={set('um')} maxLength={20} placeholder="Ej. UN, KG" />
              </Field>
              <Field label="Grupo de compras" opcional>
                <Input value={f.grCompras} onChange={set('grCompras')} maxLength={50} />
              </Field>
            </div>
          </Bloque>

          <Bloque titulo="Información de planificación">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Grupo de artículos" opcional><Input value={f.grArt} onChange={set('grArt')} maxLength={50} /></Field>
              <Field label="Punto de pedido" opcional><Input inputMode="decimal" value={f.ptoPedido} onChange={set('ptoPedido')} maxLength={30} /></Field>
              <Field label="Máximo" opcional><Input inputMode="decimal" value={f.max} onChange={set('max')} maxLength={30} /></Field>
              <Field label="Stock de seguridad" opcional><Input inputMode="decimal" value={f.stockSeg} onChange={set('stockSeg')} maxLength={30} /></Field>
            </div>
            <Field label="Observaciones de planificación" opcional hint="Se envían en el correo a Repuestos">
              <Textarea value={f.obsPlanificacion} onChange={set('obsPlanificacion')} maxLength={500} />
            </Field>
          </Bloque>
        </>
      )}
    </FormularioSolicitud>
  );
}
