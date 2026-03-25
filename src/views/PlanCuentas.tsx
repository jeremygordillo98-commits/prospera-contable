import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { 
  Plus, 
  Search, 
  Loader2,
  Trash2,
  Edit2,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

export const PlanCuentas = () => {
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCuentas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('plan_cuentas')
      .select('*')
      .order('codigo_cuenta', { ascending: true });
    
    if (!error && data) setCuentas(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCuentas();
  }, []);

  const filtered = cuentas.filter(c => 
    c.nombre.toLowerCase().includes(search.toLowerCase()) || 
    c.codigo_cuenta.includes(search)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header className="flex-between">
        <div>
          <h2 className="h1">Plan de Cuentas</h2>
          <p className="text-sec">Estructura contable organizada para tu empresa.</p>
        </div>
        <div className="flex gap-8">
          <button className="btn glass-card"><Plus size={18} /> Importar Excel</button>
          <button className="btn btn-primary"><Plus size={18} /> Nueva Cuenta</button>
        </div>
      </header>

      <div className="glass-card" style={{ padding: '0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-dark)', display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sec)' }} />
            <input 
              type="text" 
              placeholder="Buscar por código o nombre..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-dark)',
                borderRadius: '8px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto', color: 'var(--primary)' }} />
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
                  <th style={thStyle}>Código</th>
                  <th style={thStyle}>Nombre de Cuenta</th>
                  <th style={thStyle}>Tipo</th>
                  <th style={thStyle}>Movimientos</th>
                  <th style={thStyle}>Estadísticas</th>
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-dark)', transition: 'background 0.2s' }}>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em' }}>{c.codigo_cuenta}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{c.nombre}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px' }}>
                        {c.tipo}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {c.acepta_movimientos ? 
                          <span style={{ color: 'var(--success)', fontSize: '0.75rem' }}>Si</span> : 
                          <span style={{ opacity: 0.4, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}><Lock size={12} /> No</span>
                        }
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div className="text-sec" style={{ fontSize: '0.75rem' }}>Ult. mov: Hace 2 días</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={btnActionStyle}><Edit2 size={16} /></button>
                        <button style={{ ...btnActionStyle, color: 'var(--error)' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const thStyle: React.CSSProperties = { padding: '16px', fontSize: '0.85rem', color: 'var(--text-sec)', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '16px' };
const btnActionStyle: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--text-sec)', cursor: 'pointer', padding: '4px' };
