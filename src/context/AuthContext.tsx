import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: 'admin' | 'customer' | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<'admin' | 'customer' | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            // Fallback para evitar carga infinita
            const timeout = setTimeout(() => {
                if (mounted) setLoading(false);
            }, 3000);

            try {
                // Get initial session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) console.error("Session error:", error);

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        await fetchUserRole(session.user.id);
                    } else {
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error("Error initializing auth:", error);
                if (mounted) setLoading(false);
            } finally {
                clearTimeout(timeout);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    // Only fetch role if not already loaded or user changed
                    await fetchUserRole(session.user.id);
                } else {
                    setRole(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                // Si el usuario no existe en la tabla, intentar crearlo SOLO si estamos seguros
                if (error.code === 'PGRST116') {
                    // Intento de recuperación: crear perfil básico
                    const { data: userData } = await supabase.auth.getUser();
                    if (userData.user) {
                        // Intentamos insertar con ON CONFLICT DO NOTHING para evitar sobrescribir
                        const { error: insertError } = await supabase
                            .from('users')
                            .upsert({
                                id: userId,
                                email: userData.user.email,
                                full_name: userData.user.user_metadata?.full_name || '',
                                role: 'customer' // Por defecto customer
                            }, { onConflict: 'id', ignoreDuplicates: true }); // IMPORTANTE: Ignorar si ya existe

                        if (!insertError) {
                            // Si se insertó (o ya existía y se ignoró), asumimos customer por ahora
                            // Pero idealmente deberíamos volver a consultar el rol real
                            setRole('customer');
                        }
                    }
                } else {
                    console.error("Error fetching role details:", error);
                    // Si es otro error (ej: recursión, red), NO escribir en DB, solo en memoria local
                    setRole('customer');
                }
            } else {
                setRole(data?.role as 'admin' | 'customer');
            }
        } catch (err) {
            console.error('Unexpected error fetching role:', err);
            setRole('customer'); // Fallback seguro en memoria
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, role, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
