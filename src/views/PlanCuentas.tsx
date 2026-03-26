import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { supabase } from '../services/supabase';
import { 
  Plus, 
  Search, 
  Loader2,
  Trash2,
  Edit2,
  Lock,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PlanCuentas = ({ empresaId }: { empresaId: string }) => {
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    codigo_cuenta: '',
    nombre: '',
    tipo: 'Activo',
    acepta_movimientos: true
  });
  const [saving, setSaving] = useState(false);

  const fetchCuentas = async () => {
    if (!empresaId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('plan_cuentas')
      .select('*')
      .eq('id_empresa', empresaId)
      .order('codigo_cuenta', { ascending: true });
    
    if (!error && data) setCuentas(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCuentas();
  }, [empresaId]);

  const filtered = cuentas.filter(c => 
    c.nombre.toLowerCase().includes(search.toLowerCase()) || 
    c.codigo_cuenta.includes(search)
  );

  const handleOpenModal = (cuenta?: any) => {
    if (cuenta) {
      setFormData({
        codigo_cuenta: cuenta.codigo_cuenta,
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        acepta_movimientos: cuenta.acepta_movimientos
      });
      setEditingId(cuenta.id);
    } else {
      setFormData({ codigo_cuenta: '', nombre: '', tipo: 'Activo', acepta_movimientos: true });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ codigo_cuenta: '', nombre: '', tipo: 'Activo', acepta_movimientos: true });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('plan_cuentas').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('plan_cuentas').insert([{ ...formData, id_empresa: empresaId }]);
        if (error) throw error;
      }
      await fetchCuentas();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving account:", error);
      alert("Error al guardar la cuenta. Verifica que el código no exista ya.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la cuenta ${nombre}?`)) {
      const { error } = await supabase.from('plan_cuentas').delete().eq('id', id);
      if (error) {
        console.error("Error deleting:", error);
        alert("Error al eliminar. Podría tener movimientos asociados.");
      } else {
        fetchCuentas();
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header className="flex-between">
        <div>
          <h2 className="h1">Plan de Cuentas</h2>
          <p className="text-sec">Estructura contable organizada.</p>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Nueva Cuenta
          </button>
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
              style={inputStyle}
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
                    <th>Código</th>
                    <th>Nombre de Cuenta</th>
                    <th>Tipo</th>
                    <th>Movimientos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
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
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button style={btnActionStyle} onClick={() => handleOpenModal(c)}><Edit2 size={16} /></button>
                          <button style={{ ...btnActionStyle, color: 'var(--error)' }} onClick={() => handleDelete(c.id, c.nombre)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-sec)' }}>
                        No se encontraron cuentas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Lista para Móvil */}
              <div className="mobile-card-list">
                {filtered.map(c => (
                  <div key={c.id} className="entity-card">
                    <div className="flex-between" style={{ marginBottom: '8px' }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{c.codigo_cuenta}</div>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        background: 'var(--primary-light)', 
                        color: 'var(--primary)', 
                        padding: '2px 6px', 
                        borderRadius: '4px' 
                      }}>
                        {c.tipo}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: '12px' }}>{c.nombre}</div>
                    <div className="flex-between">
                      <div style={{ fontSize: '0.75rem' }}>
                        {c.acepta_movimientos ? 
                          <span style={{ color: 'var(--success)' }}>Acepta Mov.</span> : 
                          <span style={{ opacity: 0.4 }}><Lock size={10} /> Solo Grupo</span>
                        }
                      </div>
                      <div className="flex gap-8">
                        <button style={btnActionStyle} onClick={() => handleOpenModal(c)}><Edit2 size={16} /></button>
                        <button style={{ ...btnActionStyle, color: 'var(--error)' }} onClick={() => handleDelete(c.id, c.nombre)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal para Crear / Editar Cuenta */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal-content glass-card"
              style={{ padding: '32px', width: '90%', maxWidth: '500px' }}
            >
              <div className="flex-between" style={{ marginBottom: '24px' }}>
                <h3 className="h1" style={{ fontSize: '1.5rem', margin: 0 }}>
                  {editingId ? 'Editar Cuenta' : 'Nueva Cuenta'}
                </h3>
                <button onClick={handleCloseModal} style={btnActionStyle}><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-sec)' }}>Código de Cuenta*</label>
                  <input required placeholder="Ej. 1.1.01" value={formData.codigo_cuenta} onChange={e => setFormData({...formData, codigo_cuenta: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-sec)' }}>Nombre de Cuenta*</label>
                  <input required placeholder="Ej. Caja General" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-sec)' }}>Tipo de Cuenta*</label>
                  <select required value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} style={inputStyle}>
                    <option value="Activo">Activo</option>
                    <option value="Pasivo">Pasivo</option>
                    <option value="Patrimonio">Patrimonio</option>
                    <option value="Ingreso">Ingreso</option>
                    <option value="Gasto">Gasto</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="acepta_movimientos"
                    checked={formData.acepta_movimientos} 
                    onChange={e => setFormData({...formData, acepta_movimientos: e.target.checked})}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <label htmlFor="acepta_movimientos" style={{ fontSize: '0.9rem' }}>Acepta Movimientos (Subcuenta)</label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                  <button type="button" onClick={handleCloseModal} className="btn glass-card" style={{ padding: '8px 16px' }}>Cancelar</button>
                  <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                    {saving ? <Loader2 className="animate-spin" size={16} /> : 'Guardar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const tdStyle: CSSProperties = { padding: '16px' };
const btnActionStyle: CSSProperties = { background: 'none', border: 'none', color: 'var(--text-sec)', cursor: 'pointer', padding: '4px' };
const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  color: 'white',
  outline: 'none',
  fontSize: '0.9rem',
  fontFamily: 'inherit'
};
