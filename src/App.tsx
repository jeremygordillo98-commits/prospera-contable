import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BookOpen, 
  Settings, 
  ChevronRight,
  Grid,
  LogOut,
  Loader2,
  Building2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './services/supabase';
import type { Session } from '@supabase/supabase-js';

// Views
import { Entidades } from './views/Entidades';
import { PlanCuentas } from './views/PlanCuentas';
import { Configuracion } from './views/Configuracion';
import { Login } from './views/Login';
import { Asientos } from './views/Asientos';
import { Reportes } from './views/Reportes';
import { Perfil } from './views/Perfil';
import { XMLUploadModal } from './components/XMLUploadModal';
import { DashboardView } from './views/Dashboard';

interface Empresa {
  id: string;
  nombre_empresa: string;
  ruc_empresa: string;
}



const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Multitenancy states
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [showNewEmpresaModal, setShowNewEmpresaModal] = useState(false);
  const [newEmpresaName, setNewEmpresaName] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchEmpresas();
    }
  }, [session]);

  const fetchEmpresas = async () => {
    setLoadingEmpresas(true);
    const { data, error } = await supabase
      .from('empresas_gestionadas')
      .select('*')
      .order('nombre_empresa');
    
    if (!error && data) {
      setEmpresas(data);
      if (data.length > 0 && !selectedEmpresa) {
        setSelectedEmpresa(data[0]);
      }
    }
    setLoadingEmpresas(false);
  };

  const createEmpresa = async () => {
    if (!newEmpresaName) return;
    const { data, error } = await supabase
      .from('empresas_gestionadas')
      .insert({ 
        nombre_empresa: newEmpresaName,
        ruc_empresa: `TEMP-${Date.now()}` // RUC temporal si solo queremos nombre
      })
      .select()
      .single();
    
    if (!error && data) {
      setEmpresas([...empresas, data]);
      setSelectedEmpresa(data);
      setShowNewEmpresaModal(false);
      setNewEmpresaName('');
    } else {
      console.error(error);
      alert("Error al crear la empresa");
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'entidades', icon: Users, label: 'Terceros (CXC/CXP)' },
    { id: 'plan-cuentas', icon: BookOpen, label: 'Plan de Cuentas' },
    { id: 'asientos', icon: Grid, label: 'Asientos Contables' },
    { id: 'reportes', icon: FileText, label: 'Reportes (Balances)' },
    { id: 'config', icon: Settings, label: 'Configuración' },
  ];

  const renderContent = () => {
    if (!selectedEmpresa) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
                <Building2 size={64} className="text-sec" style={{ marginBottom: '24px', opacity: 0.3 }} />
                <h2 className="h1">Crea tu primera empresa</h2>
                <p className="text-sec" style={{ maxWidth: '400px', margin: '16px 0 24px' }}>
                    Para comenzar a llevar la contabilidad, necesitas registrar al menos un cliente o empresa.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <input 
                        type="text" 
                        placeholder="Nombre de la empresa" 
                        value={newEmpresaName}
                        onChange={(e) => setNewEmpresaName(e.target.value)}
                        style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}
                    />
                    <button className="btn btn-primary" onClick={createEmpresa}>Crear Cliente</button>
                </div>
            </div>
        );
    }

    switch (activeView) {
      case 'dashboard': return <DashboardView empresaId={selectedEmpresa.id} onUploadClick={() => setIsUploadOpen(true)} />;
      case 'entidades': return <Entidades empresaId={selectedEmpresa.id} />;
      case 'plan-cuentas': return <PlanCuentas empresaId={selectedEmpresa.id} />;
      case 'asientos': return <Asientos />;
      case 'reportes': return <Reportes />;
      case 'config': return <Configuracion />;
      case 'perfil': return <Perfil />;
      default:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-center flex-col glass-card" 
            style={{ textAlign: 'center', padding: '100px 0', marginTop: '40px' }}
          >
            <h2 className="h1">Módulo en Construcción</h2>
            <p className="text-sec">Próxima entrega: {activeView}</p>
          </motion.div>
        );
    }
  };

  if (!session) {
    return <Login />;
  }

  if (loadingEmpresas) {
      return (
          <div className="flex-center" style={{ height: '100vh', background: '#0f172a' }}>
              <Loader2 className="animate-spin text-primary" size={48} />
          </div>
      );
  }

  return (
    <div className="app-container">
      <div className="aurora-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
          <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>P</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Prospera <span style={{ color: 'var(--primary)' }}>Contable</span></h2>
        </div>

        {/* SELECTOR DE EMPRESA */}
        <div style={{ marginBottom: '24px', padding: '0 8px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Cliente Seleccionado</label>
            <div className="glass-card" style={{ padding: '4px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <select 
                    value={selectedEmpresa?.id || ''} 
                    onChange={(e) => setSelectedEmpresa(empresas.find(emp => emp.id === e.target.value) || null)}
                    style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '8px', fontSize: '0.9rem', outline: 'none' }}
                >
                    {empresas.map(emp => (
                        <option key={emp.id} value={emp.id} style={{ background: '#1c243a' }}>{emp.nombre_empresa}</option>
                    ))}
                </select>
                <button 
                  onClick={() => setShowNewEmpresaModal(true)}
                  style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.03)', border: 'none', borderRadius: '8px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                    <Plus size={14} /> Nuevo Cliente
                </button>
            </div>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className="btn"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                background: activeView === item.id ? 'var(--primary-light)' : 'transparent',
                color: activeView === item.id ? 'var(--primary)' : 'var(--text-sec)',
                padding: '12px 16px',
                marginBottom: '4px',
                border: activeView === item.id ? '1px solid rgba(99, 102, 241, 0.2)' : 'none',
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {activeView === item.id && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </nav>

        <div className="glass-card" style={{ padding: '16px', marginTop: 'auto', borderRadius: '12px' }}>
          <div className="flex-between">
            <button
                onClick={() => setActiveView('perfil')}
                style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', textAlign: 'left', flex: 1 }}
            >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #C026D3)', display: 'flex', alignItems: 'center', justifyItems: 'center', color: '#fff', fontWeight: 800 }}></div>
                <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>{session.user.user_metadata?.nombre_completo || session.user.email?.split('@')[0]}</div>
                    <div className="text-sec" style={{ fontSize: '0.7rem' }}>Mi Perfil</div>
                </div>
            </button>
            <button 
                onClick={() => supabase.auth.signOut()}
                className="btn flex-center" 
                style={{ width: '36px', height: '36px', padding: 0, borderRadius: '10px', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'transparent' }}
                title="Cerrar Sesión"
            >
                <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <AnimatePresence mode="wait">
          <div key={activeView}>
            {renderContent()}
          </div>
        </AnimatePresence>
      </main>

      <nav className="mobile-nav">
        {navItems.map(item => {
          const shortLabel = item.id === 'entidades' ? 'Terceros' : 
                            item.id === 'plan-cuentas' ? 'Cuentas' : 
                            item.id === 'asientos' ? 'Asientos' : 
                            item.id === 'reportes' ? 'Reportes' : 
                            item.label;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`nav-item-mobile ${activeView === item.id ? 'active' : ''}`}
            >
              <item.icon size={22} />
              <span>{shortLabel}</span>
            </button>
          );
        })}
        <button
          onClick={() => supabase.auth.signOut()}
          className="nav-item-mobile"
          style={{ color: 'var(--error)' }}
        >
          <LogOut size={22} />
          <span>Salir</span>
        </button>
      </nav>

      {/* Modal Nueva Empresa */}
      <AnimatePresence>
        {showNewEmpresaModal && (
          <div className="modal-overlay" style={{ zIndex: 200 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="glass-card" 
              style={{ width: '90%', maxWidth: '400px', padding: '32px' }}
            >
                <h3>Nuevo Cliente Contable</h3>
                <p className="text-sec" style={{ margin: '12px 0 24px' }}>Ingresa el nombre de la empresa para separar su contabilidad.</p>
                <input 
                    autoFocus
                    type="text" 
                    placeholder="Nombre de la empresa" 
                    value={newEmpresaName}
                    onChange={(e) => setNewEmpresaName(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', marginBottom: '24px' }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn flex-1" onClick={() => setShowNewEmpresaModal(false)}>Cancelar</button>
                    <button className="btn btn-primary flex-1" onClick={createEmpresa}>Crear Empresa</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <XMLUploadModal 
        isOpen={isUploadOpen} 
        empresaId={selectedEmpresa?.id || ''}
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={() => {
           console.log("Upload Success!");
        }} 
      />
    </div>
  );
};

export default App;
// Clean App.tsx
