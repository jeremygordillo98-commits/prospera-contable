import { useTheme } from '../context/ThemeContext';
import { 
  Sun, 
  Moon, 
  Layout,
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
        
        <div className="flex-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
          <div>
            <div style={{ fontWeight: 600 }}>Esquema de Color</div>
            <div className="text-sec">Cambia entre modo claro y oscuro.</div>
          </div>
          
          <div className="flex bg-black/5 dark:bg-black/20 p-1 rounded-full border border-black/10 dark:border-white/10">
            <button 
              onClick={() => !isDark || toggleTheme()}
              className={`btn ${!isDark ? 'btn-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              style={{ borderRadius: '50px', padding: '8px 20px', background: !isDark ? 'var(--primary)' : 'transparent', color: !isDark ? '#fff' : 'var(--text-main)' }}
            >
              <Sun size={20} />
            </button>
            <button 
              onClick={() => isDark || toggleTheme()}
              className={`btn ${isDark ? 'btn-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              style={{ borderRadius: '50px', padding: '8px 20px', background: isDark ? 'var(--primary)' : 'transparent', color: isDark ? '#fff' : 'var(--text-main)' }}
            >
              <Moon size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
