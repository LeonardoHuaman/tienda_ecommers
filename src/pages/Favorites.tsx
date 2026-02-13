import { useFavorites } from '@/context/FavoritesContext';
import { ShoppingCart, Heart, ArrowLeft, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

const Favorites = () => {
    const { favorites, removeFromFavorites } = useFavorites();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 min-h-[70vh]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Mis Favoritos</h1>
                    <p className="text-muted-foreground">Guarda los productos que más te gustan para comprarlos después.</p>
                </div>
                <button
                    onClick={() => navigate('/catalog')}
                    className="flex items-center gap-2 text-sm font-bold hover:text-accent transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Seguir comprando
                </button>
            </div>

            {favorites.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
                    <Heart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Tu lista de favoritos está vacía</h2>
                    <p className="text-muted-foreground mb-8">¡Explora nuestro catálogo y guarda tus productos favoritos!</p>
                    <Link
                        to="/catalog"
                        className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-black/90 transition-all inline-block"
                    >
                        Ver Catálogo
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {favorites.map((product) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-2xl border overflow-hidden group hover:shadow-xl transition-all duration-300"
                            >
                                <div className="relative aspect-square">
                                    <Link to={`/product/${product.id}`}>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </Link>
                                    <button
                                        onClick={() => removeFromFavorites(product.id)}
                                        className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title="Eliminar de favoritos"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{product.brand}</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-bold text-gray-900 border px-2 py-0.5 rounded">S/ {product.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg mb-4 line-clamp-1">{product.name}</h3>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/product/${product.id}`}
                                            className="flex-1 bg-gray-100 text-center py-2.5 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
                                        >
                                            Ver Detalle
                                        </Link>
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="bg-black text-white p-2.5 rounded-lg hover:bg-black/90 transition-all shadow-sm"
                                            title="Agregar al carrito"
                                        >
                                            <ShoppingCart className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Favorites;
