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
    nombre: '',
    tipo_entidad: 'Proveedor',
    persona_tipo: 'Natural',
    email: '',
    telefono: '',
    direccion: ''
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
        nombre: entidad.nombre || '',
        tipo_entidad: entidad.tipo_entidad,
        persona_tipo: entidad.persona_tipo || 'Natural',
        email: entidad.email || '',
        telefono: entidad.telefono || '',
        direccion: entidad.direccion || ''
      });
      setEditingId(entidad.id);
    } else {
      setFormData({ ruc_cedula: '', razon_social: '', nombre: '', tipo_entidad: 'Proveedor', persona_tipo: 'Natural', email: '', telefono: '', direccion: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ ruc_cedula: '', razon_social: '', nombre: '', tipo_entidad: 'Proveedor', persona_tipo: 'Natural', email: '', telefono: '', direccion: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        id_empresa: empresaId
      };
      
      if (editingId) {
        const { error } = await supabase.from('entidades').update(dataToSave).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('entidades').insert([dataToSave]);
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
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sec)', opacity: 0.6 }} />
            <input 
              type="text" 
              placeholder="Buscar por RUC o Razón Social..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: 'var(--primary)', opacity: 0.5 }} />
          <p className="text-sec" style={{ marginTop: '16px' }}>Cargando directorio...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {['Cliente', 'Proveedor', 'Empleado', 'Accionista'].map(tipo => {
          const entidadesGrupo = filtered.filter(e => e.tipo_entidad === tipo);
          if (entidadesGrupo.length === 0 && search === "") return null;

          return (
            <div key={tipo} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{tipo}s</h3>
                <span className="text-sec" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{entidadesGrupo.length} registros</span>
              </div>
              
              <div className="table-container">
                {entidadesGrupo.length > 0 ? (
                  <>
                    <table className="data-table desktop-table">
                      <thead>
                        <tr>
                          <th>Razón Social / Nombre</th>
                          <th>Identificación</th>
                          <th>Tipo Persona</th>
                          <th>Contacto</th>
                          <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entidadesGrupo.map(e => (
                          <tr key={e.id}>
                            <td style={tdStyle}>
                              <div style={{ fontWeight: 700 }}>{e.razon_social}</div>
                              {e.nombre && <div className="text-sec" style={{ fontSize: '0.75rem' }}>{e.nombre}</div>}
                            </td>
                            <td style={tdStyle}>{e.ruc_cedula}</td>
                            <td style={tdStyle}>
                               <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{e.persona_tipo || 'Natural'}</span>
                            </td>
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {e.email && <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {e.email}</div>}
                                {e.telefono && <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {e.telefono}</div>}
                              </div>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button style={btnActionStyle} onClick={() => handleOpenModal(e)}><Edit2 size={16} /></button>
                                <button style={{ ...btnActionStyle, color: 'var(--error)' }} onClick={() => handleDelete(e.id, e.razon_social)}><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mobile-card-list">
                      {entidadesGrupo.map(e => (
                        <div key={e.id} className="entity-card" style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                          <div className="flex-between" style={{ marginBottom: '8px' }}>
                            <div style={{ fontWeight: 700 }}>{e.razon_social}</div>
                            <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{e.persona_tipo}</span>
                          </div>
                          <div className="text-sec" style={{ fontSize: '0.8rem', marginBottom: '8px' }}>{e.ruc_cedula}</div>
                          <div className="flex-between">
                            <div className="flex gap-8">
                               {e.email && <Mail size={14} className="text-sec" />}
                               {e.telefono && <Phone size={14} className="text-sec" />}
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                               <button style={btnActionStyle} onClick={() => handleOpenModal(e)}><Edit2 size={16} /></button>
                               <button style={{ ...btnActionStyle, color: 'var(--error)' }} onClick={() => handleDelete(e.id, e.razon_social)}><Trash2 size={16} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-sec)', fontSize: '0.9rem' }}>
                    No se encontraron {tipo.toLowerCase()}s
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
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
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-sec)' }}>RUC o Cédula*</label>
                    <input required placeholder="Ej. 1790000000001" value={formData.ruc_cedula} onChange={e => setFormData({...formData, ruc_cedula: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-sec)' }}>Tipo de Entidad*</label>
                    <select required value={formData.tipo_entidad} onChange={e => setFormData({...formData, tipo_entidad: e.target.value})} style={inputStyle}>
                        <option value="Cliente">Cliente</option>
                        <option value="Proveedor">Proveedor</option>
                        <option value="Empleado">Empleado</option>
                        <option value="Accionista">Accionista</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-sec)' }}>Tipo de Persona*</label>
                    <select required value={formData.persona_tipo} onChange={e => setFormData({...formData, persona_tipo: e.target.value})} style={inputStyle}>
                        <option value="Natural">Natural</option>
                        <option value="Jurídica">Jurídica</option>
                        <option value="Extranjera">Extranjera</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-sec)' }}>Razón Social*</label>
                    <input required placeholder="Ej. Empresa S.A." value={formData.razon_social} onChange={e => setFormData({...formData, razon_social: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-sec)' }}>Nombre / Alias</label>
                    <input placeholder="Ej. Juan Pérez" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-sec)' }}>Email</label>
                    <input type="email" placeholder="correo@ejemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-sec)' }}>Teléfono</label>
                    <input type="tel" placeholder="099..." value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-sec)' }}>Dirección</label>
                  <input placeholder="Ej. Av. Amazonas N32 y Coreya" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} style={inputStyle} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                  <button type="button" onClick={handleCloseModal} className="btn glass-card" style={{ padding: '10px 20px', border: '1px solid var(--border-color)' }}>Cancelar</button>
                  <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                    {saving ? <Loader2 className="animate-spin" size={18} /> : (editingId ? 'Actualizar Entidad' : 'Guardar Entidad')}
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
  background: 'var(--input-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  color: 'var(--text-main)',
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
