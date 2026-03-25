import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BookOpen, 
  TrendingUp, 
  Settings, 
  Upload, 
  PlusCircle, 
  ChevronRight,
  PieChart,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Views
import { Entidades } from './views/Entidades';
import { PlanCuentas } from './views/PlanCuentas';
import { Configuracion } from './views/Configuracion';
import { XMLUploadModal } from './components/XMLUploadModal';

const DashboardView = ({ onUploadClick }: { onUploadClick: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -20 }}
    className="dashboard-content"
  >
    <header className="flex-between">
      <div>
        <h1 className="h1">Prospera Contable</h1>
        <p className="text-sec">Tu gestión financiera automatizada para Pymes.</p>
      </div>
      <div className="flex gap-8">
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={18} /> Nuevo Asiento
        </button>
        <button 
          onClick={onUploadClick} 
          className="btn glass-card" 
          style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Upload size={18} /> Cargar XML
        </button>
      </div>
    </header>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '32px' }}>
      <div className="glass-card">
        <div className="flex-between">
          <span className="text-sec">Balance Actual</span>
          <TrendingUp size={20} className="text-success" />
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, margin: '12px 0' }}>$45,230.15</div>
        <div className="text-sec" style={{ fontSize: '0.8rem' }}>
          <span className="text-success">+12%</span> vs mes anterior
        </div>
      </div>
      
      <div className="glass-card">
        <div className="flex-between">
          <span className="text-sec">Cuentas por Cobrar</span>
          <Users size={20} style={{ color: '#3B82F6' }} />
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, margin: '12px 0' }}>$12,840.00</div>
        <div className="text-sec" style={{ fontSize: '0.8rem' }}>8 facturas pendientes</div>
      </div>

      <div className="glass-card">
        <div className="flex-between">
          <span className="text-sec">Cuentas por Pagar</span>
          <Users size={20} style={{ color: '#EF4444' }} />
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, margin: '12px 0' }}>$5,120.40</div>
        <div className="text-sec" style={{ fontSize: '0.8rem' }}>Vence hoy: $1,200.00</div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Últimas Transacciones</h3>
        <div className="table-placeholder" style={{ opacity: 0.7 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Compra de Mercadería - XML 123...{i}</div>
                <div className="text-sec" style={{ fontSize: '0.75rem' }}>24 Mar, 2026 • Distribuidora Continental</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800 }}>$145.00</div>
                <div className="text-sec" style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Cuadrado</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Distribución de Gastos</h3>
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PieChart size={120} style={{ opacity: 0.2 }} />
        </div>
        <div className="text-sec" style={{ textAlign: 'center', fontSize: '0.85rem' }}>Gráfico interactivo próximamente</div>
      </div>
    </div>
  </motion.div>
);

const App = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'entidades', icon: Users, label: 'Terceros (CXC/CXP)' },
    { id: 'plan-cuentas', icon: BookOpen, label: 'Plan de Cuentas' },
    { id: 'asientos', icon: Grid, label: 'Asientos Contables' },
    { id: 'reportes', icon: FileText, label: 'Reportes (Balances)' },
    { id: 'config', icon: Settings, label: 'Configuración' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView onUploadClick={() => setIsUploadOpen(true)} />;
      case 'entidades': return <Entidades />;
      case 'plan-cuentas': return <PlanCuentas />;
      case 'config': return <Configuracion />;
      default:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card" 
            style={{ textAlign: 'center', padding: '100px 0' }}
          >
            <h2 className="h1">Módulo en Construcción</h2>
            <p className="text-sec">Próxima entrega: {navItems.find(n => n.id === activeView)?.label}</p>
          </motion.div>
        );
    }
  };

  return (
    <div className="app-container">
      <div className="aurora-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '8px' }}>
          <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>P</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Prospera <span style={{ color: 'var(--primary)' }}>Pymes</span></h2>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366F1, #C026D3)', borderRadius: '50%' }}></div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Emanuel</div>
              <div className="text-sec" style={{ fontSize: '0.7rem' }}>Contador Pro</div>
            </div>
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

      <XMLUploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={() => {
           console.log("Upload Success!");
        }} 
      />
    </div>
  );
};

export default App;
