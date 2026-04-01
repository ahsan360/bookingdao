'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    name: string; // computed: firstName + lastName
    email: string | null;
    phone: string | null;
    role: 'owner' | 'admin';
    hasCompletedOnboarding: boolean;
}

interface Tenant {
    id: string;
    businessName: string;
    subdomain: string;
}

interface AuthContextType {
    user: User | null;
    tenant: Tenant | null;
    token: string | null;
    isOwner: boolean;
    isAuthenticated: boolean;
    hasCompletedOnboarding: boolean;
    loading: boolean;
    login: (token: string, user: User, tenant?: Tenant | null) => void;
    updateOnboarding: (token: string, user: User, tenant: Tenant) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedTenant = localStorage.getItem('tenant');

        if (storedToken && storedUser) {
            setToken(storedToken);
            const parsedUser = JSON.parse(storedUser);
            // Ensure backward compat: compute name if missing
            if (!parsedUser.name && parsedUser.firstName) {
                parsedUser.name = `${parsedUser.firstName} ${parsedUser.lastName || ''}`.trim();
            }
            setUser(parsedUser);
            if (storedTenant && storedTenant !== 'undefined') {
                setTenant(JSON.parse(storedTenant));
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback((newToken: string, newUser: User, newTenant?: Tenant | null) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        if (newTenant) {
            localStorage.setItem('tenant', JSON.stringify(newTenant));
        }
        setToken(newToken);
        setUser(newUser);
        if (newTenant) setTenant(newTenant);
    }, []);

    const updateOnboarding = useCallback((newToken: string, newUser: User, newTenant: Tenant) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('tenant', JSON.stringify(newTenant));
        setToken(newToken);
        setUser(newUser);
        setTenant(newTenant);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
        setToken(null);
        setUser(null);
        setTenant(null);
        router.push('/login');
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                user,
                tenant,
                token,
                isOwner: user?.role === 'owner',
                isAuthenticated: !!token && !!user,
                hasCompletedOnboarding: !!user?.hasCompletedOnboarding || !!tenant,
                loading,
                login,
                updateOnboarding,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
