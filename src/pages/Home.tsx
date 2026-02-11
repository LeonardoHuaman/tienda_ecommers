import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import type { Product } from "@/types/product";

const Home = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .limit(6);

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
        <main className="w-screen overflow-x-hidden">
            {/* ================= HERO SECTION ================= */}
            <section id="hero" className="relative min-h-screen w-screen flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2087&auto=format&fit=crop"
                        alt="Hero Beauty"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="relative z-10 px-8 md:px-20 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="text-white"
                    >
                        <h2 className="text-sm font-bold uppercase tracking-[0.35em] text-accent mb-6">
                            Colección Premium
                        </h2>
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
                            Resalta tu <br /> belleza natural
                        </h1>
                        <p className="text-lg md:text-xl mb-10 text-gray-200">
                            Descubre lo mejor de Esika, Unique, Avon y Natura en un
                            solo lugar. Calidad profesional para tu rutina diaria.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/catalog"
                                className="bg-white text-black px-10 py-4 rounded-md font-bold hover:bg-gray-100 transition-all flex items-center gap-2"
                            >
                                Ver Catálogo <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                to="/catalog"
                                className="border-2 border-white text-white px-10 py-4 rounded-md font-bold hover:bg-white/10 transition-all"
                            >
                                Ver Marcas
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ================= FEATURED PRODUCTS ================= */}
            <section id="productos" className="w-screen py-28 bg-background">
                <div className="px-8 md:px-20">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16"
                    >
                        <div>
                            <h3 className="text-sm font-bold text-accent uppercase tracking-[0.3em] mb-3">
                                Selección Especial
                            </h3>
                            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
                                Productos que <br className="hidden md:block" /> marcan la diferencia
                            </h2>
                            <p className="mt-4 text-muted-foreground max-w-md">
                                Los favoritos de nuestras clientas, elegidos por calidad,
                                tendencia y resultados reales.
                            </p>
                        </div>

                        <Link
                            to="/catalog"
                            className="inline-flex items-center gap-2 font-bold text-sm border-b-2 border-black pb-1 hover:text-accent hover:border-accent transition-all w-fit"
                        >
                            Ver catálogo completo <ArrowRight className="h-4 w-4" />
                        </Link>
                    </motion.div>

                    {/* Products Grid – COMPACT DESKTOP */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-accent" />
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {products.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: index * 0.03 }}
                                >
                                    <Link to={`/product/${product.id}`}>
                                        <div className="group bg-white rounded-lg overflow-hidden border hover:shadow-md transition-all">
                                            {/* Image */}
                                            <div className="relative aspect-square overflow-hidden bg-gray-50">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />

                                                {/* Badges */}
                                                <div className="absolute top-2 left-2 flex gap-1">
                                                    {product.is_new && (
                                                        <span className="bg-black text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                                                            Nuevo
                                                        </span>
                                                    )}
                                                    {product.is_offer && (
                                                        <span className="bg-accent text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                                                            Oferta
                                                        </span>
                                                    )}
                                                </div>
                                            </div>


                                            {/* Info */}
                                            <div className="p-3">
                                                <span className="text-[9px] text-muted-foreground uppercase block mb-1">
                                                    {product.brand}
                                                </span>

                                                <h4 className="text-xs font-medium leading-snug line-clamp-2 mb-1">
                                                    {product.name}
                                                </h4>

                                                {/* Price */}
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-sm">
                                                        S/ {product.price.toFixed(2)}
                                                    </span>
                                                    {product.original_price && (
                                                        <span className="text-[10px] text-muted-foreground line-through">
                                                            S/ {product.original_price.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground">
                            No se encontraron productos destacados.
                        </div>
                    )}


                </div>
            </section>

            {/* ================= BRANDS MARQUEE ================= */}
            <section id="marcas" className="w-screen py-24 bg-primary-foreground overflow-hidden">
                <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 px-8">
                    Las Mejores Marcas en un solo lugar
                </h2>

                <motion.div
                    className="flex gap-24 items-center w-max"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 30, ease: "linear", repeat: Infinity }}
                >
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex gap-24 px-16">
                            {["esika", "unique", "avon", "natura", "cyzone", "yanbal"].map(
                                (brand) => (
                                    <img
                                        key={brand}
                                        src={`/${brand}.png`}
                                        alt={brand}
                                        className="h-16 transition"
                                    />
                                )
                            )}
                        </div>
                    ))}
                </motion.div>
            </section>
        </main>
    );
};

export default Home;
