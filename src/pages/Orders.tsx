import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Loader2, MapPin, Star, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { getProductImage } from '@/lib/utils';

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    product: {
        name: string;
        image: any;
        images?: any;
    };
}

interface Order {
    id: string;
    total_amount: number;
    status: string;
    shipping_address: string;
    created_at: string;
    items: OrderItem[];
}

interface Review {
    product_id: string;
    rating: number;
}

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [userReviews, setUserReviews] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
            fetchUserReviews();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    items:order_items (
                        id,
                        product_id,
                        quantity,
                        price_at_purchase,
                        product:products (name, image, images)
                    )
                `)
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserReviews = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('product_id, rating')
                .eq('user_id', user.id);

            if (data && !error) {
                const reviewsMap: Record<string, number> = {};
                data.forEach((r: Review) => {
                    reviewsMap[r.product_id] = r.rating;
                });
                setUserReviews(reviewsMap);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    };

    const handleRate = async (productId: string, rating: number) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('reviews')
                .upsert({
                    user_id: user.id,
                    product_id: productId,
                    rating
                }, { onConflict: 'user_id,product_id' });

            if (error) throw error;

            setUserReviews(prev => ({ ...prev, [productId]: rating }));
        } catch (err) {
            console.error('Error saving review:', err);
            alert('No se pudo guardar la calificación. Asegúrate de haber recibido el producto.');
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status: string) => {
        const texts: Record<string, string> = {
            pending: 'Pendiente',
            processing: 'Procesando',
            shipped: 'Enviado',
            delivered: 'Entregado',
            cancelled: 'Cancelado',
        };
        return texts[status] || status;
    };

    const formatAddress = (addressJson: string) => {
        try {
            const address = JSON.parse(addressJson);
            if (typeof address === 'object' && address !== null) {
                const part1 = address.address || '';
                const part2 = address.district || '';
                const part3 = address.city || '';
                return [part1, part2, part3].filter(Boolean).join(', ');
            }
            return addressJson;
        } catch (e) {
            return addressJson;
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Mis Pedidos</h1>
                    <p className="text-muted-foreground">Revisa el estado de tus compras y califica tus productos</p>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold mb-2">No tienes pedidos aún</h3>
                        <p className="text-muted-foreground mb-6">Explora nuestro catálogo y realiza tu primera compra</p>
                        <a href="/catalog" className="inline-block bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-black/90 transition-all">
                            Ver Catálogo
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                            >
                                {/* Order Header */}
                                <div className="p-6 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gray-50 rounded-xl">
                                            <Package className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pedido #{order.id.slice(0, 8)}</p>
                                            <p className="text-sm font-medium">
                                                {new Date(order.created_at).toLocaleDateString('es-PE', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Total</p>
                                            <p className="text-xl font-bold">S/ {order.total_amount.toFixed(2)}</p>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6 bg-gray-50/30">
                                    <div className="space-y-4">
                                        {order.items?.map((item) => (
                                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                                                        <img src={getProductImage(item.product)} alt={item.product?.name} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm leading-tight mb-1">{item.product?.name}</h4>
                                                        <p className="text-xs text-muted-foreground">Cantidad: {item.quantity} • S/ {item.price_at_purchase.toFixed(2)} c/u</p>
                                                    </div>
                                                </div>

                                                {/* Rating Section */}
                                                {order.status === 'delivered' && (
                                                    <div className="flex flex-col items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                                                        {userReviews[item.product_id] ? (
                                                            <div className="flex items-center gap-2 text-accent">
                                                                <div className="flex">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`h-4 w-4 ${i < userReviews[item.product_id] ? 'fill-accent' : 'text-gray-200'}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span className="text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1">
                                                                    Calificado <CheckCircle2 className="h-3 w-3" />
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-end gap-1">
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase">¿Qué te pareció?</p>
                                                                <div className="flex gap-1">
                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                        <button
                                                                            key={star}
                                                                            onClick={() => handleRate(item.product_id, star)}
                                                                            className="hover:scale-125 transition-transform"
                                                                        >
                                                                            <Star className="h-5 w-5 text-gray-200 hover:text-accent hover:fill-accent transition-colors" />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping Info */}
                                <div className="px-6 py-4 bg-white border-t border-gray-50 flex items-center gap-2 text-[11px] text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>Envío a: <strong>{formatAddress(order.shipping_address)}</strong></span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Orders;

