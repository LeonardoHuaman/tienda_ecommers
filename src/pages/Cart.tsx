import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
    // Simple state simulation
    const cartItems = MOCK_PRODUCTS.slice(0, 2).map(p => ({ ...p, quantity: 1 }));
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="container px-4 py-12">
            <h1 className="text-4xl font-bold mb-12 text-center">Tu Carrito</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart List */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <AnimatePresence>
                        {cartItems.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className="flex items-center gap-6 p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-accent/20 transition-all"
                            >
                                <div className="h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                </div>

                                <div className="flex-1">
                                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{item.brand}</span>
                                    <h4 className="font-bold text-lg mb-1">{item.name}</h4>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
                                        <button className="p-2 hover:bg-gray-100"><Minus className="h-3 w-3" /></button>
                                        <span className="px-4 font-bold">{item.quantity}</span>
                                        <button className="p-2 hover:bg-gray-100"><Plus className="h-3 w-3" /></button>
                                    </div>
                                    <div className="text-right min-w-[100px]">
                                        <span className="font-bold text-lg block">S/ {(item.price * item.quantity).toFixed(2)}</span>
                                        <button className="text-muted-foreground hover:text-red-500 transition-colors mt-1">
                                            <Trash2 className="h-4 w-4 inline mr-1" /> <span className="text-xs">Remover</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <button className="text-sm font-medium text-muted-foreground hover:text-black mt-4 transition-colors text-center py-4 border-b border-dashed">
                        Continuar comprando
                    </button>
                </div>

                {/* Summary */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-primary-foreground text-primary rounded-2xl p-8 flex flex-col gap-8 h-fit shadow-2xl"
                >
                    <h3 className="text-2xl font-bold border-b border-gray-700 pb-4">Resumen</h3>

                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Subtotal</span>
                            <span className="font-bold">S/ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Envío</span>
                            <span className="text-green-400 font-bold tracking-widest uppercase text-xs">Gratis</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl mt-4">
                            <input
                                placeholder="Código de cupón"
                                className="bg-transparent border-none text-sm w-full focus:outline-none"
                            />
                            <button className="text-accent font-bold text-sm">Aplicar</button>
                        </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-gray-700 pt-6">
                        <span className="text-lg">Total</span>
                        <span className="text-4xl font-bold">S/ {subtotal.toFixed(2)}</span>
                    </div>

                    <button className="bg-accent text-white py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-accent/90 transition-all shadow-xl shadow-accent/20">
                        Ir al Pago <ArrowRight className="h-5 w-5" />
                    </button>

                    <div className="flex items-center justify-center gap-4 pt-4 grayscale opacity-50">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" className="h-4" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Cart;
