import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ArrowRight, Mail, Lock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const message = searchParams.get('message');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold mb-2 uppercase tracking-tighter">Bienvenido</h1>
                    <p className="text-muted-foreground">Inicia sesión para continuar comprando</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {message && (
                        <div className="p-3 text-sm bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="p-3 text-sm bg-red-50 text-red-500 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent focus:border-accent focus:bg-white rounded-xl outline-none transition-all"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Contraseña</label>
                            <button type="button" className="text-[10px] font-bold text-accent uppercase hover:underline">
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent focus:border-accent focus:bg-white rounded-xl outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/90 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Ingresar <ArrowRight className="h-4 w-4" /></>}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    ¿No tienes una cuenta?{' '}
                    <Link to="/register" className="text-accent font-bold hover:underline">
                        Regístrate aquí
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
