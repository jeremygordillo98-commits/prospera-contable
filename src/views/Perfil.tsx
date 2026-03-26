import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, LogOut } from 'lucide-react';
import { supabase } from '../services/supabase';


export const Perfil = () => {

    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        nombre_completo: '',
        email: '',
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserData({
                nombre_completo: user.user_metadata?.nombre_completo || '',
                email: user.email || '',
            });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const { error } = await supabase.auth.updateUser({
                data: { nombre_completo: userData.nombre_completo }
            });

            if (error) throw error;
            
            // También deberíamos actualizar la tabla perfiles si existe
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('perfiles').update({
                    nombre_completo: userData.nombre_completo
                }).eq('id', user.id);
            }

            setMessage({ text: 'Perfil actualizado exitosamente', type: 'success' });
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        color: 'var(--text-main)',
        outline: 'none',
        marginTop: '8px'
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto mt-10">
            <header className="mb-8">
                <h2 className="h1">Mi Perfil Contable</h2>
                <p className="text-sec">Administra tu información profesional.</p>
            </header>

            <div className="glass-card" style={{ padding: '32px' }}>
                <div className="flex items-center gap-6 mb-8 pb-8" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #C026D3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                        {userData.nombre_completo ? userData.nombre_completo.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', margin: '0 0 4px 0', fontWeight: 800 }}>{userData.nombre_completo || 'Usuario'}</h3>
                        <div className="text-sec flex items-center gap-2">
                            <Mail size={16} /> {userData.email}
                        </div>
                    </div>
                </div>

                {message.text && (
                    <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: message.type === 'error' ? 'var(--error)' : 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }} className="flex items-center gap-2">
                            <User size={18} /> Nombre de Despacho o Contador
                        </label>
                        <input
                            type="text"
                            value={userData.nombre_completo}
                            onChange={e => setUserData({ ...userData, nombre_completo: e.target.value })}
                            style={inputStyle}
                            placeholder="Ej: Ruiz & Asociados"
                            required
                        />
                    </div>

                    <div>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-sec)' }} className="flex items-center gap-2">
                            <Mail size={18} /> Correo de Acceso (No modificable)
                        </label>
                        <input
                            type="email"
                            value={userData.email}
                            disabled
                            style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-sec)', marginTop: '6px' }}>
                            Para cambiar tu correo de acceso, por favor contacta a soporte.
                        </p>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button type="submit" className="btn btn-primary flex flex-1 items-center justify-center gap-2" disabled={loading}>
                            <Save size={18} /> {loading ? 'Actualizando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="glass-card" style={{ padding: '24px', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
                <h3 style={{ color: 'var(--error)', margin: '0 0 8px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={20} /> Sesión de Seguridad
                </h3>
                <p className="text-sec mb-4">Cierra tu sesión activa para proteger la información de tus clientes en este dispositivo.</p>
                <button 
                    onClick={handleLogout}
                    className="btn"
                    style={{ background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', fontWeight: 600 }}
                >
                    Cerrar Sesión Activa
                </button>
            </div>
        </motion.div>
    );
};
