import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ArrowLeft, Truck, ShieldCheck, RefreshCcw, Loader2, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import type { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getProductImage } from '@/lib/utils';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | undefined>('');

    useEffect(() => {
        if (product) {
            setSelectedImage(getProductImage(product));
        }
    }, [product]);

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

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        }
    };

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
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 lg:py-20">
            <button
                onClick={() => navigate(-1)}
                className="group inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black mb-12 transition-colors uppercase tracking-[0.2em]"
            >
                <div className="p-2 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-all">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                Volver al catálogo
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                {/* Product Image Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-6"
                >
                    <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-2xl group">
                        <img
                            src={selectedImage || getProductImage(product)}
                            alt={product.name}
                            className="w-full h-full object-cover transition-all duration-700 hover:scale-110"
                        />

                        {product.is_new && (
                            <span className="absolute top-8 left-8 bg-black text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">New In</span>
                        )}
                    </div>

                    {/* Thumbnail Gallery */}
                    {(() => {
                        const allImages = Array.from(new Set([product.image, ...(Array.isArray(product.images) ? product.images : [])])).filter(Boolean);
                        if (allImages.length <= 1) return null;

                        return (
                            <div className="flex gap-4 overflow-x-auto py-4 scrollbar-hide px-2">
                                {allImages.map((img: any, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`relative h-24 w-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all duration-300 shadow-sm ${selectedImage === img ? 'border-black scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                                            }`}
                                    >
                                        <img src={img} className="h-full w-full object-cover" alt={`${product.name} ${idx}`} />
                                    </button>
                                ))}
                            </div>
                        );
                    })()}
                </motion.div>

                {/* Product Info Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col"
                >
                    <div className="mb-8">
                        <span className="inline-block text-xs font-black text-accent uppercase tracking-[0.3em] mb-4 bg-accent/5 px-4 py-1.5 rounded-full border border-accent/10">{product.brand}</span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tighter leading-[1.1] text-gray-900">{product.name}</h1>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <span className="font-black text-sm">{product.rating}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">{product.reviews || 0} Valoraciones</span>
                        </div>
                    </div>

                    <div className="flex items-baseline gap-6 mb-4">
                        <span className="text-5xl font-black tracking-tighter">S/ {product.price.toFixed(2)}</span>
                        {product.original_price && product.original_price > product.price && (
                            <div className="flex flex-col">
                                <span className="text-xl text-gray-300 line-through font-bold">S/ {product.original_price.toFixed(2)}</span>
                                <span className="text-xs font-black text-accent uppercase tracking-widest">Ahorra {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%</span>
                            </div>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-10">
                        {product.stock && product.stock > 0 ? (
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${product.stock <= 5 ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${product.stock <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
                                    {product.stock <= 5 ? `¡Últimas ${product.stock} unidades!` : `${product.stock} unidades disponibles`}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Agotado temporalmente</span>
                            </div>
                        )}
                    </div>

                    <div className="prose prose-sm max-w-none mb-12">
                        <p className="text-gray-500 text-lg leading-relaxed font-medium">
                            {product.description || "Este producto es parte de nuestra colección exclusiva. Formulado con ingredientes premium para garantizar resultados profesionales y una experiencia de belleza excepcional."}
                        </p>
                    </div>

                    <div className="space-y-6 mb-16">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className={`flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-1.5 shadow-sm ${(product.stock || 0) <= 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-3.5 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-16 text-center font-black text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(prev => {
                                        if (product?.stock && prev < product.stock) return prev + 1;
                                        return prev;
                                    })}
                                    className="p-3.5 hover:bg-white hover:shadow-md rounded-xl transition-all disabled:opacity-30"
                                    disabled={product?.stock ? quantity >= product.stock : true}
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={added || (product.stock || 0) <= 0}
                                className={`flex-1 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-500 shadow-xl active:scale-95 ${added ? 'bg-green-500 shadow-green-200' : (product.stock || 0) <= 0 ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-black hover:bg-accent hover:shadow-accent/40'
                                    }`}
                            >
                                {added ? (
                                    <>Añadido con éxito <ShieldCheck className="h-5 w-5" /></>
                                ) : (product.stock || 0) <= 0 ? (
                                    <>Agotado</>
                                ) : (
                                    <><ShoppingCart className="h-5 w-5" /> Añadir al carrito</>
                                )}
                            </button>

                            <button
                                onClick={() => product && toggleFavorite(product)}
                                className={`p-5 border-2 rounded-2xl transition-all duration-500 active:scale-90 ${isFavorite(product.id)
                                    ? 'bg-red-50 text-red-500 border-red-500 shadow-lg shadow-red-100'
                                    : 'border-gray-100 text-gray-300 hover:border-red-500 hover:text-red-500 hover:shadow-lg'
                                    }`}
                            >
                                <Heart className={`h-6 w-6 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-gray-100">
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
                            <div className="p-3 bg-gray-50 rounded-2xl">
                                <Truck className="h-5 w-5 text-black" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Envío Express</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Lima y Provincias</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3 border-y sm:border-y-0 sm:border-x border-gray-50 py-6 sm:py-0 sm:px-8">
                            <div className="p-3 bg-gray-50 rounded-2xl">
                                <ShieldCheck className="h-5 w-5 text-black" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Garantía Total</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Originalidad 100%</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
                            <div className="p-3 bg-gray-50 rounded-2xl">
                                <RefreshCcw className="h-5 w-5 text-black" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Devoluciones</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Fácil y Rápido</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProductDetail;
