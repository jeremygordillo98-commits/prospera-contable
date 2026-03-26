import { motion } from 'framer-motion';
import { Target, TrendingUp, Download } from 'lucide-react';

export const Reportes = () => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card flex-center flex-col" style={{ textAlign: 'center', padding: '100px 0', marginTop: '40px' }}>
      <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <Target size={32} />
      </div>
      <h2 className="h1 mb-4">Módulo de Reportes SRI</h2>
      <p className="text-sec max-w-md mx-auto mb-8">
        El sistema de consolidación de balances, ATS, rentas y estado de resultados está en desarrollo. Estará disponible en la próxima actualización.
      </p>
      <div className="flex gap-4">
        <button className="btn" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <TrendingUp size={18} /> Balance de Comprobación
        </button>
        <button className="btn btn-primary flex gap-2 items-center">
          <Download size={18} /> Generar Anexo Transaccional ATS
        </button>
      </div>
    </motion.div>
  );
};
