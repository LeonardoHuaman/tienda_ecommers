import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, total, shippingCost, grandTotal } = useCart();

    if (cart.length === 0) {
        return (
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-32 flex flex-col items-center justify-center text-center gap-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-100 p-8 rounded-full"
                >
                    <ShoppingBag className="h-16 w-16 text-gray-400" />
                </motion.div>
                <h1 className="text-3xl font-bold">Tu carrito está vacío</h1>
                <p className="text-muted-foreground">¡Explora nuestro catálogo y encuentra algo que te encante!</p>
                <Link to="/catalog" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-black/80 transition-all mt-4">
                    Ir al Catálogo
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">
            <h1 className="text-4xl font-bold mb-12 text-center">Tu Carrito ({cart.length})</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart List */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <AnimatePresence>
                        {cart.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100/50 hover:border-gray-200 transition-all"
                            >
                                <div className="h-24 w-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                </div>

                                <div className="flex-1 text-center sm:text-left">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.brand}</span>
                                    <h4 className="font-bold text-lg mb-1 leading-tight">{item.name}</h4>
                                    <p className="text-sm font-bold text-gray-900">S/ {item.price.toFixed(2)}</p>
                                </div>

                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center border rounded-lg overflow-hidden bg-white shadow-sm">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-2 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="px-3 font-bold text-sm min-w-[30px] text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-2 hover:bg-gray-50 text-gray-600 disabled:opacity-30"
                                                disabled={item.stock !== undefined && item.quantity >= item.stock}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        {item.stock !== undefined && item.quantity >= item.stock && (
                                            <span className="text-[9px] font-black text-orange-500 uppercase tracking-tighter">Límite alcanzado</span>
                                        )}
                                    </div>
                                    <div className="text-right min-w-[80px]">
                                        <span className="font-bold text-lg block text-gray-900">S/ {(item.price * item.quantity).toFixed(2)}</span>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-400 hover:text-red-600 transition-colors mt-1 text-xs font-medium flex items-center justify-end gap-1 ml-auto"
                                        >
                                            <Trash2 className="h-3 w-3" /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <Link to="/catalog" className="text-sm font-medium text-gray-500 hover:text-black mt-4 transition-colors text-center py-4 border-b border-dashed border-gray-200">
                        <ArrowRight className="h-4 w-4 inline mr-2 rotate-180" /> Continuar comprando
                    </Link>
                </div>

                {/* Summary */}
                <div className="h-fit">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black text-white rounded-3xl p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden"
                    >
                        {/* Decorational */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full blur-3xl -mr-16 -mt-16 opacity-20 pointer-events-none"></div>

                        <h3 className="text-2xl font-bold border-b border-gray-800 pb-4">Resumen</h3>

                        <div className="flex flex-col gap-4 text-gray-300">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-bold text-white">S/ {total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Envío</span>
                                {shippingCost > 0 ? (
                                    <span className="font-bold text-white">S/ {shippingCost.toFixed(2)}</span>
                                ) : (
                                    <span className="text-green-400 font-bold tracking-widest uppercase text-xs">Gratis</span>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-gray-800 pt-6 mt-2">
                            <span className="text-lg font-medium">Total</span>
                            <span className="text-3xl font-bold">S/ {grandTotal.toFixed(2)}</span>
                        </div>

                        <Link to="/checkout" className="bg-white text-black py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-lg active:scale-[0.98]">
                            Ir al Pago <ArrowRight className="h-5 w-5" />
                        </Link>

                        <div className="flex items-center justify-center gap-4 pt-2 opacity-50 grayscale transition-all hover:grayscale-0">
                            <img src="/icons/visa.svg" alt="Visa" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
                            <span className="text-[10px] text-gray-500">Pagos Seguros</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
