import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ArrowLeft, Truck, ShieldCheck, RefreshCcw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import type { Product } from '@/types/product';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProduct() {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (data) setProduct(data as Product);
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
                <button onClick={() => navigate('/catalog')} className="text-accent hover:underline">
                    Ir al catálogo
                </button>
            </div>
        );
    }

    return (
        <div className="container px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-black mb-8 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Volver al catálogo
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product Image */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="aspect-square rounded-2xl overflow-hidden bg-white shadow-sm"
                >
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                {/* Product Info */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col"
                >
                    <span className="text-sm font-bold text-accent uppercase tracking-widest mb-2">{product.brand}</span>
                    <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-gray-300'}`} />
                            ))}
                            <span className="ml-2 font-medium">{product.rating}</span>
                        </div>
                        <span className="text-muted-foreground">|</span>
                        <span className="text-muted-foreground">{product.reviews} reseñas</span>
                    </div>

                    <div className="flex items-baseline gap-4 mb-8">
                        <span className="text-3xl font-bold">S/ {product.price.toFixed(2)}</span>
                        {product.original_price && (
                            <span className="text-xl text-muted-foreground line-through">S/ {product.original_price.toFixed(2)}</span>
                        )}
                        <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded">20% DCTO</span>
                    </div>

                    <p className="text-muted-foreground leading-relaxed mb-8">
                        {product.description} Este producto es parte de nuestra colección exclusiva. Formulado con ingredientes naturales para garantizar la mejor experiencia de belleza.
                    </p>

                    <div className="flex gap-4 mb-12">
                        <button className="flex-1 bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/90 transition-all">
                            <ShoppingCart className="h-5 w-5" /> Agregar al carrito
                        </button>
                        <button className="p-4 border border-input rounded-xl hover:bg-gray-50 transition-all text-muted-foreground hover:text-red-500">
                            <Heart className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-dashed">
                        <div className="flex flex-col items-center text-center gap-2">
                            <Truck className="h-6 w-6 text-accent" />
                            <span className="text-xs font-bold uppercase">Envío Gratis</span>
                            <span className="text-[10px] text-muted-foreground">En compras mayores a S/ 100</span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-2">
                            <ShieldCheck className="h-6 w-6 text-accent" />
                            <span className="text-xs font-bold uppercase">Pago Seguro</span>
                            <span className="text-[10px] text-muted-foreground">Stripe & MercadoPago</span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-2">
                            <RefreshCcw className="h-6 w-6 text-accent" />
                            <span className="text-xs font-bold uppercase">Garantía</span>
                            <span className="text-[10px] text-muted-foreground">30 días de satisfacción</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProductDetail;
