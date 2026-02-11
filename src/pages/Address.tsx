import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

const Address = () => {
    const { user } = useAuth();
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (user) {
            fetchAddress();
        }
    }, [user]);

    const fetchAddress = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('address')
                .eq('id', user?.id)
                .single();

            if (error) throw error;
            setAddress(data?.address || '');
        } catch (err) {
            console.error('Error fetching address:', err);
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
                .update({ address })
                .eq('id', user?.id);

            if (error) throw error;
            setMessage({ type: 'success', text: '¡Dirección actualizada correctamente!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Error al actualizar la dirección' });
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
        <div className="container px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
            >
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Mi Dirección</h1>
                    <p className="text-muted-foreground">Actualiza tu dirección de envío</p>
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
                                Dirección Completa
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <textarea
                                    required
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    rows={4}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent focus:border-accent focus:bg-white rounded-xl outline-none transition-all resize-none"
                                    placeholder="Av. Principal 123, Distrito, Ciudad, Código Postal"
                                />
                            </div>
                            <p className="text-xs text-gray-500 ml-1">
                                Incluye calle, número, distrito, ciudad y código postal
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <h3 className="font-bold text-sm mb-2 text-blue-900">💡 Consejos para tu dirección</h3>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• Incluye referencias cercanas (ej: "frente al parque")</li>
                                <li>• Especifica si es casa o departamento</li>
                                <li>• Agrega el número de piso o interior si aplica</li>
                            </ul>
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
                                    Guardar Dirección
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Address;
