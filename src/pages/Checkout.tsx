import { CreditCard, Truck, ShieldCheck, ArrowLeft, CheckCircle2, ShoppingBag, Banknote, User, MapPin, Edit3, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabaseClient';

const Checkout = () => {
    const { user } = useAuth();
    const { cart, total, clearCart, shippingCost, grandTotal } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('cod');
    const [isEditingInfo, setIsEditingInfo] = useState(true);
    const [hasSavedData, setHasSavedData] = useState(false);

    // Form data combining Profile and Address fields
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        streetType: 'Calle',
        streetName: '',
        number: '',
        interior: '',
        district: '',
        reference: ''
    });

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                setFormData(prev => ({ ...prev, email: user.email || '' }));

                // Fetch User Profile
                const { data: userData } = await supabase
                    .from('users')
                    .select('full_name, phone')
                    .eq('id', user.id)
                    .single();

                // Fetch Address
                const { data: addressData } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('is_default', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (userData || addressData) {
                    const newFormData = {
                        fullName: userData?.full_name || '',
                        phone: userData?.phone || '',
                        email: user.email || '',
                        streetType: addressData?.street_type || 'Calle',
                        streetName: addressData?.street_name || '',
                        number: addressData?.number || '',
                        interior: addressData?.interior || '',
                        district: addressData?.district || '',
                        reference: addressData?.reference || ''
                    };

                    setFormData(newFormData);

                    // If we have critical data, show summary instead of form
                    if (newFormData.fullName && newFormData.phone && newFormData.district && newFormData.streetName) {
                        setIsEditingInfo(false);
                        setHasSavedData(true);
                    }
                }
            };
            fetchData();
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const val = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({ ...prev, phone: val ? `+51 ${val}` : '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFinishOrder = async () => {
        if (!user) {
            alert('Debes iniciar sesión para realizar un pedido.');
            navigate('/login');
            return;
        }

        if (cart.length === 0) {
            alert('Tu carrito está vacío.');
            return;
        }

        // Validation
        if (!formData.fullName || !formData.phone || !formData.district || !formData.streetName || !formData.number || !formData.reference) {
            alert('Por favor completa todos los campos obligatorios.');
            setIsEditingInfo(true);
            return;
        }

        setLoading(true);

        try {
            // 0. UPSERT USER PROFILE (Satisfies Foreign Key Constraint)
            // We use upsert to ensure that if the record doesn't exist in public.users, it gets created.
            const userProfile = {
                id: user.id,
                email: user.email,
                full_name: formData.fullName,
                phone: formData.phone,
                role: 'customer' // Default role
            };

            const { error: userError } = await supabase
                .from('users')
                .upsert(userProfile, { onConflict: 'id' });

            if (userError) {
                console.error('Error in user upsert:', userError);
                // Continue if error is just about existing ID, but if it's something else, we might have issues.
            }

            // 1. SAVE ADDRESS (Permanently)
            const addressPayload = {
                user_id: user.id,
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

            // Manual check for existing address to avoid 'upsert' constraint issues
            const { data: existingAddress } = await supabase
                .from('addresses')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (existingAddress) {
                const { error: addressError } = await supabase
                    .from('addresses')
                    .update(addressPayload)
                    .eq('id', existingAddress.id);

                if (addressError) console.error('Error updating address:', addressError);
            } else {
                const { error: addressError } = await supabase
                    .from('addresses')
                    .insert([addressPayload]);

                if (addressError) console.error('Error inserting address:', addressError);
            }

            // 2. VERIFY STOCK BEFORE PROCEEDING
            const productIds = cart.map(item => item.id);
            const { data: dbProducts, error: stockCheckError } = await supabase
                .from('products')
                .select('id, name, stock')
                .in('id', productIds);

            if (stockCheckError) throw stockCheckError;

            for (const item of cart) {
                const dbProduct = dbProducts?.find(p => p.id === item.id);
                if (!dbProduct || dbProduct.stock < item.quantity) {
                    setLoading(false);
                    alert(`Lo sentimos, el producto "${item.name}" no tiene suficiente stock (Disponible: ${dbProduct?.stock || 0}).`);
                    return;
                }
            }

            // 3. CREATE ORDER
            // We store a stringified version of the address for historical accuracy
            const shippingAddressString = JSON.stringify({
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                district: formData.district,
                address: `${formData.streetType} ${formData.streetName} ${formData.number} ${formData.interior ? `Int ${formData.interior}` : ''}`,
                reference: formData.reference
            });

            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_id: user.id,
                    total_amount: grandTotal,
                    status: 'pending',
                    shipping_address: shippingAddressString,
                }])
                .select()
                .single();

            if (orderError) {
                console.error('Final Order Error:', orderError);
                throw orderError;
            }

            // 4. CREATE ORDER ITEMS AND DISCOUNT STOCK
            const orderItems = cart.map(item => ({
                order_id: orderData.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_purchase: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 5. DISCOUNT STOCK FROM PRODUCTS
            for (const item of cart) {
                const { error: updateStockError } = await supabase.rpc('decrement_product_stock', {
                    product_id_input: item.id,
                    quantity_input: item.quantity
                });

                // Fallback if RPC is not defined: simple update
                if (updateStockError) {
                    const dbProduct = dbProducts?.find(p => p.id === item.id);
                    if (dbProduct) {
                        await supabase
                            .from('products')
                            .update({ stock: dbProduct.stock - item.quantity })
                            .eq('id', item.id);
                    }
                }
            }

            // 6. SUCCESS
            clearCart();
            setIsFinished(true);

        } catch (error) {
            console.error('Error creating order:', error);
            alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (isFinished) {
        return (
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-20 text-center flex flex-col items-center gap-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-green-100 p-6 rounded-full"
                >
                    <CheckCircle2 className="h-20 w-20 text-green-600" />
                </motion.div>
                <h1 className="text-4xl font-bold">¡Pedido Confirmado!</h1>
                <p className="text-muted-foreground text-lg max-w-md">
                    Gracias por tu compra, <span className="text-black font-bold">{formData.fullName}</span>. Hemos recibido tu pedido con éxito.
                    {paymentMethod === 'cod' && <span className="block mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 font-medium text-black">Pago Contra Entrega: Pagarás al recibir tu pedido en {formData.district}.</span>}
                </p>
                <Link to="/" className="mt-8 bg-black text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-accent transition-all shadow-xl active:scale-95">
                    Seguir comprando
                </Link>
            </div>
        );
    }

    const distritos = [
        "Cercado de Lima", "Ate", "Barranco", "Breña", "Chorrillos", "Comas", "El Agustino",
        "Independencia", "Jesús María", "La Molina", "La Victoria", "Lince", "Los Olivos",
        "Lurigancho", "Lurín", "Magdalena del Mar", "Miraflores", "Pachacámac", "Pucusana",
        "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac",
        "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho", "San Juan de Miraflores",
        "San Luis", "San Martín de Porres", "San Miguel", "Santa Anita", "Santa María del Mar",
        "Santa Rosa", "Santiago de Surco", "Surquillo", "Villa El Salvador", "Villa María del Triunfo"
    ].sort();

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 lg:py-20">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4">FINALIZAR COMPRA</h1>
                        <p className="text-muted-foreground font-medium">Confirma tus datos para proceder.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                        <button onClick={() => setStep(1)} className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${step === 1 ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>1. Envío</button>
                        <button onClick={() => setStep(2)} disabled={step < 2} className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${step === 2 ? 'bg-black text-white shadow-lg' : 'text-gray-400 disabled:opacity-50'}`}>2. Pago</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    <div className="lg:col-span-7">
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <AnimatePresence mode="wait">
                                    {!isEditingInfo ? (
                                        <motion.div
                                            key="summary"
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-sm space-y-8 relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-accent group-hover:w-2 transition-all" />

                                            <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                                                <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                                    <Truck className="h-5 w-5 text-accent" /> Confirmar Envío
                                                </h3>
                                                <button
                                                    onClick={() => setIsEditingInfo(true)}
                                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent hover:text-black transition-colors bg-accent/5 px-4 py-2 rounded-full"
                                                >
                                                    <Edit3 className="h-3 w-3" /> Editar
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-4">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Destinatario</p>
                                                    <div className="space-y-1">
                                                        <p className="font-black text-lg text-gray-900 group-hover:text-accent transition-colors">{formData.fullName}</p>
                                                        <p className="text-sm font-bold text-gray-500">{formData.phone}</p>
                                                        <p className="text-sm font-medium text-gray-400">{formData.email}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dirección de Entrega</p>
                                                    <div className="space-y-1">
                                                        <p className="font-black text-lg text-gray-900">{formData.district}</p>
                                                        <p className="text-sm font-bold text-gray-500">{formData.streetType} {formData.streetName} {formData.number} {formData.interior && `- ${formData.interior}`}</p>
                                                        <p className="text-[11px] font-bold text-accent bg-accent/5 px-3 py-1 rounded-md mt-2 inline-block">S/ {formData.reference}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setStep(2)}
                                                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:bg-accent transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                            >
                                                Confirmar y Continuar <Check className="h-5 w-5" />
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="form"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-10"
                                        >
                                            {/* Datos Personales Section */}
                                            <section className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-widest">
                                                        <User className="h-6 w-6 text-accent" /> Datos Personales
                                                    </h3>
                                                    {hasSavedData && (
                                                        <button
                                                            onClick={() => setIsEditingInfo(false)}
                                                            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nombre Completo</label>
                                                        <input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Ej. Juan Pérez" className="w-full p-4 rounded-xl border-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all outline-none font-medium shadow-sm" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Teléfono móvil</label>
                                                        <div className="relative flex items-center">
                                                            <span className="absolute left-4 text-gray-400 font-bold text-sm">+51</span>
                                                            <input name="phone" value={formData.phone.replace('+51 ', '')} onChange={handleInputChange} placeholder="999 999 999" maxLength={9} className="w-full pl-12 pr-4 py-4 rounded-xl border-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all outline-none font-medium shadow-sm" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            {/* Dirección Section */}
                                            <section className="space-y-6 pt-6 border-t border-gray-100">
                                                <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-widest">
                                                    <MapPin className="h-6 w-6 text-accent" /> Dirección de Entrega
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Distrito</label>
                                                        <select name="district" value={formData.district} onChange={handleInputChange} className="w-full p-4 rounded-xl border-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all outline-none font-medium shadow-sm appearance-none">
                                                            <option value="">Selecciona tu distrito</option>
                                                            {distritos.map(d => <option key={d} value={d}>{d}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Calle / Avenida / Jirón</label>
                                                        <div className="flex gap-2">
                                                            <select name="streetType" value={formData.streetType} onChange={handleInputChange} className="w-1/3 p-4 rounded-xl border-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all outline-none font-medium shadow-sm appearance-none">
                                                                <option value="Calle">Calle</option>
                                                                <option value="Av.">Avenida</option>
                                                                <option value="Jr.">Jirón</option>
                                                            </select>
                                                            <input name="streetName" value={formData.streetName} onChange={handleInputChange} placeholder="Nombre de la vía" className="w-2/3 p-4 rounded-xl border-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all outline-none font-medium shadow-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Número</label>
                                                        <input name="number" value={formData.number} onChange={handleInputChange} placeholder="Ej. 123" className="w-full p-4 rounded-xl border-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all outline-none font-medium shadow-sm" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Interior (Opcional)</label>
                                                        <input name="interior" value={formData.interior} onChange={handleInputChange} placeholder="Ej. Dpto 201" className="w-full p-4 rounded-xl border-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all outline-none font-medium shadow-sm" />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Referencia de entrega</label>
                                                        <input name="reference" value={formData.reference} onChange={handleInputChange} placeholder="Ej. Frente al parque, fachada color blanca" className="w-full p-4 rounded-xl border-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all outline-none font-medium shadow-sm" />
                                                    </div>
                                                </div>
                                            </section>

                                            <button onClick={() => setStep(2)} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:bg-accent transition-all active:scale-[0.98] mt-4">
                                                Confirmar Datos y Continuar
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                                <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground hover:text-black transition-colors">
                                    <ArrowLeft className="h-4 w-4" /> Volver a datos de envío
                                </button>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-widest">
                                        <CreditCard className="h-6 w-6 text-accent" /> Método de Pago
                                    </h3>

                                    <div className="space-y-4">
                                        <div
                                            onClick={() => setPaymentMethod('cod')}
                                            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${paymentMethod === 'cod' ? 'border-accent bg-accent/5 shadow-md' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                                                    <Banknote className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm uppercase tracking-widest">Pago Contra Entrega</p>
                                                    <p className="text-xs text-muted-foreground font-medium">Paga en efectivo o Yape/Plin al recibir.</p>
                                                </div>
                                            </div>
                                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'cod' ? 'border-accent bg-accent' : 'border-gray-200 group-hover:border-gray-300'}`}>
                                                {paymentMethod === 'cod' && <div className="h-2 w-2 bg-white rounded-full shadow-sm" />}
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-2xl border-2 border-gray-50 bg-gray-50/50 opacity-60 flex items-center gap-5 cursor-not-allowed grayscale">
                                            <div className="h-12 w-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300">
                                                <CreditCard className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm uppercase tracking-widest text-gray-400">Tarjeta de Crédito / Débito</p>
                                                <p className="text-[10px] font-black text-accent uppercase tracking-widest">Próximamente</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleFinishOrder}
                                    disabled={loading}
                                    className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-sm shadow-2xl hover:bg-accent transition-all active:scale-[0.98] mt-8 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? 'Confirmando pedido...' : 'Finalizar Compra'}
                                    <ShieldCheck className="h-5 w-5" />
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <aside className="lg:col-span-5 h-fit sticky top-28">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                            <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                                    <ShoppingBag className="h-5 w-5 text-accent" /> Tu Resumen
                                </h3>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex gap-4 items-center group">
                                            <div className="h-20 w-20 bg-gray-50 rounded-2xl border border-gray-100 p-1 shrink-0 overflow-hidden transition-transform group-hover:scale-105">
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover rounded-xl" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black line-clamp-2 uppercase tracking-tight text-gray-900 leading-tight mb-1">{item.name}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cant: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-black whitespace-nowrap">S/ {(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-50">
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span className="text-black">S/ {total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        <span>Costo de Envío</span>
                                        {shippingCost > 0 ? (
                                            <span className="text-black">S/ {shippingCost.toFixed(2)}</span>
                                        ) : (
                                            <span className="text-green-600">Gratis</span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-black/5">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-1">Total a pagar</p>
                                            <p className="text-4xl font-black tracking-tighter">S/ {grandTotal.toFixed(2)}</p>
                                        </div>
                                        <div className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2">
                                            PEN
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
