import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

const Profile = () => {
    const { user, role } = useAuth();
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user, role]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('full_name, phone')
                .eq('id', user?.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Si no existe perfil en la tabla, intentar usar datos de Auth
                    setFullName(user?.user_metadata?.full_name || '');
                    setPhone('');
                } else {
                    throw error;
                }
            } else {
                setFullName(data?.full_name || user?.user_metadata?.full_name || '');
                // Si el teléfono ya tiene el +51, lo dejamos así para que el input lo maneje
                setPhone(data?.phone || '');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('users')
                .update({ full_name: fullName, phone })
                .eq('id', user?.id);

            if (error) throw error;
            setMessage({ type: 'success', text: '¡Datos actualizados correctamente!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Error al actualizar los datos' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
            >
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Mis Datos Personales</h1>
                        <p className="text-muted-foreground">Actualiza tu información personal</p>
                    </div>
                    {role === 'admin' && (
                        <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-gray-700 shadow-lg">
                            Admin Account
                        </span>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-8">
                    <form onSubmit={handleSave} className="space-y-6">



                        {message && (
                            <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-gray-500 ml-1">El email no se puede modificar</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                                Nombre Completo
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent focus:border-accent focus:bg-white rounded-xl outline-none transition-all"
                                    placeholder="Juan Pérez"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                                Teléfono
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-gray-400 font-medium z-10 select-none pointer-events-none">+51</span>
                                <input
                                    type="tel"
                                    value={phone.replace('+51 ', '')}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                        setPhone(value ? `+51 ${value}` : '');
                                    }}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-accent focus:bg-white rounded-xl outline-none transition-all"
                                    placeholder="999 999 999"
                                    maxLength={9}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/90 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
