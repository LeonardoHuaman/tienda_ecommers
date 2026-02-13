import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: "admin" | "customer" | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<"admin" | "customer" | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper to fetch role via REST to avoid client hanging
    const fetchRoleViaRest = async (accessToken: string) => {
        try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_user_role`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                return 'customer';
            }

            const roleName = await response.json();
            return (roleName === 'admin' || roleName === 'customer') ? roleName : 'customer';
        } catch (e) {
            return 'customer';
        }
    };

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                // 1. Get Session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                }

                // 2. Fetch Role (if user exists)
                if (session?.user && session.access_token) {
                    const roleName = await fetchRoleViaRest(session.access_token);
                    if (mounted) setRole(roleName);
                } else {
                    if (mounted) setRole(null);
                }
            } catch (err) {
                // Silent error
            } finally {
                if (mounted) setLoading(false);
            }
        };

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user && session.access_token) {
                const roleName = await fetchRoleViaRest(session.access_token);
                if (mounted) setRole(roleName);
            } else {
                if (mounted) setRole(null);
            }

            if (mounted) setLoading(false);
        });

        init();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setRole(null);
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, role, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
