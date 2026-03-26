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
  Edit2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Entidades = ({ empresaId }: { empresaId: string }) => {
  const [entidades, setEntidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ruc_cedula: '',
    razon_social: '',
    tipo_entidad: 'Proveedor',
    email: '',
    telefono: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchEntidades = async () => {
    if (!empresaId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('entidades')
      .select('*')
      .eq('id_empresa', empresaId)
      .order('razon_social', { ascending: true });
    
    if (!error && data) setEntidades(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntidades();
  }, [empresaId]);

  const filtered = entidades.filter(e => 
    e.razon_social.toLowerCase().includes(search.toLowerCase()) || 
    (e.ruc_cedula && e.ruc_cedula.includes(search))
  );

  const handleOpenModal = (entidad?: any) => {
    if (entidad) {
      setFormData({
        ruc_cedula: entidad.ruc_cedula,
        razon_social: entidad.razon_social,
        tipo_entidad: entidad.tipo_entidad,
        email: entidad.email || '',
        telefono: entidad.telefono || ''
      });
      setEditingId(entidad.id);
    } else {
      setFormData({ ruc_cedula: '', razon_social: '', tipo_entidad: 'Proveedor', email: '', telefono: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ ruc_cedula: '', razon_social: '', tipo_entidad: 'Proveedor', email: '', telefono: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('entidades').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('entidades').insert([{ ...formData, id_empresa: empresaId }]);
        if (error) throw error;
      }
      await fetchEntidades();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving entity:", error);
      alert("Error al guardar la entidad. Verifica que el RUC no exista ya.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, razon_social: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${razon_social}?`)) {
      const { error } = await supabase.from('entidades').delete().eq('id', id);
      if (error) {
        console.error("Error deleting:", error);
        alert("Error al eliminar. Podría estar en uso.");
      } else {
        fetchEntidades();
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header className="flex-between">
        <div>
          <h2 className="h1">Directorio de Terceros</h2>
          <p className="text-sec">Clientes, Proveedores y Empleados registrados.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
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
                          {e.email ? <Mail size={14} className="text-sec" /> : null}
                          {e.telefono ? <Phone size={14} className="text-sec" /> : null}
                          {(!e.email && !e.telefono) ? <span className="text-sec">-</span> : null}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button style={btnActionStyle} onClick={() => handleOpenModal(e)}><Edit2 size={16} /></button>
                          <button style={{ ...btnActionStyle, color: 'var(--error)' }} onClick={() => handleDelete(e.id, e.razon_social)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-sec)' }}>
                        No se encontraron entidades registradas.
                      </td>
                    </tr>
                  )}
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
                        {e.email ? <Mail size={14} className="text-sec" /> : null}
                        {e.telefono ? <Phone size={14} className="text-sec" /> : null}
                      </div>
                      <div className="flex gap-8">
                        <button style={btnActionStyle} onClick={() => handleOpenModal(e)}><Edit2 size={16} /></button>
                        <button style={{ ...btnActionStyle, color: 'var(--error)' }} onClick={() => handleDelete(e.id, e.razon_social)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
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
                  {editingId ? 'Editar Entidad' : 'Nueva Entidad'}
                </h3>
                <button onClick={handleCloseModal} style={btnActionStyle}><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-sec)' }}>RUC o Cédula*</label>
                  <input required placeholder="Ej. 1790000000001" value={formData.ruc_cedula} onChange={e => setFormData({...formData, ruc_cedula: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-sec)' }}>Razón Social*</label>
                  <input required placeholder="Ej. Empresa S.A." value={formData.razon_social} onChange={e => setFormData({...formData, razon_social: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-sec)' }}>Tipo de Entidad*</label>
                  <select required value={formData.tipo_entidad} onChange={e => setFormData({...formData, tipo_entidad: e.target.value})} style={inputStyle}>
                    <option value="Cliente">Cliente</option>
                    <option value="Proveedor">Proveedor</option>
                    <option value="Empleado">Empleado</option>
                    <option value="Accionista">Accionista</option>
                    <option value="SRI">SRI</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-sec)' }}>Email</label>
                    <input type="email" placeholder="correo@ejemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-sec)' }}>Teléfono</label>
                    <input type="tel" placeholder="099..." value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} style={inputStyle} />
                  </div>
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
  fontSize: '0.9rem'
};

const getTagColor = (tipo: string) => {
  switch (tipo) {
    case 'Cliente': return 'rgba(16, 185, 129, 0.4)';
    case 'Proveedor': return 'rgba(79, 70, 229, 0.4)';
    case 'Empleado': return 'rgba(245, 158, 11, 0.4)';
    default: return 'rgba(148, 163, 184, 0.4)';
  }
};
