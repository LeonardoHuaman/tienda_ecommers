import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '@/types/product';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

interface FavoritesContextType {
    favorites: Product[];
    addToFavorites: (product: Product) => Promise<void>;
    removeFromFavorites: (productId: string) => Promise<void>;
    isFavorite: (productId: string) => boolean;
    toggleFavorite: (product: Product) => Promise<void>;
    favoriteCount: number;
    loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, role, loading: authLoading } = useAuth();
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch favorites from database or localStorage
    useEffect(() => {
        const fetchFavorites = async () => {
            if (authLoading) return; // Wait for auth to settle

            setLoading(true);

            // 1. Check for guest favorites in localStorage
            const savedFavorites = localStorage.getItem('guest_favorites');
            let guestItems: Product[] = [];
            if (savedFavorites) {
                try {
                    guestItems = JSON.parse(savedFavorites);
                } catch (e) {
                    console.error("Error parsing guest favorites", e);
                }
            }

            if (user) {
                try {
                    // 2. Sync guest items to DB if they exist
                    if (guestItems.length > 0) {
                        const syncData = guestItems.map(item => ({
                            user_id: user.id,
                            product_id: item.id
                        }));

                        const { error: syncError } = await supabase
                            .from('favorites')
                            .upsert(syncData, { onConflict: 'user_id, product_id' });

                        if (!syncError) {
                            localStorage.removeItem('guest_favorites');
                        }
                    }

                    // 3. Fetch full list from DB
                    const { data, error } = await supabase
                        .from('favorites')
                        .select('product_id, products (*)')
                        .eq('user_id', user.id);

                    if (error) throw error;

                    if (data) {
                        const dbProducts = data.map(item => item.products) as unknown as Product[];
                        setFavorites(dbProducts.filter(p => p !== null));
                    }
                } catch (error) {
                    console.error("Error fetching favorites:", error);
                }
            } else {
                setFavorites(guestItems);
            }
            setLoading(false);
        };

        fetchFavorites();
    }, [user, authLoading]);

    // Save to localStorage ONLY for guests, using a distinct key
    useEffect(() => {
        if (!user && !loading) {
            localStorage.setItem('guest_favorites', JSON.stringify(favorites));
        }
    }, [favorites, user, loading]);

    const addToFavorites = async (product: Product) => {
        const isActuallyLoggedIn = !!(user && user.id && role);

        if (isActuallyLoggedIn) {
            try {
                const { error } = await supabase
                    .from('favorites')
                    .insert({ user_id: user.id, product_id: product.id });

                if (error) {
                    if (error.code === '23503') {
                        addToLocalFavorites(product);
                        return;
                    }
                    if (error.code !== '23505') throw error;
                }

                if (!favorites.find(p => p.id === product.id)) {
                    setFavorites(prev => [...prev, product]);
                }
            } catch (error) {
                addToLocalFavorites(product);
            }
        } else {
            addToLocalFavorites(product);
        }
    };

    const addToLocalFavorites = (product: Product) => {
        if (!favorites.find(p => p.id === product.id)) {
            setFavorites(prev => [...prev, product]);
        }
    };

    const removeFromFavorites = async (productId: string) => {
        const isActuallyLoggedIn = !!(user && user.id);
        if (isActuallyLoggedIn) {
            try {
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('product_id', productId);

                if (error) throw error;
                setFavorites(prev => prev.filter(p => p.id !== productId));
            } catch (error) {
                console.error("Error removing from favorites:", error);
            }
        } else {
            setFavorites(prev => prev.filter(p => p.id !== productId));
        }
    };

    const isFavorite = (productId: string) => {
        return favorites.some(p => p.id === productId);
    };

    const toggleFavorite = async (product: Product) => {
        if (isFavorite(product.id)) {
            await removeFromFavorites(product.id);
        } else {
            await addToFavorites(product);
        }
    };

    const favoriteCount = favorites.length;

    return (
        <FavoritesContext.Provider value={{
            favorites,
            addToFavorites,
            removeFromFavorites,
            isFavorite,
            toggleFavorite,
            favoriteCount,
            loading
        }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
