import { useState, useEffect } from 'react';
import { X, Upload, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import type { Product } from '@/types/product';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProductAdded: () => void;
    productToEdit?: Product | null;
}

interface ImageItem {
    type: 'url' | 'file';
    url: string;
    file?: File;
}

const AddProductModal = ({ isOpen, onClose, onProductAdded, productToEdit }: AddProductModalProps) => {
    const [loading, setLoading] = useState(false);
    const [imageItems, setImageItems] = useState<ImageItem[]>([]);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        brand: 'Esika',
        price: 0,
        description: '',
        stock: 0,
        is_new: true,
        is_offer: false,
    });

    // Populate form when opening in edit mode
    useEffect(() => {
        if (isOpen && productToEdit) {
            setFormData({
                name: productToEdit.name,
                brand: productToEdit.brand,
                price: productToEdit.price,
                description: productToEdit.description,
                stock: productToEdit.stock,
                is_new: productToEdit.is_new,
                is_offer: productToEdit.is_offer,
                original_price: productToEdit.original_price,
            });

            // Handle existing images
            const existingImages = productToEdit.images || (productToEdit.image ? [productToEdit.image] : []);
            setImageItems(existingImages.map(url => ({ type: 'url', url })));
        } else if (isOpen && !productToEdit) {
            // Reset for new product
            setFormData({
                name: '',
                brand: 'Esika',
                price: 0,
                description: '',
                stock: 0,
                is_new: true,
                is_offer: false,
            });
            setImageItems([]);
        }
    }, [isOpen, productToEdit]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const newItems: ImageItem[] = newFiles.map(file => ({
                type: 'file',
                url: URL.createObjectURL(file), // Preview URL
                file
            }));
            setImageItems(prev => [...prev, ...newItems]);
        }
    };

    const removeImage = (index: number) => {
        setImageItems(prev => {
            const item = prev[index];
            if (item.type === 'file') {
                URL.revokeObjectURL(item.url);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let productId = productToEdit?.id;
            let finalImageUrls: string[] = imageItems.filter(i => i.type === 'url').map(i => i.url);

            // 1. Create product if it doesn't exist
            if (!productId) {
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .insert([{
                        ...formData,
                        image: 'placeholder',
                        rating: 5,
                        reviews: 0
                    }])
                    .select()
                    .single();

                if (productError) throw productError;
                productId = productData.id;
            }

            // 2. Upload new images
            const newFiles = imageItems.filter(i => i.type === 'file') as (ImageItem & { file: File })[];

            for (const item of newFiles) {
                const fileExt = item.file.name.split('.').pop();
                const fileName = `${productId}/${Math.random().toString(36).substring(2)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(fileName, item.file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(fileName);

                finalImageUrls.push(publicUrl);
            }

            // 3. Update product with all images
            if (finalImageUrls.length > 0) {
                const { error: updateError } = await supabase
                    .from('products')
                    .update({
                        ...formData,
                        image: finalImageUrls[0],
                        images: finalImageUrls,
                    })
                    .eq('id', productId);

                if (updateError) throw updateError;
            } else {
                // Even if no images, we might need to update other fields (edit mode)
                const { error: updateError } = await supabase
                    .from('products')
                    .update({
                        ...formData
                    })
                    .eq('id', productId);
                if (updateError) throw updateError;
            }

            onProductAdded();
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error al guardar producto.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
                >
                    <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                        <h2 className="text-xl font-bold">{productToEdit ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre del Producto</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Marca</label>
                                <select
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none bg-white"
                                    value={formData.brand}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value as Product['brand'] })}
                                >
                                    <option value="Esika">Esika</option>
                                    <option value="Unique">Unique</option>
                                    <option value="Avon">Avon</option>
                                    <option value="Natura">Natura</option>
                                    <option value="Cyzone">Cyzone</option>
                                    <option value="Yanbal">Yanbal</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Precio (S/)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Precio Original</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                                    value={formData.original_price || ''}
                                    onChange={e => setFormData({ ...formData, original_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stock</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Descripción</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Images */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Imágenes del Producto</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 font-medium">
                                    Arrastra imágenes o haz clic para seleccionar
                                </p>
                            </div>

                            {imageItems.length > 0 && (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mt-4">
                                    {imageItems.map((item, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border group">
                                            <img src={item.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Toggles */}
                        <div className="flex gap-8">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_new}
                                    onChange={e => setFormData({ ...formData, is_new: e.target.checked })}
                                    className="accent-black h-4 w-4"
                                />
                                <span className="text-sm font-medium">Es Nuevo</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_offer}
                                    onChange={e => setFormData({ ...formData, is_offer: e.target.checked })}
                                    className="accent-black h-4 w-4"
                                />
                                <span className="text-sm font-medium">Está en Oferta</span>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || imageItems.length === 0}
                                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-black/90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {loading ? 'Guardando...' : (productToEdit ? 'Guardar Cambios' : 'Crear Producto')}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddProductModal;
