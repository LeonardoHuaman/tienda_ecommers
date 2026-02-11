import { CreditCard, Truck, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Checkout = () => {
    const [step, setStep] = useState(1);
    const [isFinished, setIsFinished] = useState(false);

    if (isFinished) {
        return (
            <div className="container px-4 py-20 text-center flex flex-col items-center gap-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-green-100 p-6 rounded-full"
                >
                    <CheckCircle2 className="h-20 w-20 text-green-600" />
                </motion.div>
                <h1 className="text-4xl font-bold">¡Pedido Confirmado!</h1>
                <p className="text-muted-foreground text-lg max-w-md">
                    Gracias por tu compra. Hemos enviado los detalles de tu pedido a tu correo electrónico.
                </p>
                <Link to="/" className="mt-8 bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-black/90 transition-all">
                    Volver a la tienda
                </Link>
            </div>
        );
    }

    return (
        <div className="container px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-3xl font-bold">Checkout</h1>
                    <div className="flex items-center gap-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200'}`}>1</div>
                        <div className="h-[2px] w-8 bg-gray-200" />
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200'}`}>2</div>
                        <div className="h-[2px] w-8 bg-gray-200" />
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-black text-white' : 'bg-gray-200'}`}>3</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
                                <h3 className="text-xl font-bold flex items-center gap-2"><Truck className="h-5 w-5" /> Información de Envío</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input placeholder="Nombre" className="p-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none" />
                                    <input placeholder="Apellido" className="p-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none" />
                                    <input placeholder="Dirección" className="p-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none md:col-span-2" />
                                    <input placeholder="Ciudad" className="p-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none" />
                                    <input placeholder="Teléfono" className="p-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none" />
                                </div>
                                <button onClick={() => setStep(2)} className="bg-black text-white py-4 rounded-xl font-bold mt-4">Continuar al Pago</button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
                                <button onClick={() => setStep(1)} className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Volver a Envío</button>
                                <h3 className="text-xl font-bold flex items-center gap-2"><CreditCard className="h-5 w-5" /> Método de Pago</h3>
                                <div className="flex flex-col gap-4">
                                    <div className="border-2 border-black p-4 rounded-xl flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <CreditCard className="h-6 w-6" />
                                            <div>
                                                <p className="font-bold">Tarjeta de Crédito / Débito</p>
                                                <p className="text-xs text-muted-foreground">Visa, Mastercard, AMEX</p>
                                            </div>
                                        </div>
                                        <div className="h-4 w-4 border-4 border-black rounded-full" />
                                    </div>
                                    <div className="border border-gray-200 p-4 rounded-xl flex items-center justify-between cursor-not-allowed opacity-50">
                                        <div className="flex items-center gap-4">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PP" className="h-4 w-6" />
                                            <div>
                                                <p className="font-bold">PayPal</p>
                                                <p className="text-xs text-muted-foreground">Próximamente</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsFinished(true)} className="bg-black text-white py-4 rounded-xl font-bold mt-4 flex items-center justify-center gap-2">
                                    Finalizar Pedido <ShieldCheck className="h-5 w-5" />
                                </button>
                            </motion.div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-8 rounded-2xl h-fit border">
                        <h3 className="text-lg font-bold mb-6">Tu Pedido</h3>
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-bold">S/ 155.90</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Envío</span>
                                <span className="text-green-600 font-bold">Gratis</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end border-t pt-4">
                            <span className="font-bold">Total</span>
                            <span className="text-2xl font-bold">S/ 155.90</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
