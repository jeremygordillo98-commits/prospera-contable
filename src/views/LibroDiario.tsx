import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface Movement {
  id: string;
  id_transaccion: string;
  id_cuenta: string;
  debe: number;
  haber: number;
  plan_cuentas: {
    nombre: string;
    codigo_cuenta: string;
  };
}

interface Transaction {
  id: string;
  fecha: string;
  concepto: string;
  tipo_comprobante: string;
  numero_comprobante: string;
  id_entidad: string;
  entidades: {
    razon_social: string;
  } | null;
  movimientos: Movement[];
}

interface LibroDiarioProps {
  empresaId: string;
}

export const LibroDiario: React.FC<LibroDiarioProps> = ({ empresaId }) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedTxs, setExpandedTxs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTransactions();
  }, [empresaId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transacciones')
        .select(`
          id,
          fecha,
          concepto,
          tipo_comprobante,
          numero_comprobante,
          id_entidad,
          entidades (razon_social),
          movimientos (
            id,
            id_transaccion,
            id_cuenta,
            debe,
            haber,
            plan_cuentas (nombre, codigo_cuenta)
          )
        `)
        .eq('id_empresa', empresaId)
        .order('fecha', { ascending: false });

      if (error) throw error;
      
      // Handle potential type mismatch from Supabase many-to-one
      // We ensure it matches our Transaction interface
      const sanitizedData = (data || []).map((item: any) => ({
          ...item,
          entidades: Array.isArray(item.entidades) ? item.entidades[0] : item.entidades,
          movimientos: (item.movimientos || []).map((m: any) => ({
              ...m,
              plan_cuentas: Array.isArray(m.plan_cuentas) ? m.plan_cuentas[0] : m.plan_cuentas
          }))
      }));

      setTransactions(sanitizedData);
      
      if (sanitizedData.length > 0) {
          setExpandedTxs(new Set(sanitizedData.map((t: any) => t.id)));
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedTxs);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedTxs(next);
  };

  return (
    <div className="libro-diario-container">
      <header className="flex-between" style={{ marginBottom: '40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '8px' }}>
            <FileText size={14} /> Contabilidad Oficial
          </div>
          <h1 className="h1" style={{ fontSize: '2.5rem', fontWeight: 900 }}>Libro Diario</h1>
          <p className="text-sec" style={{ fontSize: '1.1rem' }}>Registro cronológico de todos los movimientos contables.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn glass-card" style={{ border: '1px solid var(--border-color)' }}>
                <Calendar size={18} /> <span className="hide-mobile">Filtrar Fecha</span>
            </button>
            <button className="btn btn-primary">
                <Download size={18} /> <span className="hide-mobile">Exportar Local</span>
            </button>
        </div>
      </header>

      {loading ? (
        <div className="flex-center" style={{ padding: '100px 0' }}>
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : transactions.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: '80px 20px' }}>
          <div style={{ width: 64, height: 64, background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
             <FileText size={32} />
          </div>
          <h2 className="h1">Sin Asientos Contables</h2>
          <p className="text-sec" style={{ maxWidth: '400px', margin: '16px auto' }}>
            Aún no has registrado transacciones para esta empresa. Comienza subiendo un XML o registrando un asiento manual.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {transactions.map((tx) => (
            <motion.div 
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{ padding: '0', overflow: 'hidden', borderBottom: expandedTxs.has(tx.id) ? '2px solid var(--primary)' : '1px solid var(--border-color)' }}
            >
              <div 
                className="flex-between" 
                style={{ padding: '20px 24px', cursor: 'pointer', background: expandedTxs.has(tx.id) ? 'rgba(99, 102, 241, 0.03)' : 'transparent' }}
                onClick={() => toggleExpand(tx.id)}
              >
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', minWidth: '60px' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-sec)', fontWeight: 800 }}>{new Date(tx.fecha).toLocaleString('es-EC', { month: 'short' })}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{new Date(tx.fecha).getUTCDate()}</div>
                  </div>
                  
                  <div style={{ height: '30px', width: '1px', background: 'var(--border-color)' }}></div>
                  
                  <div style={{ maxWidth: '300px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.concepto}</h4>
                    <p className="text-sec" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                      {tx.tipo_comprobante} #{tx.numero_comprobante} • <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{tx.entidades?.razon_social || 'Entidad no def.'}</span>
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-sec)', fontWeight: 800 }}>Monto Operación</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>
                      ${tx.movimientos.reduce((acc, m) => acc + m.debe, 0).toFixed(2)}
                    </div>
                  </div>
                  {expandedTxs.has(tx.id) ? <ChevronUp size={24} className="text-primary" /> : <ChevronDown size={24} className="text-sec" />}
                </div>
              </div>

              {expandedTxs.has(tx.id) && (
                <div style={{ padding: '0px 24px 24px', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px', minWidth: '400px' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '12px 0', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-sec)' }}>Código</th>
                          <th style={{ padding: '12px 0', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-sec)' }}>Cuenta Contable</th>
                          <th style={{ padding: '12px 0', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-sec)', textAlign: 'right' }}>Debe</th>
                          <th style={{ padding: '12px 0', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-sec)', textAlign: 'right' }}>Haber</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tx.movimientos.map((m) => (
                          <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '12px 0', fontSize: '0.85rem', color: 'var(--text-sec)', fontStyle: 'italic' }}>{m.plan_cuentas?.codigo_cuenta}</td>
                            <td style={{ padding: '12px 0', fontSize: '0.9rem', fontWeight: 600 }}>{m.plan_cuentas?.nombre}</td>
                            <td style={{ padding: '12px 0', fontSize: '0.9rem', textAlign: 'right', fontWeight: m.debe > 0 ? 900 : 400, color: m.debe > 0 ? 'var(--text-main)' : 'var(--text-sec)' }}>{m.debe > 0 ? `$${m.debe.toFixed(2)}` : '-'}</td>
                            <td style={{ padding: '12px 0', fontSize: '0.9rem', textAlign: 'right', fontWeight: m.haber > 0 ? 900 : 400, color: m.haber > 0 ? 'var(--text-main)' : 'var(--text-sec)' }}>{m.haber > 0 ? `$${m.haber.toFixed(2)}` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ fontWeight: 900, background: 'rgba(99, 102, 241, 0.05)' }}>
                          <td colSpan={2} style={{ padding: '16px 12px', textAlign: 'right', fontSize: '0.8rem', textTransform: 'uppercase', borderRadius: '12px 0 0 12px' }}>Cuadre de Asiento</td>
                          <td style={{ padding: '16px 12px', textAlign: 'right', borderTop: '2px solid var(--primary)', color: 'var(--primary)' }}>
                            ${tx.movimientos.reduce((acc, m) => acc + m.debe, 0).toFixed(2)}
                          </td>
                          <td style={{ padding: '16px 12px', textAlign: 'right', borderTop: '2px solid var(--primary)', color: 'var(--primary)', borderRadius: '0 12px 12px 0' }}>
                            ${tx.movimientos.reduce((acc, m) => acc + m.haber, 0).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
