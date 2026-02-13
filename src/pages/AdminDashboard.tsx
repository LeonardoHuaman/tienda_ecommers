import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Users, BarChart3, Plus, Search, Eye, ChevronDown, ChevronUp, Edit, Trash2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import AddProductModal from '@/components/admin/AddProductModal';
import type { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { getProductImage } from '@/lib/utils';

interface OrderItem {
    id: string;
    product: {
        name: string;
        image: string;
    } | null;
    quantity: number;
    price_at_purchase: number;
}

interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shipping_address: string;
    user: {
        full_name: string;
        email: string;
    } | null;
    items?: OrderItem[];
}

const AdminDashboard = () => {
    const { refreshSettings } = useCart();
    const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('orders');
    const [shippingSettings, setShippingSettings] = useState({
        free_shipping_threshold: 100,
        shipping_cost: 5
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    *,
                    user:user_id (full_name, email),
                    items:order_items (
                        id,
                        quantity,
                        price_at_purchase,
                        product:product_id (name, image, images)
                    )
                `)
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;
            setOrders(ordersData || []);

            // Fetch Products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (productsError) throw productsError;
            setProducts(productsData || []);

            // Fetch Settings
            const { data: settingsData } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'shipping_config')
                .single();

            if (settingsData) {
                setShippingSettings(settingsData.value);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async () => {
        setIsSavingSettings(true);
        try {
            const { error } = await supabase
                .from('settings')
                .update({ value: shippingSettings })
                .eq('key', 'shipping_config');

            if (error) throw error;
            await refreshSettings();
            alert('Configuración actualizada correctamente');
        } catch (error) {
            console.error('Error updating settings:', error);
            alert('Error al actualizar la configuración');
        } finally {
            setIsSavingSettings(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (orderId: string, newStatus: Order['status']) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const toggleExpand = (orderId: string) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const handleOpenAddProduct = () => {
        setSelectedProduct(null);
        setIsProductModalOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setIsProductModalOpen(true);
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) throw error;

            // Refresh list locally to avoid full refetch
            setProducts(products.filter(p => p.id !== productId));
            alert('Producto eliminado correctamente');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Hubo un error al eliminar el producto.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
                    <p className="text-muted-foreground">Gestiona tus pedidos y productos.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleOpenAddProduct}
                        className="bg-black text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-black/90 transition-all"
                    >
                        <Plus className="h-4 w-4" /> Nuevo Producto
                    </button>
                    <button onClick={fetchData} className="bg-white border border-gray-200 text-black px-6 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition-all">
                        Refrescar
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Ventas Totales', value: `S/ ${orders.reduce((acc, order) => acc + order.total_amount, 0).toFixed(2)}`, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pedidos Totales', value: orders.length.toString(), icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Clientes Unicos', value: new Set(orders.map(o => o.user?.email)).size.toString(), icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Pendientes', value: orders.filter(o => o.status === 'pending').length.toString(), icon: Package, color: 'text-red-600', bg: 'bg-red-50' },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-white p-6 rounded-2xl border shadow-sm"
                    >
                        <div className={`p-3 w-fit rounded-lg ${stat.bg} ${stat.color} mb-4`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                        <h4 className="text-3xl font-bold">{stat.value}</h4>
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-8 border-b mb-8">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'orders' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Pedidos
                    {activeTab === 'orders' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'products' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Productos
                    {activeTab === 'products' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'settings' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Configuración
                    {activeTab === 'settings' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b flex items-center justify-between">
                    <h3 className="font-bold text-lg">
                        {activeTab === 'orders' ? 'Pedidos Recientes' : activeTab === 'products' ? 'Catálogo de Productos' : 'Configuración de la Tienda'}
                    </h3>
                    {activeTab !== 'settings' && (
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input placeholder={`Buscar ${activeTab === 'orders' ? 'pedido' : 'producto'}...`} className="pl-9 pr-4 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="p-12 text-center text-muted-foreground"><div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full mx-auto mb-2"></div>Cargando datos...</div>
                ) : activeTab === 'orders' ? (
                    // ORDERS TABLE
                    // ... (rest of orders table)
                    orders.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">No hay pedidos registrados.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs font-bold uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-4">ID Pedido</th>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4">Fecha</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4">Estado</th>
                                        <th className="px-6 py-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-sm">
                                    {orders.map((order) => (
                                        <div key={order.id} style={{ display: 'contents' }}>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium">{order.user?.full_name || 'Usuario desconocido'}</div>
                                                    <div className="text-xs text-muted-foreground">{order.user?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 font-bold">S/ {order.total_amount.toFixed(2)}</td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border-none focus:ring-0 cursor-pointer ${getStatusColor(order.status)}`}
                                                    >
                                                        <option value="pending">Pendiente</option>
                                                        <option value="processing">Procesando</option>
                                                        <option value="shipped">Enviado</option>
                                                        <option value="delivered">Entregado</option>
                                                        <option value="cancelled">Cancelado</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => toggleExpand(order.id)}
                                                        className="p-2 hover:bg-gray-200 rounded-md transition-colors text-muted-foreground flex items-center gap-1"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        {expandedOrder === order.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedOrder === order.id && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan={6} className="p-6">
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                                                        >
                                                            <div>
                                                                <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Productos</h4>
                                                                <div className="space-y-3">
                                                                    {order.items?.map((item) => (
                                                                        <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-lg border">
                                                                            <img src={getProductImage(item.product)} alt={item.product?.name} className="h-10 w-10 rounded-md object-cover" />
                                                                            <div className="flex-1">
                                                                                <p className="text-sm font-medium">{item.product?.name}</p>
                                                                                <p className="text-xs text-muted-foreground">Cant: {item.quantity}</p>
                                                                            </div>
                                                                            <p className="font-bold text-sm">S/ {item.price_at_purchase.toFixed(2)}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Detalles de Envío</h4>
                                                                <div className="bg-white p-4 rounded-lg border space-y-2 text-sm">
                                                                    {(() => {
                                                                        let addressData;
                                                                        try {
                                                                            addressData = JSON.parse(order.shipping_address);
                                                                        } catch (e) {
                                                                            addressData = { address: order.shipping_address };
                                                                        }
                                                                        return (
                                                                            <>
                                                                                <p className="flex justify-between"><span className="text-muted-foreground">Dirección:</span> <span className="font-medium text-right ml-4">{addressData.address}</span></p>
                                                                                {addressData.city && <p className="flex justify-between"><span className="text-muted-foreground">Ciudad:</span> <span className="font-medium text-right ml-4">{addressData.city}</span></p>}
                                                                                {addressData.phone && <p className="flex justify-between"><span className="text-muted-foreground">Teléfono:</span> <span className="font-medium text-right ml-4">{addressData.phone}</span></p>}
                                                                                {addressData.firstName && <p className="flex justify-between"><span className="text-muted-foreground">Recibe:</span> <span className="font-medium text-right ml-4">{addressData.firstName} {addressData.lastName}</span></p>}
                                                                            </>
                                                                        );
                                                                    })()}
                                                                    <div className="border-t pt-2 mt-2 flex justify-between">
                                                                        <span className="font-bold">Total Pagado:</span>
                                                                        <span className="font-bold text-lg">S/ {order.total_amount.toFixed(2)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </div>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : activeTab === 'products' ? (
                    // PRODUCTS TABLE
                    products.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">No hay productos registrados.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs font-bold uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-4">Producto</th>
                                        <th className="px-6 py-4">Marca</th>
                                        <th className="px-6 py-4">Precio</th>
                                        <th className="px-6 py-4">Stock</th>
                                        <th className="px-6 py-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-sm">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-gray-100 rounded-md overflow-hidden border">
                                                        <img src={getProductImage(product)} alt={product.name} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{product.name}</div>
                                                        <div className="text-xs text-muted-foreground">{product.is_new ? 'Nuevo' : ''} {product.is_offer ? '• Oferta' : ''}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{product.brand}</span>
                                            </td>
                                            <td className="px-6 py-4 font-bold">
                                                S/ {product.price.toFixed(2)}
                                                {product.original_price && <span className="block text-xs text-muted-foreground line-through font-normal">S/ {product.original_price.toFixed(2)}</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.stock} un.
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleEditProduct(product)}
                                                    className="p-2 hover:bg-black hover:text-white rounded-md transition-colors flex items-center gap-1 group"
                                                    title="Editar"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="p-2 hover:bg-red-600 hover:text-white rounded-md transition-colors flex items-center gap-1 group text-red-600 ml-2"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    // SETTINGS PANEL
                    <div className="p-8 max-w-2xl">
                        <div className="flex items-start gap-4 mb-8">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Settings className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xl mb-1">Costo de Envío y Delivery</h4>
                                <p className="text-muted-foreground text-sm">Configura el umbral para envío gratis y el costo fijo de delivery.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold block">Envío Gratis desde (S/ )</label>
                                    <input
                                        type="number"
                                        value={shippingSettings.free_shipping_threshold}
                                        onChange={(e) => setShippingSettings({ ...shippingSettings, free_shipping_threshold: Number(e.target.value) })}
                                        className="w-full p-4 bg-gray-50 border rounded-xl outline-none focus:ring-1 focus:ring-black transition-all"
                                        placeholder="Ej: 100"
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">Monto mínimo en el carrito para que el delivery sea gratuito.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold block">Costo de Delivery (S/ )</label>
                                    <input
                                        type="number"
                                        value={shippingSettings.shipping_cost}
                                        onChange={(e) => setShippingSettings({ ...shippingSettings, shipping_cost: Number(e.target.value) })}
                                        className="w-full p-4 bg-gray-50 border rounded-xl outline-none focus:ring-1 focus:ring-black transition-all"
                                        placeholder="Ej: 5"
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">Costo que se cobrará si no se supera el umbral de envío gratis.</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleUpdateSettings}
                                    disabled={isSavingSettings}
                                    className="bg-black text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/90 transition-all disabled:opacity-50"
                                >
                                    {isSavingSettings ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AddProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                productToEdit={selectedProduct}
                onProductAdded={() => {
                    fetchData();
                    setIsProductModalOpen(false);
                    alert(selectedProduct ? "Producto actualizado correctamente" : "Producto creado correctamente");
                }}
            />
        </div>
    );
};

export default AdminDashboard;
