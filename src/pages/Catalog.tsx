import { useState, useEffect, useMemo } from 'react';
import { Star, ShoppingCart, Filter, Heart, Search, X, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import type { Product } from '@/types/product';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getProductImage } from '@/lib/utils';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const PRICE_RANGES = [
    { label: 'Todos', min: 0, max: 999999 },
    { label: 'S/ 0 - S/ 25', min: 0, max: 25 },
    { label: 'S/ 25 - S/ 50', min: 25, max: 50 },
    { label: 'S/ 50 - S/ 100', min: 50, max: 100 },
    { label: 'S/ 100 - S/ 200', min: 100, max: 200 },
    { label: 'S/ 200+', min: 200, max: 999999 },
];

const ITEMS_PER_PAGE = 20;

// Inner Sidebar Component to keep search focus (outside the main functional component)
const FilterSidebarContent = ({
    searchQuery,
    setSearchQuery,
    brands,
    selectedBrand,
    setSelectedBrand,
    activePriceRange,
    setActivePriceRange,
    clearFilters
}: any) => (
    <div className="space-y-10">
        {/* Search */}
        <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Buscar</h4>
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                <input
                    type="text"
                    placeholder="Labial, Natura..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-black rounded-xl outline-none transition-all text-sm"
                />
            </div>
        </div>

        {/* Brands */}
        <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Marcas</h4>
            <div className="flex flex-col gap-1">
                {brands.map((brand: string) => (
                    <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${selectedBrand === brand ? 'bg-black text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        {brand === 'all' ? 'Todas las Marcas' : brand}
                    </button>
                ))}
            </div>
        </div>

        {/* Price Ranges */}
        <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Precio</h4>
            <div className="flex flex-col gap-1">
                {PRICE_RANGES.map((range, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActivePriceRange(idx)}
                        className={`text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activePriceRange === idx ? 'bg-black text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        {range.label}
                    </button>
                ))}
            </div>
        </div>

        <button
            onClick={clearFilters}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-xs font-bold hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
        >
            <X className="h-3 w-3" /> Limpiar Filtros
        </button>
    </div>
);

const Catalog = () => {
    const { addToCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrand, setSelectedBrand] = useState<string>('all');
    const [activePriceRange, setActivePriceRange] = useState(0); // Index of PRICE_RANGES
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

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

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedBrand, activePriceRange, sortBy]);

    const brands = useMemo(() => {
        const unique = new Set(products.map(p => p.brand).filter(Boolean));
        return ['all', ...Array.from(unique)];
    }, [products]);

    const filteredProducts = useMemo(() => {
        let result = [...products];
        if (searchQuery) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.brand.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (selectedBrand !== 'all') {
            result = result.filter(p => p.brand === selectedBrand);
        }
        const range = PRICE_RANGES[activePriceRange];
        result = result.filter(p => p.price >= range.min && p.price <= range.max);

        switch (sortBy) {
            case 'price-asc': result.sort((a, b) => a.price - b.price); break;
            case 'price-desc': result.sort((a, b) => b.price - a.price); break;
            case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
            case 'newest': default:
                result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
                break;
        }
        return result;
    }, [products, searchQuery, selectedBrand, activePriceRange, sortBy]);

    // Paginated products
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault(); e.stopPropagation();
        addToCart(product, 1);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedBrand('all');
        setActivePriceRange(0);
        setSortBy('newest');
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const sidebarProps = {
        searchQuery,
        setSearchQuery,
        brands,
        selectedBrand,
        setSelectedBrand,
        activePriceRange,
        setActivePriceRange,
        clearFilters
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12">
                {/* Mobile Filter Trigger */}
                <div className="lg:hidden flex justify-between items-center mb-8 sticky top-20 z-30 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <button
                        onClick={() => setShowMobileFilters(true)}
                        className="flex items-center gap-2 font-bold text-sm bg-black text-white px-6 py-3 rounded-xl"
                    >
                        <SlidersHorizontal className="h-4 w-4" /> Filtros
                    </button>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {filteredProducts.length} Resultados
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-72 shrink-0 sticky top-32 h-fit">
                        <div className="mb-12">
                            <h1 className="text-4xl font-black mb-2 tracking-tighter">Catálogo</h1>
                            <p className="text-sm text-muted-foreground font-medium">Encuentra tu estilo ideal</p>
                        </div>
                        <FilterSidebarContent {...sidebarProps} />
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1">
                        {/* Desktop Toolbar */}
                        <div className="hidden lg:flex items-center justify-between mb-12">
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">
                                Mostrando {filteredProducts.length} productos
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Ordenar por:</span>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                                        className="appearance-none bg-gray-50 border-2 border-transparent focus:border-black rounded-xl px-5 py-2.5 pr-10 font-bold text-sm outline-none cursor-pointer transition-all"
                                    >
                                        <option value="newest">Novedades</option>
                                        <option value="price-asc">Menor Precio</option>
                                        <option value="price-desc">Mayor Precio</option>
                                        <option value="name-asc">Nombre A-Z</option>
                                        <option value="name-desc">Nombre Z-A</option>
                                    </select>
                                    <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-40 gap-4">
                                <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                <p className="font-bold text-gray-300 uppercase tracking-[0.3em] text-[10px]">Cargando...</p>
                            </div>
                        ) : paginatedProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                                    {paginatedProducts.map((product) => (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="group flex flex-col h-full"
                                        >
                                            <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                                                <img
                                                    src={getProductImage(product)}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />

                                                <div className="absolute top-6 left-6 flex flex-col gap-2">
                                                    {product.is_new && <span className="bg-white/90 backdrop-blur-md text-black text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">New In</span>}
                                                    {product.is_offer && <span className="bg-accent text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">Off</span>}
                                                </div>

                                                <button
                                                    onClick={(e) => handleAddToCart(e, product)}
                                                    className="absolute bottom-6 right-6 bg-black text-white p-4 rounded-2xl shadow-xl translate-y-20 group-hover:translate-y-0 transition-all duration-500 hover:bg-accent hover:scale-110 z-10"
                                                >
                                                    <ShoppingCart className="h-5 w-5" />
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault(); e.stopPropagation();
                                                        toggleFavorite(product);
                                                    }}
                                                    className={`absolute top-6 right-6 p-3 rounded-2xl shadow-sm transition-all duration-500 ${isFavorite(product.id)
                                                        ? 'bg-red-500 text-white scale-110'
                                                        : 'bg-white/90 backdrop-blur-md text-gray-600 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100'
                                                        }`}
                                                >
                                                    <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                                                </button>
                                            </Link>

                                            <div className="pt-6 px-2">
                                                <span className="text-[10px] text-accent font-black uppercase tracking-widest mb-2 block">{product.brand}</span>
                                                <Link to={`/product/${product.id}`} className="font-bold text-gray-900 line-clamp-1 group-hover:text-accent transition-colors">
                                                    {product.name}
                                                </Link>
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-black text-lg">S/ {product.price.toFixed(2)}</span>
                                                        {product.original_price && product.original_price > product.price && (
                                                            <span className="text-xs text-gray-400 line-through">S/ {product.original_price.toFixed(2)}</span>
                                                        )}
                                                    </div>
                                                    {product.rating > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-accent text-accent" />
                                                            <span className="text-xs font-black">{product.rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Pagination UI */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-20">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="p-3 rounded-xl border border-gray-100 hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {[...Array(totalPages)].map((_, i) => {
                                                const page = i + 1;
                                                // Only show current, first, last, and neighbors
                                                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => handlePageChange(page)}
                                                            className={`w-12 h-12 rounded-xl text-sm font-black transition-all ${currentPage === page ? 'bg-black text-white shadow-xl scale-110' : 'hover:bg-gray-100 text-gray-400'}`}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                } else if (page === currentPage - 2 || page === currentPage + 2) {
                                                    return <span key={page} className="px-1 text-gray-300">...</span>;
                                                }
                                                return null;
                                            })}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="p-3 rounded-xl border border-gray-100 hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-40">
                                <Filter className="h-12 w-12 text-gray-200 mx-auto mb-6" />
                                <h3 className="text-xl font-bold mb-2">No se encontraron productos</h3>
                                <p className="text-gray-400 mb-8 max-w-xs mx-auto">Intenta ajustar los filtros para encontrar lo que buscas.</p>
                                <button onClick={clearFilters} className="bg-black text-white px-8 py-4 rounded-2xl font-bold">Ver Todo</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filters Drawer */}
            <AnimatePresence>
                {showMobileFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMobileFilters(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-[101] shadow-2xl p-8 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <h2 className="text-2xl font-black tracking-tighter">Filtros</h2>
                                <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <FilterSidebarContent {...sidebarProps} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Catalog;
