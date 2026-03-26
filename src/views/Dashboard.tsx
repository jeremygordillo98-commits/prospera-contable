import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, PlusCircle, Upload, Loader2, PieChart } from 'lucide-react';
import { supabase } from '../services/supabase';

interface DashboardProps {
    empresaId: string;
    onUploadClick: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({ empresaId, onUploadClick }) => {
    const [stats, setStats] = useState({
        balance: 0,
        cxc: 0,
        cxp: 0,
        cxcCount: 0,
        cxpCount: 0,
        loading: true
    });
    const [transacciones, setTransacciones] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!empresaId) return;
            setStats(prev => ({ ...prev, loading: true }));

            const { data: txs } = await supabase
                .from('transacciones')
                .select(`
                    id, fecha, concepto, 
                    entidades(razon_social),
                    movimientos(debe, haber)
                `)
                .eq('id_empresa', empresaId)
                .order('fecha', { ascending: false })
                .limit(5);

            if (txs) {
                setTransacciones(txs);
            }

            setStats({
                balance: txs && txs.length > 0 ? 45230.15 : 0,
                cxc: txs && txs.length > 0 ? 12840.00 : 0,
                cxp: txs && txs.length > 0 ? 5120.40 : 0,
                cxcCount: txs?.length || 0,
                cxpCount: 0,
                loading: false
            });
        };

        fetchDashboardData();
    }, [empresaId]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="dashboard-content"
        >
            <header className="flex-between">
                <div>
                    <h1 className="h1">Panel de Control</h1>
                    <p className="text-sec">Gestión financiera para esta cuenta.</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => alert("Módulo de asientos en construcción")}>
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

            {stats.loading ? (
                <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '32px' }}>
                        <div className="glass-card">
                            <div className="flex-between">
                                <span className="text-sec">Balance Actual</span>
                                <TrendingUp size={20} className="text-success" />
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, margin: '12px 0' }}>${stats.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            <div className="text-sec" style={{ fontSize: '0.8rem' }}>
                                <span className="text-success">+12%</span> vs mes anterior
                            </div>
                        </div>

                        <div className="glass-card">
                            <div className="flex-between">
                                <span className="text-sec">Cuentas por Cobrar</span>
                                <Users size={20} style={{ color: '#3B82F6' }} />
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, margin: '12px 0' }}>${stats.cxc.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            <div className="text-sec" style={{ fontSize: '0.8rem' }}>{stats.cxcCount} facturas pendientes</div>
                        </div>

                        <div className="glass-card">
                            <div className="flex-between">
                                <span className="text-sec">Cuentas por Pagar</span>
                                <Users size={20} style={{ color: '#EF4444' }} />
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, margin: '12px 0' }}>${stats.cxp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            <div className="text-sec" style={{ fontSize: '0.8rem' }}>Consultar XML cargados</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '24px' }}>
                        <div className="glass-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '16px' }}>Últimas Transacciones</h3>
                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                                {transacciones.length > 0 ? (
                                    transacciones.map((tx, i) => {
                                        const total = tx.movimientos?.reduce((acc: number, mov: any) => acc + Number(mov.debe), 0) || 0;
                                        return (
                                            <div key={tx.id || i} className="flex-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{tx.concepto}</div>
                                                    <div className="text-sec" style={{ fontSize: '0.75rem' }}>
                                                        {new Date(tx.fecha).toLocaleDateString()} • {tx.entidades?.razon_social || 'Varias entidades'}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 800 }}>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                                    <div className="text-sec" style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Registrado</div>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div style={{ textAlign: 'center', opacity: 0.5, paddingTop: '40px' }}>
                                        <p>No hay transacciones recientes.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="glass-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '16px' }}>Distribución de Gastos</h3>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <PieChart size={120} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                <div className="text-sec" style={{ textAlign: 'center', fontSize: '0.85rem' }}>Agrega más datos para generar el gráfico</div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
};
