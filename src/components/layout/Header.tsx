import { ShoppingCart, User, Search, Menu, Heart, LogOut, Package, UserCircle, MapPin, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';


const Header = () => {
    const { user, role, signOut } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
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

    const handleSignOut = async () => {
        await signOut();
        setShowUserMenu(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-primary/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Menu className="h-6 w-6 lg:hidden text-white" />
                    <Link to="/" className="text-2xl font-bold tracking-tighter text-primary-foreground"><img src="/images/logo.png" className="w-13 h-13 rounded-full hover:scale-110 transition-all duration-300 ease-in-out cursor-pointer" title="logo" alt="logo" /></Link>
                </div>

                <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
                    <Link to="/#hero" className="transition-colors text-white hover:text-accent">Inicio</Link>
                    <Link to="/#productos" className="transition-colors text-white hover:text-accent">Productos</Link>
                    <Link to="/#marcas" className="transition-colors text-white hover:text-accent">Marcas</Link>
                    <Link to="/catalog" className="transition-colors text-white hover:text-accent">Catálogo</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <div className="relative hidden sm:block">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white" />
                        <input
                            type="search"
                            placeholder="Buscar productos..."
                            className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>
                    <button className="p-2 transition-colors hover:text-accent text-white">
                        <Heart className="h-5 w-5" />
                    </button>
                    <Link to="/cart" className="p-2 transition-colors hover:text-accent relative text-white">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-white">2</span>
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
                                            <p className="text-xs text-gray-500">Sesión iniciada como</p>
                                            <p className="text-sm font-bold truncate">{user.email}</p>
                                            <p className="text-xs text-accent uppercase font-bold mt-1">{role}</p>
                                        </div>

                                        {role === 'admin' ? (
                                            <>
                                                <Link
                                                    to="/admin"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Settings className="h-4 w-4" />
                                                    Panel de Administrador
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    to="/orders"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Package className="h-4 w-4" />
                                                    Mis Pedidos
                                                </Link>
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <UserCircle className="h-4 w-4" />
                                                    Mis Datos Personales
                                                </Link>
                                                <Link
                                                    to="/address"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <MapPin className="h-4 w-4" />
                                                    Mi Dirección
                                                </Link>
                                            </>
                                        )}

                                        <div className="border-t border-gray-100 mt-2 pt-2">
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-red-50 text-red-600 w-full transition-colors"
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
        </header>
    );
};

export default Header;
