import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Zap, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { XMLUploadModal } from '../components/XMLUploadModal';

interface SRIAutomationProps {
    tipo: 'Compras' | 'Ventas';
    empresaId: string;
}

export const SRIAutomation: React.FC<SRIAutomationProps> = ({ tipo, empresaId }) => {
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    return (
        <div className="sri-automation-container">
            <header className="flex-between" style={{ marginBottom: '40px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '8px' }}>
                        <Zap size={14} /> Automatización SRI
                    </div>
                    <h1 className="h1" style={{ fontSize: '2.5rem', fontWeight: 900 }}>XML {tipo}</h1>
                    <p className="text-sec" style={{ fontSize: '1.1rem' }}>Sincroniza tus facturas electrónicas con tu contabilidad en segundos.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => setIsUploadOpen(true)}
                        className="btn btn-primary" 
                        style={{ padding: '14px 28px', borderRadius: '18px', fontSize: '1rem', fontWeight: 800, letterSpacing: '0.5px' }}
                    >
                        <Upload size={20} /> Cargar Factura XML
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* Pantalla de Bienvenida al Módulo si no hay datos procesados (Ideal para UX) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card" 
                    style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                    <div style={{ width: 80, height: 80, background: 'var(--primary-light)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '24px' }}>
                        <Sparkles size={40} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>Procesador Masivo de XML</h2>
                    <p className="text-sec" style={{ maxWidth: '500px', fontSize: '1.1rem', marginBottom: '32px' }}>
                         Sube tus archivos electrónicos y el sistema creará automáticamente los asientos contables, 
                         vinculará a los proveedores y preparará tus anexos del SRI.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--text-sec)' }}>
                             <div style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px' }}><CheckCircle2 size={16}/></div>
                             Mapeo Automático de Cuentas
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--text-sec)' }}>
                             <div style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px' }}><CheckCircle2 size={16}/></div>
                             Detección de Proveedores
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--text-sec)' }}>
                             <div style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px' }}><CheckCircle2 size={16}/></div>
                             Validación de Doble Partida
                         </div>
                    </div>
                </motion.div>

                {/* Futuro: Historial de Cargas Pasadas en este módulo */}
                <div className="glass-card" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                    <div className="flex-between" style={{ marginBottom: '20px' }}>
                        <h4 style={{ margin: 0 }}>Historial Reciente</h4>
                        <Filter size={18} />
                    </div>
                    <div style={{ padding: '40px 0', textAlign: 'center' }}>
                         <FileText size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                         <p style={{ fontSize: '0.8rem' }}>Tus cargas aparecerán aquí después de procesar el primer XML.</p>
                    </div>
                </div>
            </div>

            <XMLUploadModal 
                isOpen={isUploadOpen} 
                empresaId={empresaId}
                onClose={() => setIsUploadOpen(false)} 
                onSuccess={() => {
                    // Aquí se puede refrescar una tabla local de historial si existiera
                    console.log("Factura SRI procesada con éxito");
                }} 
            />
        </div>
    );
};
