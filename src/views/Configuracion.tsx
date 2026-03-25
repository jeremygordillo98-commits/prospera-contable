import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Sun, 
  Moon, 
  Settings, 
  Shield, 
  Database,
  Layout,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Configuracion = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header>
        <h2 className="h1">Configuración</h2>
        <p className="text-sec">Personaliza tu entorno de trabajo contable.</p>
      </header>

      <div className="glass-card">
        <h3 className="flex items-center gap-2 mb-6" style={{ fontSize: '1.2rem' }}>
          <Layout size={20} className="text-primary" /> Apariencia
        </h3>
        
        <div className="flex-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <div style={{ fontWeight: 600 }}>Esquema de Color</div>
            <div className="text-sec">Cambia entre modo claro y oscuro.</div>
          </div>
          
          <div className="flex bg-black/20 p-1 rounded-full border border-white/10">
            <button 
              onClick={() => !isDark || toggleTheme()}
              className={`btn ${!isDark ? 'btn-primary' : 'hover:bg-white/5'}`}
              style={{ borderRadius: '50px', padding: '8px 20px', background: !isDark ? 'var(--primary)' : 'transparent' }}
            >
              <Sun size={20} />
            </button>
            <button 
              onClick={() => isDark || toggleTheme()}
              className={`btn ${isDark ? 'btn-primary' : 'hover:bg-white/5'}`}
              style={{ borderRadius: '50px', padding: '8px 20px', background: isDark ? 'var(--primary)' : 'transparent' }}
            >
              <Moon size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="flex items-center gap-2 mb-6" style={{ fontSize: '1.2rem' }}>
          <Shield size={20} className="text-primary" /> Seguridad y Datos
        </h3>
        
        <div className="space-y-4">
          <div className="flex-between p-4 hover:bg-white/5 rounded-xl transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <Database className="text-sec" size={20} />
              <div>
                <div style={{ fontWeight: 600 }}>Conexión Supabase</div>
                <div className="text-sec">Estado: <span className="text-success">Conectado (Mock)</span></div>
              </div>
            </div>
            <ChevronRight className="text-sec" size={20} />
          </div>
          
          <div className="flex-between p-4 hover:bg-white/5 rounded-xl transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <Settings className="text-sec" size={20} />
              <div>
                <div style={{ fontWeight: 600 }}>Parámetros ATS</div>
                <div className="text-sec">Configura rangos de fechas y secuencias.</div>
              </div>
            </div>
            <ChevronRight className="text-sec" size={20} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
