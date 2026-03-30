import React, { useEffect, useMemo, useState } from 'react';
import { Wallet, Landmark, ArrowDownCircle, ArrowUpCircle, Repeat, BellRing, Loader2, Plus, CheckCircle2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface Props { empresaId: string; mode?: 'resumen' | 'cobros' | 'pagos' | 'conciliacion'; }
interface CuentaFinanciera { id: string; nombre: string; tipo: string; saldo_inicial: number | null; moneda: string | null; numero_referencia: string | null; }
interface DocumentoTesoreria { id: string; fecha_emision: string; fecha_vencimiento: string | null; tipo_documento: string; referencia: string | null; concepto: string; saldo_pendiente: number; total: number; estado: string; entidades?: { razon_social: string } | null; }
interface MovimientoTesoreria { id: string; fecha: string; tipo_movimiento: string; concepto: string; monto: number; estado: string; referencia: string | null; cuenta_financiera?: { nombre: string } | null; entidades?: { razon_social: string } | null; documento?: { referencia: string | null; concepto: string } | null; }
interface Entity { id: string; razon_social: string; tipo_entidad: string; }

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none'
};

const cardTitle: React.CSSProperties = { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--text-sec)', fontWeight: 800 };

export const Tesoreria: React.FC<Props> = ({ empresaId, mode = 'resumen' }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cuentas, setCuentas] = useState<CuentaFinanciera[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoTesoreria[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoTesoreria[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [message, setMessage] = useState('');
  const [showCuentaForm, setShowCuentaForm] = useState(false);

  const [cuentaForm, setCuentaForm] = useState({ nombre: '', tipo: 'Banco', saldo_inicial: '0', moneda: 'USD', numero_referencia: '' });
  const [movForm, setMovForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    tipo_movimiento: mode === 'pagos' ? 'Pago' : 'Cobro',
    concepto: '', monto: '', id_cuenta_financiera: '', id_entidad: '', id_documento: '', referencia: '', estado: 'Aplicado'
  });
  const [docForm, setDocForm] = useState({
    tipo_documento: mode === 'pagos' ? 'Cuenta por pagar' : 'Cuenta por cobrar',
    fecha_emision: new Date().toISOString().slice(0, 10), fecha_vencimiento: '', id_entidad: '', concepto: '', referencia: '', total: ''
  });

  const loadData = async () => {
    setLoading(true);
    setMessage('');
    try {
      const [cuentasRes, docsRes, movRes, entRes] = await Promise.all([
        supabase.from('cuentas_financieras').select('*').eq('id_empresa', empresaId).order('nombre'),
        supabase.from('tesoreria_documentos').select('id,fecha_emision,fecha_vencimiento,tipo_documento,referencia,concepto,saldo_pendiente,total,estado,entidades(razon_social)').eq('id_empresa', empresaId).order('fecha_emision', { ascending: false }),
        supabase.from('tesoreria_movimientos').select('id,fecha,tipo_movimiento,concepto,monto,estado,referencia,cuenta_financiera:cuentas_financieras(nombre),entidades(razon_social),documento:tesoreria_documentos(referencia,concepto)').eq('id_empresa', empresaId).order('fecha', { ascending: false }).limit(30),
        supabase.from('entidades').select('id,razon_social,tipo_entidad').eq('id_empresa', empresaId).order('razon_social')
      ]);

      if (!cuentasRes.error) setCuentas(cuentasRes.data || []);
      if (!docsRes.error) {
        const normalized = (docsRes.data || []).map((item: any) => ({ ...item, entidades: Array.isArray(item.entidades) ? item.entidades[0] : item.entidades }));
        setDocumentos(normalized);
      }
      if (!movRes.error) {
        const normalized = (movRes.data || []).map((item: any) => ({
          ...item,
          cuenta_financiera: Array.isArray(item.cuenta_financiera) ? item.cuenta_financiera[0] : item.cuenta_financiera,
          entidades: Array.isArray(item.entidades) ? item.entidades[0] : item.entidades,
          documento: Array.isArray(item.documento) ? item.documento[0] : item.documento,
        }));
        setMovimientos(normalized);
      }
      if (!entRes.error) setEntities(entRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [empresaId]);

  const summary = useMemo(() => {
    const disponible = cuentas.reduce((acc, c) => acc + Number(c.saldo_inicial || 0), 0);
    const porCobrar = documentos.filter((d) => d.tipo_documento === 'Cuenta por cobrar').reduce((acc, d) => acc + Number(d.saldo_pendiente || 0), 0);
    const porPagar = documentos.filter((d) => d.tipo_documento === 'Cuenta por pagar').reduce((acc, d) => acc + Number(d.saldo_pendiente || 0), 0);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const cobradoMes = movimientos.filter((m) => m.tipo_movimiento === 'Cobro' && (m.fecha || '').startsWith(thisMonth)).reduce((acc, m) => acc + Number(m.monto || 0), 0);
    const pagadoMes = movimientos.filter((m) => m.tipo_movimiento === 'Pago' && (m.fecha || '').startsWith(thisMonth)).reduce((acc, m) => acc + Number(m.monto || 0), 0);
    return { disponible, porCobrar, porPagar, cobradoMes, pagadoMes, proyectado: disponible + porCobrar - porPagar };
  }, [cuentas, documentos, movimientos]);

  const docsFiltrados = useMemo(() => {
    if (mode === 'cobros') return documentos.filter((d) => d.tipo_documento === 'Cuenta por cobrar');
    if (mode === 'pagos') return documentos.filter((d) => d.tipo_documento === 'Cuenta por pagar');
    return documentos;
  }, [documentos, mode]);

  const handleCrearCuenta = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const { error } = await supabase.from('cuentas_financieras').insert({
        id_empresa: empresaId,
        nombre: cuentaForm.nombre,
        tipo: cuentaForm.tipo,
        saldo_inicial: parseFloat(cuentaForm.saldo_inicial) || 0,
        moneda: cuentaForm.moneda,
        numero_referencia: cuentaForm.numero_referencia || null,
      });
      if (error) throw error;
      setCuentaForm({ nombre: '', tipo: 'Banco', saldo_inicial: '0', moneda: 'USD', numero_referencia: '' });
      setShowCuentaForm(false);
      setMessage('Cuenta financiera registrada.');
      await loadData();
    } catch (error: any) {
      setMessage(error.message || 'No se pudo crear la cuenta financiera.');
    } finally { setSaving(false); }
  };

  const handleCrearDocumento = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const total = parseFloat(docForm.total) || 0;
      const { error } = await supabase.from('tesoreria_documentos').insert({
        id_empresa: empresaId,
        id_entidad: docForm.id_entidad || null,
        tipo_documento: docForm.tipo_documento,
        fecha_emision: docForm.fecha_emision,
        fecha_vencimiento: docForm.fecha_vencimiento || null,
        concepto: docForm.concepto,
        referencia: docForm.referencia || null,
        total,
        saldo_pendiente: total,
        estado: 'Pendiente',
        origen: 'Manual'
      });
      if (error) throw error;
      setDocForm({ tipo_documento: mode === 'pagos' ? 'Cuenta por pagar' : 'Cuenta por cobrar', fecha_emision: new Date().toISOString().slice(0, 10), fecha_vencimiento: '', id_entidad: '', concepto: '', referencia: '', total: '' });
      setMessage('Documento de tesorería registrado.');
      await loadData();
    } catch (error: any) {
      setMessage(error.message || 'No se pudo crear el documento.');
    } finally { setSaving(false); }
  };

  const handleRegistrarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const monto = parseFloat(movForm.monto) || 0;
      const { data: mov, error } = await supabase.from('tesoreria_movimientos').insert({
        id_empresa: empresaId,
        fecha: movForm.fecha,
        tipo_movimiento: movForm.tipo_movimiento,
        concepto: movForm.concepto,
        monto,
        id_cuenta_financiera: movForm.id_cuenta_financiera || null,
        id_entidad: movForm.id_entidad || null,
        id_documento: movForm.id_documento || null,
        referencia: movForm.referencia || null,
        estado: movForm.estado,
        origen: 'Manual'
      }).select('id_documento').single();
      if (error) throw error;

      if (mov?.id_documento) {
        const target = documentos.find((d) => d.id === mov.id_documento);
        if (target) {
          const nuevoSaldo = Math.max(0, Number(target.saldo_pendiente || 0) - monto);
          const estado = nuevoSaldo === 0 ? 'Liquidado' : 'Parcial';
          await supabase.from('tesoreria_documentos').update({ saldo_pendiente: nuevoSaldo, estado }).eq('id', target.id);
        }
      }

      setMovForm({ fecha: new Date().toISOString().slice(0, 10), tipo_movimiento: mode === 'pagos' ? 'Pago' : 'Cobro', concepto: '', monto: '', id_cuenta_financiera: '', id_entidad: '', id_documento: '', referencia: '', estado: 'Aplicado' });
      setMessage('Movimiento de tesorería registrado.');
      await loadData();
    } catch (error: any) {
      setMessage(error.message || 'No se pudo registrar el movimiento.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex-center" style={{ padding: '120px 0' }}><Loader2 className="animate-spin" size={36} style={{ color: 'var(--primary)' }} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header className="flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: '0.8rem', marginBottom: 8 }}>
            <Wallet size={14} /> Tesorería Inteligente
          </div>
          <h1 className="h1" style={{ fontSize: '2.2rem' }}>
            {mode === 'cobros' ? 'Cobros a Clientes' : mode === 'pagos' ? 'Pagos a Proveedores' : mode === 'conciliacion' ? 'Conciliación y Flujo' : 'Resumen de Tesorería'}
          </h1>
          <p className="text-sec">Controla saldos, obligaciones, cobros y pagos desde una sola vista.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCuentaForm((v) => !v)}><Plus size={18} /> Nueva cuenta financiera</button>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        {[
          { label: 'Disponible', value: summary.disponible, icon: Landmark },
          { label: 'Por cobrar', value: summary.porCobrar, icon: ArrowDownCircle },
          { label: 'Por pagar', value: summary.porPagar, icon: ArrowUpCircle },
          { label: 'Saldo proyectado', value: summary.proyectado, icon: Repeat },
        ].map((item) => (
          <div key={item.label} className="glass-card" style={{ padding: 20 }}>
            <div className="flex-between">
              <div>
                <div style={cardTitle}>{item.label}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: 8 }}>${item.value.toFixed(2)}</div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <item.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {showCuentaForm && (
        <form className="glass-card" onSubmit={handleCrearCuenta} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          <div><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Nombre</label><input value={cuentaForm.nombre} onChange={(e) => setCuentaForm({ ...cuentaForm, nombre: e.target.value })} style={inputStyle} required /></div>
          <div><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Tipo</label><select value={cuentaForm.tipo} onChange={(e) => setCuentaForm({ ...cuentaForm, tipo: e.target.value })} style={inputStyle}><option>Banco</option><option>Caja</option><option>Tarjeta</option></select></div>
          <div><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Saldo inicial</label><input value={cuentaForm.saldo_inicial} onChange={(e) => setCuentaForm({ ...cuentaForm, saldo_inicial: e.target.value })} style={inputStyle} inputMode="decimal" /></div>
          <div><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Referencia</label><input value={cuentaForm.numero_referencia} onChange={(e) => setCuentaForm({ ...cuentaForm, numero_referencia: e.target.value })} style={inputStyle} /></div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}><button className="btn btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cuenta'}</button></div>
        </form>
      )}

      {message && <div className="glass-card" style={{ padding: 16, color: message.includes('No se pudo') ? 'var(--warning)' : 'var(--success)', fontWeight: 700 }}>{message}</div>}

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: 20 }}>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 20, borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0 }}>Documentos de tesorería</h3>
            <p className="text-sec" style={{ margin: '6px 0 0' }}>Facturas, obligaciones y derechos de cobro pendientes.</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 620 }}>
              <thead><tr><th>Tipo</th><th>Tercero</th><th>Referencia</th><th>Vence</th><th>Saldo</th><th>Estado</th></tr></thead>
              <tbody>
                {docsFiltrados.slice(0, 12).map((doc) => (
                  <tr key={doc.id}>
                    <td style={{ padding: 12 }}>{doc.tipo_documento}</td>
                    <td style={{ padding: 12 }}>{doc.entidades?.razon_social || 'Sin tercero'}</td>
                    <td style={{ padding: 12 }}>{doc.referencia || doc.concepto}</td>
                    <td style={{ padding: 12 }}>{doc.fecha_vencimiento || '—'}</td>
                    <td style={{ padding: 12, fontWeight: 800 }}>${Number(doc.saldo_pendiente || 0).toFixed(2)}</td>
                    <td style={{ padding: 12 }}><span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: 999, background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>{doc.estado}</span></td>
                  </tr>
                ))}
                {docsFiltrados.length === 0 && <tr><td colSpan={6} style={{ padding: 28, textAlign: 'center', color: 'var(--text-sec)' }}>No hay documentos registrados.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <form className="glass-card" onSubmit={handleCrearDocumento}>
            <div className="flex-between" style={{ marginBottom: 16 }}><h3 style={{ margin: 0, fontSize: '1rem' }}>Nueva obligación / derecho</h3><BellRing size={18} className="text-primary" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Tipo</label><select value={docForm.tipo_documento} onChange={(e) => setDocForm({ ...docForm, tipo_documento: e.target.value })} style={inputStyle}><option>Cuenta por cobrar</option><option>Cuenta por pagar</option></select></div>
              <div><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Fecha emisión</label><input type="date" value={docForm.fecha_emision} onChange={(e) => setDocForm({ ...docForm, fecha_emision: e.target.value })} style={inputStyle} /></div>
              <div><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Fecha vencimiento</label><input type="date" value={docForm.fecha_vencimiento} onChange={(e) => setDocForm({ ...docForm, fecha_vencimiento: e.target.value })} style={inputStyle} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Tercero</label><select value={docForm.id_entidad} onChange={(e) => setDocForm({ ...docForm, id_entidad: e.target.value })} style={inputStyle}><option value="">Selecciona</option>{entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.razon_social}</option>)}</select></div>
              <div style={{ gridColumn: '1 / -1' }}><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Concepto</label><input value={docForm.concepto} onChange={(e) => setDocForm({ ...docForm, concepto: e.target.value })} style={inputStyle} required /></div>
              <div><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Referencia</label><input value={docForm.referencia} onChange={(e) => setDocForm({ ...docForm, referencia: e.target.value })} style={inputStyle} /></div>
              <div><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Valor</label><input value={docForm.total} onChange={(e) => setDocForm({ ...docForm, total: e.target.value })} style={inputStyle} inputMode="decimal" required /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}><button className="btn btn-primary" disabled={saving}>Guardar documento</button></div>
          </form>

          <form className="glass-card" onSubmit={handleRegistrarMovimiento}>
            <div className="flex-between" style={{ marginBottom: 16 }}><h3 style={{ margin: 0, fontSize: '1rem' }}>{mode === 'pagos' ? 'Registrar pago' : 'Registrar cobro'}</h3><CheckCircle2 size={18} className="text-primary" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Fecha</label><input type="date" value={movForm.fecha} onChange={(e) => setMovForm({ ...movForm, fecha: e.target.value })} style={inputStyle} /></div>
              <div><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Tipo movimiento</label><select value={movForm.tipo_movimiento} onChange={(e) => setMovForm({ ...movForm, tipo_movimiento: e.target.value })} style={inputStyle}><option>Cobro</option><option>Pago</option><option>Transferencia</option><option>Ajuste</option></select></div>
              <div style={{ gridColumn: '1 / -1' }}><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Concepto</label><input value={movForm.concepto} onChange={(e) => setMovForm({ ...movForm, concepto: e.target.value })} style={inputStyle} required /></div>
              <div><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Cuenta financiera</label><select value={movForm.id_cuenta_financiera} onChange={(e) => setMovForm({ ...movForm, id_cuenta_financiera: e.target.value })} style={inputStyle}><option value="">Selecciona</option>{cuentas.map((cuenta) => <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>)}</select></div>
              <div><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Monto</label><input value={movForm.monto} onChange={(e) => setMovForm({ ...movForm, monto: e.target.value })} style={inputStyle} inputMode="decimal" required /></div>
              <div><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Tercero</label><select value={movForm.id_entidad} onChange={(e) => setMovForm({ ...movForm, id_entidad: e.target.value })} style={inputStyle}><option value="">Selecciona</option>{entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.razon_social}</option>)}</select></div>
              <div><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Documento</label><select value={movForm.id_documento} onChange={(e) => setMovForm({ ...movForm, id_documento: e.target.value })} style={inputStyle}><option value="">Sin vincular</option>{docsFiltrados.map((doc) => <option key={doc.id} value={doc.id}>{doc.referencia || doc.concepto} · ${Number(doc.saldo_pendiente || 0).toFixed(2)}</option>)}</select></div>
              <div style={{ gridColumn: '1 / -1' }}><label className="text-sec" style={{ display: 'block', marginBottom: 8 }}>Referencia bancaria</label><input value={movForm.referencia} onChange={(e) => setMovForm({ ...movForm, referencia: e.target.value })} style={inputStyle} placeholder="Transferencia, depósito, voucher" /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}><button className="btn btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Registrar movimiento'}</button></div>
          </form>
        </div>
      </section>

      <section className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="flex-between" style={{ padding: 20, borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h3 style={{ margin: 0 }}>Últimos movimientos</h3>
            <p className="text-sec" style={{ margin: '6px 0 0' }}>Tu caja, bancos y aplicaciones recientes.</p>
          </div>
          <div style={{ fontWeight: 800, color: 'var(--primary)' }}>Cobrado mes ${summary.cobradoMes.toFixed(2)} · Pagado mes ${summary.pagadoMes.toFixed(2)}</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 760 }}>
            <thead><tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Cuenta</th><th>Tercero</th><th>Monto</th></tr></thead>
            <tbody>
              {movimientos.map((mov) => (
                <tr key={mov.id}>
                  <td style={{ padding: 12 }}>{mov.fecha}</td>
                  <td style={{ padding: 12 }}>{mov.tipo_movimiento}</td>
                  <td style={{ padding: 12 }}>{mov.concepto}</td>
                  <td style={{ padding: 12 }}>{mov.cuenta_financiera?.nombre || '—'}</td>
                  <td style={{ padding: 12 }}>{mov.entidades?.razon_social || '—'}</td>
                  <td style={{ padding: 12, fontWeight: 800, color: mov.tipo_movimiento === 'Cobro' ? 'var(--success)' : 'var(--text-main)' }}>${Number(mov.monto || 0).toFixed(2)}</td>
                </tr>
              ))}
              {movimientos.length === 0 && <tr><td colSpan={6} style={{ padding: 28, textAlign: 'center', color: 'var(--text-sec)' }}>Todavía no existen movimientos de tesorería.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
