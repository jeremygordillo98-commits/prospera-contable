import React, { useState } from 'react';
import { Save, X, Phone, Mail, Building2, User, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';

interface EntidadQuickFormProps {
  ruc: string;
  razonSocial: string;
  empresaId: string;
  onSuccess: (entidadId: string) => void;
  onCancel: () => void;
}

export const EntidadQuickForm: React.FC<EntidadQuickFormProps> = ({ ruc, razonSocial, empresaId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ruc_cedula: ruc,
    razon_social: razonSocial,
    nombre: razonSocial, // Inicializamos nombre con la razón social
    email: '',
    telefono: '',
    direccion: '',
    tipo_entidad: 'Proveedor',
    persona_tipo: 'Natural'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('entidades')
        .insert({
          ...formData,
          id_empresa: empresaId
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        alert(`Error al guardar: ${error.message}`);
        return;
      }
      
      if (data) onSuccess(data.id);
      
    } catch (err: any) {
      console.error("Error creating entity:", err);
      alert("Ocurrió un error inesperado al crear la entidad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border bg-white/[0.02]"
      style={{ borderColor: 'var(--border-color)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-bold flex items-center gap-2 text-white">
          <User className="text-primary" size={20} /> Registrar Nuevo Proveedor
        </h4>
        <button 
          onClick={onCancel} 
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-sec"
          type="button"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] text-sec uppercase font-bold tracking-wider px-1">RUC / Cédula (Lectura)</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-sec opacity-40" size={16} />
              <input 
                type="text" 
                value={formData.ruc_cedula}
                readOnly
                className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none opacity-60 cursor-not-allowed" 
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-sec uppercase font-bold tracking-wider px-1">Tipo de Persona</label>
            <select
              value={formData.persona_tipo}
              onChange={(e) => setFormData({...formData, persona_tipo: e.target.value})}
              className="w-full rounded-xl py-3 px-4 text-sm outline-none appearance-none cursor-pointer"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="Natural">Natural</option>
              <option value="Jurídica">Jurídica</option>
              <option value="Extranjera">Extranjera</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-sec uppercase font-bold tracking-wider px-1">Razón Social SRI (Editable)</label>
          <input 
            type="text" 
            value={formData.razon_social}
            onChange={(e) => setFormData({...formData, razon_social: e.target.value})}
            placeholder="Nombre legal de la empresa"
            className="w-full rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 transition-all font-medium" 
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] text-sec uppercase font-bold tracking-wider px-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-sec" size={16} />
              <input 
                type="email" 
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-primary/50 transition-all" 
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-sec uppercase font-bold tracking-wider px-1">Teléfono Móvil</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-sec" size={16} />
              <input 
                type="text" 
                placeholder="09XXXXXXXX"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-primary/50 transition-all" 
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] text-sec uppercase font-bold tracking-wider px-1">Dirección (Opcional)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-sec" size={16} />
              <input 
                type="text" 
                placeholder="Calle y Número..."
                value={formData.direccion}
                onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-primary/50 transition-all" 
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary w-full justify-center h-14 text-base font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {loading ? 'Procesando registro...' : <><Save size={20} /> Guardar Proveedor</>}
        </button>
      </form>
    </motion.div>
  );
};
