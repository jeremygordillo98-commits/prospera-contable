import { motion } from 'framer-motion';
import { BookOpen, PlusCircle } from 'lucide-react';

export const Asientos = () => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card flex-center flex-col" style={{ textAlign: 'center', padding: '100px 0', marginTop: '40px' }}>
      <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <BookOpen size={32} />
      </div>
      <h2 className="h1 mb-4">Registro Diferido</h2>
      <p className="text-sec max-w-md mx-auto mb-8">
        El módulo de Asientos Contables está en construcción acelerada. Pronto podrás generar partidas dobles y diarios de forma automática.
      </p>
      <button className="btn btn-primary flex gap-2 items-center">
        <PlusCircle size={18} /> Proponer Nuevo Asiento
      </button>
    </motion.div>
  );
};
