import { useState } from 'react';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export const Login = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showMagicLinkSent, setShowMagicLinkSent] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleMagicLink = async () => {
        if (!email) {
            setError("Por favor, ingresa tu correo primero.");
            return;
        }
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin
            }
        });

        if (error) {
            setError(error.message);
        } else {
            setShowMagicLinkSent(true);
        }
        setLoading(false);
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: '20px' }}>
            <div className="aurora-bg">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card" 
                style={{ width: '100%', maxWidth: '420px', padding: '40px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: 48, height: 48, background: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.5rem', margin: '0 auto 16px' }}>P</div>
                    <h1 className="h1" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Prospera Pymes</h1>
                    <p className="text-sec">Panel de Contabilidad Avanzada</p>
                </div>

                <AnimatePresence mode="wait">
                    {showMagicLinkSent ? (
                        <motion.div 
                            key="magic-link-sent"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-center" 
                            style={{ flexDirection: 'column', textAlign: 'center', gap: '16px', padding: '20px 0' }}
                        >
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Mail size={32} />
                            </div>
                            <h3>¡Revisa tu correo!</h3>
                            <p className="text-sec">Hemos enviado un acceso directo a <b>{email}</b>. Revisa tu bandeja de entrada o spam.</p>
                            <button className="btn" style={{ marginTop: '12px' }} onClick={() => setShowMagicLinkSent(false)}>Volver</button>
                        </motion.div>
                    ) : (
                        <motion.form 
                            key="login-form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onSubmit={handleLogin} 
                            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                        >
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-sec)' }}>Correo Electrónico</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sec)' }} />
                                    <input 
                                        type="email" 
                                        placeholder="hola@empresa.com" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ width: '100%', padding: '12px 12px 12px 42px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-sec)' }}>Contraseña</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sec)' }} />
                                    <input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        required 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{ width: '100%', padding: '12px 12px 12px 42px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    style={{ color: 'var(--error)', fontSize: '0.8rem', textAlign: 'center' }}
                                >
                                    {error}
                                </motion.div>
                            )}

                            <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: '14px', width: '100%', justifyContent: 'center' }}>
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Ingresar <ArrowRight size={18} /></>}
                            </button>

                            <div style={{ position: 'relative', textAlign: 'center', margin: '16px 0' }}>
                                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />
                                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#1c243a', padding: '0 12px', fontSize: '0.75rem', color: 'var(--text-sec)' }}>O también</span>
                            </div>

                            <button 
                                type="button" 
                                className="btn glass-card" 
                                onClick={handleMagicLink}
                                disabled={loading}
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                Recibir Acceso Directo (Email)
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.85rem' }}>
                    <span className="text-sec">¿No tienes cuenta?</span> <a href="#" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Solicitar Acceso al Administrador</a>
                </div>
            </motion.div>
        </div>
    );
};
