import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-black text-white pt-24 pb-12 overflow-hidden border-t border-white/5">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-24 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <div>
                            <Link to="/" onClick={scrollToTop} className="inline-block group">
                                <div className="flex items-center gap-3">
                                    <img src="/images/logo.png" className="w-12 h-12 rounded-full border-2 border-accent shadow-lg group-hover:scale-110 transition-transform duration-500" alt="RC Beauty Logo" />
                                    <span className="text-2xl font-black tracking-tighter">RC BEAUTY</span>
                                </div>
                            </Link>
                            <p className="mt-6 text-gray-400 text-sm leading-relaxed max-w-xs">
                                Elevando tu rutina de belleza con la curaduría más exclusiva de Esika, Unique, Avon y Natura. Calidad premium al alcance de un clic.
                            </p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-8">Navegación</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href="/#hero" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group text-sm font-medium">
                                    Inicio <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" />
                                </a>
                            </li>
                            <li>
                                <a href="/#productos" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group text-sm font-medium">
                                    Productos <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" />
                                </a>
                            </li>
                            <li>
                                <a href="/#marcas" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group text-sm font-medium">
                                    Marcas <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" />
                                </a>
                            </li>
                            <li>
                                <Link to="/catalog" onClick={scrollToTop} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group text-sm font-medium">
                                    Catálogo Completo <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" />
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-8">Venta Directa</h4>
                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 shrink-0">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">WhatsApp</p>
                                    <a href="https://wa.me/51988770738" target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:text-accent transition-colors">+51 988 770 738</a>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 shrink-0">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Email</p>
                                    <a href="mailto:casmaroxana@gmail.com" className="text-sm font-bold hover:text-accent transition-colors">casmaroxana@gmail.com</a>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 shrink-0">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Ubicación</p>
                                    <p className="text-sm font-bold text-gray-200">Lima, Perú</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/5 text-center md:text-left">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        © {currentYear} <span className="text-white">RC BEAUTY STORE</span>. DISEÑADO PARA LA EXCLUSIVIDAD.
                    </p>
                    <div className="flex items-center gap-6">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 opacity-50 grayscale hover:grayscale-0 transition-all cursor-crosshair" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 opacity-50 grayscale hover:grayscale-0 transition-all cursor-crosshair" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-crosshair" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
