
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Product } from '@/types/product';

export interface CartItem extends Product {
    quantity: number;
}

interface ShippingConfig {
    free_shipping_threshold: number;
    shipping_cost: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
    shippingCost: number;
    freeShippingThreshold: number;
    grandTotal: number;
    refreshSettings: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

import { supabase } from '@/lib/supabaseClient';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : [];
    });

    const [shippingConfig, setShippingConfig] = useState<ShippingConfig>({
        free_shipping_threshold: 100,
        shipping_cost: 5
    });

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'shipping_config')
                .single();

            if (data && !error) {
                setShippingConfig(data.value as ShippingConfig);
            }
        } catch (error) {
            console.error('Error fetching shipping settings:', error);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: Product, quantity: number = 1) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === product.id);
            const availableStock = product.stock ?? 999;

            if (existingItem) {
                const newQuantity = Math.min(existingItem.quantity + quantity, availableStock);
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            }

            const finalQuantity = Math.min(quantity, availableStock);
            return [...prevCart, { ...product, quantity: finalQuantity }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) return;
        setCart((prevCart) =>
            prevCart.map((item) => {
                if (item.id === productId) {
                    const availableStock = item.stock ?? 999;
                    return { ...item, quantity: Math.min(quantity, availableStock) };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const shippingCost = total >= shippingConfig.free_shipping_threshold || total === 0 ? 0 : shippingConfig.shipping_cost;
    const grandTotal = total + shippingCost;

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                total,
                itemCount,
                shippingCost,
                freeShippingThreshold: shippingConfig.free_shipping_threshold,
                grandTotal,
                refreshSettings: fetchSettings
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
