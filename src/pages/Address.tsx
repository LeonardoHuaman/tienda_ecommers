import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

const Address = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        streetType: 'Calle',
        streetName: '',
        number: '',
        interior: '',
        district: '',
        reference: ''
    });
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
                .from('addresses')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            // If no address found (PGRST116), it's fine, just leave empty
            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setFormData({
                    streetType: data.street_type || 'Calle',
                    streetName: data.street_name || '',
                    number: data.number || '',
                    interior: data.interior || '',
                    district: data.district || '',
                    reference: data.reference || ''
                });
            } else {
                // Fallback: check legacy user table just in case they haven't migrated
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('address')
                    .eq('id', user?.id)
                    .single();

                if (!userError && userData?.address) {
                    if (userData.address.startsWith('{')) {
                        try {
                            const parsed = JSON.parse(userData.address);
                            setFormData(parsed);
                        } catch (e) {
                            setFormData(prev => ({ ...prev, reference: userData.address }));
                        }
                    } else {
                        setFormData(prev => ({ ...prev, reference: userData.address }));
                    }
                }
            }
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
            // Check if address exists
            const { data: existingAddr } = await supabase
                .from('addresses')
                .select('id')
                .eq('user_id', user?.id)
                .single();

            const payload = {
                user_id: user?.id,
                department: 'Lima',
                province: 'Lima',
                district: formData.district,
                street_type: formData.streetType,
                street_name: formData.streetName,
                number: formData.number,
                interior: formData.interior,
                reference: formData.reference,
                is_default: true
            };

            let error;
            if (existingAddr) {
                const { error: updateError } = await supabase
                    .from('addresses')
                    .update(payload)
                    .eq('id', existingAddr.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('addresses')
                    .insert([payload]);
                error = insertError;
            }

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
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Departamento y Provincia - Locked for Lima */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Departamento</label>
                                <input disabled value="Lima" className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-500 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Provincia</label>
                                <input disabled value="Lima" className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-500 cursor-not-allowed" />
                            </div>

                            {/* Distrito */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Distrito</label>
                                <select
                                    required
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-accent focus:bg-white rounded-xl outline-none transition-all appearance-none"
                                >
                                    <option value="">Selecciona tu distrito</option>
                                    {[
                                        "Cercado de Lima", "Ate", "Barranco", "Breña", "Chorrillos", "Comas", "El Agustino",
                                        "Independencia", "Jesús María", "La Molina", "La Victoria", "Lince", "Los Olivos",
                                        "Lurigancho", "Lurín", "Magdalena del Mar", "Miraflores", "Pachacámac", "Pucusana",
                                        "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac",
                                        "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho", "San Juan de Miraflores",
                                        "San Luis", "San Martín de Porres", "San Miguel", "Santa Anita", "Santa María del Mar",
                                        "Santa Rosa", "Santiago de Surco", "Surquillo", "Villa El Salvador", "Villa María del Triunfo"
                                    ].sort().map(dist => (
                                        <option key={dist} value={dist}>{dist}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Calle / Av / Jr */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Dirección</label>
                                <div className="flex gap-2">
                                    <select
                                        value={formData.streetType}
                                        onChange={(e) => setFormData({ ...formData, streetType: e.target.value })}
                                        className="w-1/3 px-4 py-3 bg-gray-50 border border-transparent focus:border-accent focus:bg-white rounded-xl outline-none transition-all"
                                    >
                                        <option value="Calle">Calle</option>
                                        <option value="Av.">Avenida</option>
                                        <option value="Jr.">Jirón</option>
                                        <option value="Psje.">Pasaje</option>
                                    </select>
                                    <input
                                        required
                                        placeholder="Nombre de la vía"
                                        value={formData.streetName}
                                        onChange={(e) => setFormData({ ...formData, streetName: e.target.value })}
                                        className="w-2/3 px-4 py-3 bg-gray-50 border border-transparent focus:border-accent focus:bg-white rounded-xl outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Número e Interior */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Número</label>
                                <input
                                    required
                                    placeholder="Ej. 123"
                                    value={formData.number}
                                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-accent focus:bg-white rounded-xl outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Interior / Dpto (Opcional)</label>
                                <input
                                    placeholder="Ej. 201"
                                    value={formData.interior}
                                    onChange={(e) => setFormData({ ...formData, interior: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-accent focus:bg-white rounded-xl outline-none transition-all"
                                />
                            </div>

                            {/* Referencia */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Referencia</label>
                                <input
                                    required
                                    placeholder="Ej. Frente al parque, fachada color blanca"
                                    value={formData.reference}
                                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-accent focus:bg-white rounded-xl outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <h3 className="font-bold text-sm mb-2 text-blue-900">💡 Información Importante</h3>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• Nos aseguraremos de entregar en {formData.district || 'tu distrito'}.</li>
                                <li>• La referencia ayuda al courier a llegar más rápido.</li>
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
