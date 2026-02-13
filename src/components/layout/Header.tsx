import { ShoppingCart, User, Menu, Heart, LogOut, Package, UserCircle, MapPin, Settings, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
    const { user, role, signOut } = useAuth();
    const { itemCount } = useCart();
    const { favoriteCount } = useFavorites();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Bloquear scroll cuando el menú móvil está abierto
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    const handleSignOut = async () => {
        await signOut();
        setShowUserMenu(false);
    };

    return (
        <header className="sticky top-0 z-[100] w-full border-b bg-primary">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 lg:hidden text-white"
                        aria-label="Menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <Link to="/" className="text-2xl font-bold tracking-tighter text-primary-foreground">
                        <img src="/images/logo.png" className="w-13 h-13 rounded-full hover:scale-110 transition-all duration-300 ease-in-out cursor-pointer" title="logo" alt="logo" />
                    </Link>
                </div>

                <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
                    <Link to="/#hero" className="transition-colors text-white hover:text-accent font-bold">Inicio</Link>
                    <Link to="/#productos" className="transition-colors text-white hover:text-accent font-bold">Productos</Link>
                    <Link to="/#marcas" className="transition-colors text-white hover:text-accent font-bold">Marcas</Link>
                    <Link to="/catalog" className="transition-colors text-white hover:text-accent font-bold">Catálogo</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link to="/favorites" className="p-2 transition-colors hover:text-accent relative text-white">
                        <Heart className="h-5 w-5" />
                        {favoriteCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-white font-bold">
                                {favoriteCount}
                            </span>
                        )}
                    </Link>
                    <Link to="/cart" className="p-2 transition-colors hover:text-accent relative text-white">
                        <ShoppingCart className="h-5 w-5" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-white font-bold">
                                {itemCount}
                            </span>
                        )}
                    </Link>

                    {/* User Menu */}
                    <div className="relative" ref={menuRef}>
                        {user ? (
                            <>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="p-2 transition-colors hover:text-accent text-white"
                                >
                                    <User className="h-5 w-5" />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs text-gray-500 font-medium">Sesión iniciada como</p>
                                            <p className="text-sm font-black truncate text-gray-900">{user.email}</p>
                                            <p className="text-[10px] text-accent uppercase font-black mt-1 tracking-widest">{role}</p>
                                        </div>

                                        <div className="py-1">
                                            {role === 'admin' ? (
                                                <Link
                                                    to="/admin"
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Settings className="h-4 w-4" />
                                                    Panel de Administrador
                                                </Link>
                                            ) : (
                                                <div className="grid">
                                                    <Link
                                                        to="/orders"
                                                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <Package className="h-4 w-4" />
                                                        Mis Pedidos
                                                    </Link>
                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <UserCircle className="h-4 w-4" />
                                                        Mis Datos Personales
                                                    </Link>
                                                    <Link
                                                        to="/address"
                                                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <MapPin className="h-4 w-4" />
                                                        Mi Dirección
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-gray-100 mt-1 pt-1">
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 w-full transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link to="/login" className="p-2 transition-colors hover:text-accent text-white">
                                <User className="h-5 w-5" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm lg:hidden"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ y: '-100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                            className="fixed top-0 left-0 right-0 z-[1000] bg-white lg:hidden border-b border-gray-100 shadow-2xl overflow-hidden"
                        >
                            <div className="flex flex-col">
                                {/* Header del Drawer */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-50">
                                    <span className="font-black tracking-[0.2em] text-xs text-gray-400 uppercase">Navegación</span>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-black hover:text-white transition-all"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Opciones de Navegación */}
                                <div className="p-4 grid grid-cols-1 divide-y divide-gray-50">
                                    <Link
                                        to="/"
                                        className="flex items-center justify-between p-5 hover:bg-gray-50 transition-all group"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className="text-xl font-black text-gray-900 group-hover:text-accent">INICIO</span>
                                        <ArrowRight className="h-5 w-5 text-gray-200 group-hover:text-accent transition-all" />
                                    </Link>
                                    <Link
                                        to="/#productos"
                                        className="flex items-center justify-between p-5 hover:bg-gray-50 transition-all group"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className="text-xl font-black text-gray-900 group-hover:text-accent">PRODUCTOS</span>
                                        <ArrowRight className="h-5 w-5 text-gray-200 group-hover:text-accent transition-all" />
                                    </Link>
                                    <Link
                                        to="/#marcas"
                                        className="flex items-center justify-between p-5 hover:bg-gray-50 transition-all group"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className="text-xl font-black text-gray-900 group-hover:text-accent">MARCAS</span>
                                        <ArrowRight className="h-5 w-5 text-gray-200 group-hover:text-accent transition-all" />
                                    </Link>
                                    <Link
                                        to="/catalog"
                                        className="flex items-center justify-between p-5 hover:bg-gray-50 transition-all group"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className="text-xl font-black text-gray-900 group-hover:text-accent">CATÁLOGO</span>
                                        <ArrowRight className="h-5 w-5 text-gray-200 group-hover:text-accent transition-all" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
