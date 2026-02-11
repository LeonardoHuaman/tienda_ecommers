import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Filter, LayoutGrid, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import type { Product } from '@/types/product';
import { Link } from 'react-router-dom';

const Catalog = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) setProducts(data as Product[]);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    return (
        <div className="container px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Catálogo de Productos</h1>
                    <p className="text-muted-foreground">Explora nuestra selección completa de belleza profesional.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 border px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                        <Filter className="h-4 w-4" /> Filtros
                    </button>
                    <button className="flex items-center gap-2 border px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                        <LayoutGrid className="h-4 w-4" /> Ordenar
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-accent" />
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="group bg-white rounded-[10px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <Link to={`/product/${product.id}`}>
                                <div className="relative aspect-square overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <button className="absolute bottom-4 right-4 bg-black text-white p-3 rounded-full shadow-lg translate-y-12 group-hover:translate-y-0 transition-all duration-300">
                                        <ShoppingCart className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 block">{product.brand}</span>
                                    <h4 className="font-bold text-lg mb-2 truncate">{product.name}</h4>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="font-bold text-xl">S/ {product.price.toFixed(2)}</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-accent text-accent" />
                                            <span className="text-xs font-medium">{product.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-muted-foreground">
                    No hay productos disponibles en el catálogo.
                </div>
            )}
        </div>
    );
};

export default Catalog;
