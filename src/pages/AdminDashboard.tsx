import { Package, ShoppingBag, Users, BarChart3, Plus, Search, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    return (
        <div className="container px-4 py-12">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
                    <p className="text-muted-foreground">Bienvenido de nuevo, administrador.</p>
                </div>
                <button className="bg-black text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-black/90 transition-all">
                    <Plus className="h-4 w-4" /> Nuevo Producto
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Ventas Totales', value: 'S/ 12,450', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pedidos Hoy', value: '24', icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Nuevos Clientes', value: '15', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Stock Bajo', value: '8', icon: Package, color: 'text-red-600', bg: 'bg-red-50' },
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

            {/* Recent Orders Table */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between">
                    <h3 className="font-bold text-lg">Pedidos Recientes</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input placeholder="Buscar pedido..." className="pl-9 pr-4 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-bold uppercase text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4">ID Pedido</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {[1, 2, 3, 4, 5].map((order) => (
                                <tr key={order} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium">#ORD-00{order}</td>
                                    <td className="px-6 py-4">María García</td>
                                    <td className="px-6 py-4 text-muted-foreground">Hace 2 horas</td>
                                    <td className="px-6 py-4 font-bold">S/ 85.00</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Entregado</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-1 hover:bg-gray-200 rounded-md transition-colors text-muted-foreground">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
