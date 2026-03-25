import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { supabase } from '../services/supabase';
import { 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Loader2,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Entidades = () => {
  const [entidades, setEntidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchEntidades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('entidades')
      .select('*')
      .order('razon_social', { ascending: true });
    
    if (!error && data) setEntidades(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntidades();
  }, []);

  const filtered = entidades.filter(e => 
    e.razon_social.toLowerCase().includes(search.toLowerCase()) || 
    e.ruc_cedula.includes(search)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header className="flex-between">
        <div>
          <h2 className="h1">Directorio de Terceros</h2>
          <p className="text-sec">Clientes, Proveedores y Empleados registrados.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> Nueva Entidad
        </button>
      </header>

      <div className="glass-card" style={{ padding: '0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-dark)', display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sec)' }} />
            <input 
              type="text" 
              placeholder="Buscar por RUC o Razón Social..." 
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

        <div className="table-container">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto', color: 'var(--primary)' }} />
            </div>
          ) : (
            <>
              {/* Tabla para Desktop */}
              <table className="data-table desktop-table">
                <thead>
                  <tr>
                    <th>Razón Social</th>
                    <th>RUC / Cédula</th>
                    <th>Tipo</th>
                    <th>Contacto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e.id} className="hover:bg-white/5 transition-colors">
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600 }}>{e.razon_social}</div>
                      </td>
                      <td style={tdStyle}>{e.ruc_cedula}</td>
                      <td style={tdStyle}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '0.74rem', 
                          background: getTagColor(e.tipo_entidad),
                          color: 'white',
                          fontWeight: 600
                        }}>
                          {e.tipo_entidad}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {e.email && <Mail size={14} className="text-sec" />}
                          {e.telefono && <Phone size={14} className="text-sec" />}
                          {!e.email && !e.telefono && <span className="text-sec">-</span>}
                        </div>
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

              {/* Lista para Móvil */}
              <div className="mobile-card-list">
                {filtered.map(e => (
                  <div key={e.id} className="entity-card">
                    <div className="flex-between" style={{ marginBottom: '8px' }}>
                      <div style={{ fontWeight: 700 }}>{e.razon_social}</div>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '20px', 
                        fontSize: '0.65rem', 
                        background: getTagColor(e.tipo_entidad),
                        color: 'white'
                      }}>
                        {e.tipo_entidad}
                      </span>
                    </div>
                    <div className="text-sec" style={{ fontSize: '0.8rem', marginBottom: '8px' }}>{e.ruc_cedula}</div>
                    <div className="flex-between">
                      <div className="flex gap-8">
                        {e.email && <Mail size={14} className="text-sec" />}
                        {e.telefono && <Phone size={14} className="text-sec" />}
                      </div>
                      <div className="flex gap-8">
                        <button style={btnActionStyle}><Edit2 size={16} /></button>
                        <button style={{ ...btnActionStyle, color: 'var(--error)' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const tdStyle: CSSProperties = { padding: '16px' };
const btnActionStyle: CSSProperties = { background: 'none', border: 'none', color: 'var(--text-sec)', cursor: 'pointer', padding: '4px' };

const getTagColor = (tipo: string) => {
  switch (tipo) {
    case 'Cliente': return 'rgba(16, 185, 129, 0.2)';
    case 'Proveedor': return 'rgba(79, 70, 229, 0.2)';
    case 'Empleado': return 'rgba(245, 158, 11, 0.2)';
    default: return 'rgba(148, 163, 184, 0.2)';
  }
};
