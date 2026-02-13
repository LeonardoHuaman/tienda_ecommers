export interface Product {
    id: string;
    name: string;
    brand: 'Esika' | 'Unique' | 'Avon' | 'Natura' | 'Cyzone' | 'Yanbal';
    category_id?: string;
    price: number;
    original_price?: number;
    image: string;
    images?: string[]; // Array of additional image URLs
    description: string;
    rating: number;
    reviews: number;
    is_new?: boolean;
    is_offer?: boolean;
    stock?: number;
    created_at?: string;
}
