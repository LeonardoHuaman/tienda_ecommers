import type { Product } from '../types/product';

export const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Labial Mate Intenso',
        brand: 'Esika',
        category_id: 'cat_1',
        price: 35.90,
        original_price: 45.00,
        image: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?q=80&w=2080&auto=format&fit=crop',
        description: 'Labial de larga duración con acabado aterciopelado.',
        rating: 4.8,
        reviews: 124,
        is_offer: true,
        is_new: true
    },
    {
        id: '2',
        name: 'Perfume Elegance Gold',
        brand: 'Unique',
        category_id: 'cat_2',
        price: 120.00,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1964&auto=format&fit=crop',
        description: 'Fragancia sofisticada con notas florales y amaderadas.',
        rating: 4.9,
        reviews: 85,
        is_new: true
    },
    {
        id: '3',
        name: 'Crema Hidratante Chronos',
        brand: 'Natura',
        category_id: 'cat_3',
        price: 85.00,
        image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?q=80&w=1974&auto=format&fit=crop',
        description: 'Tratamiento intensivo para la firmeza y luminosidad de la piel.',
        rating: 4.7,
        reviews: 210
    },
    {
        id: '4',
        name: 'Máscara de Pestañas Secret',
        brand: 'Avon',
        category_id: 'cat_1',
        price: 28.00,
        original_price: 32.00,
        image: 'https://images.unsplash.com/photo-1631214503951-37510d9ec6ac?q=80&w=1974&auto=format&fit=crop',
        description: 'Volumen extremo y definición pestaña a pestaña.',
        rating: 4.5,
        reviews: 56,
        is_offer: true
    }
];
