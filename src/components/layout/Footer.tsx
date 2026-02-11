
const Footer = () => {
    return (
        <footer className="border-t bg-primary/50 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <h3 className="mb-4 text-lg font-bold">RC Beauty</h3>
                        <p className="text-sm text-muted-foreground">
                            Tu destino premium para productos de catálogo de las mejores marcas: Esika, Unique, Avon y Natura.
                        </p>
                    </div>
                    <div>
                        <h4 className="mb-4 font-bold">Enlaces Rápidos</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="/catalog" className="hover:text-accent transition-colors">Catálogo Completo</a></li>
                            <li><a href="/offers" className="hover:text-accent transition-colors">Ofertas Especiales</a></li>
                            <li><a href="/brands" className="hover:text-accent transition-colors">Nuestras Marcas</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 font-bold">Soporte</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="/faq" className="hover:text-accent transition-colors">Preguntas Frecuentes</a></li>
                            <li><a href="/contact" className="hover:text-accent transition-colors">Contacto</a></li>
                            <li><a href="/shipping" className="hover:text-accent transition-colors">Envíos y Devoluciones</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 font-bold">Suscríbete</h4>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Tu email"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                            <button className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:bg-foreground/90 transition-colors">
                                Unirse
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} RC Beauty Store. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
