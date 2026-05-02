'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type ProFeature =
    | 'paymentGateway'
    | 'customerCRM'
    | 'salesAnalytics'
    | 'campaigns'
    | 'auditLog'
    | 'customBranding'
    | 'pageEditor'
    | 'removeBranding';

export interface PlanLimits {
    maxAdmins: number;
    maxSchedules: number;
    maxAppointmentsPerMonth: number;
}

export type PlanFeatures = Record<ProFeature, boolean>;

export interface Entitlements {
    tier: 'free' | 'pro';
    proUntil: string | null;
    limits: PlanLimits;
    features: PlanFeatures;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: 'owner' | 'admin';
    isSuperAdmin?: boolean;
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
    entitlements: Entitlements | null;
    isOwner: boolean;
    isSuperAdmin: boolean;
    isPro: boolean;
    isAuthenticated: boolean;
    hasCompletedOnboarding: boolean;
    loading: boolean;
    canUse: (feature: ProFeature) => boolean;
    refreshEntitlements: () => Promise<void>;
    login: (token: string, user: User, tenant?: Tenant | null) => void;
    updateOnboarding: (token: string, user: User, tenant: Tenant) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const FREE_FALLBACK: Entitlements = {
    tier: 'free',
    proUntil: null,
    limits: { maxAdmins: 1, maxSchedules: 1, maxAppointmentsPerMonth: 50 },
    features: {
        paymentGateway: false,
        customerCRM: false,
        salesAnalytics: false,
        campaigns: false,
        auditLog: false,
        customBranding: false,
        pageEditor: false,
        removeBranding: false,
    },
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch entitlements + isSuperAdmin from /me — keeps the client in sync after a Pro grant
    const fetchMe = useCallback(async (jwt: string) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${baseUrl}/auth/me`, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    }, []);

    // Hydrate from localStorage on mount, then refresh from /me
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedTenant = localStorage.getItem('tenant');
        const storedEntitlements = localStorage.getItem('entitlements');

        if (storedToken && storedUser) {
            setToken(storedToken);
            const parsedUser = JSON.parse(storedUser);
            if (!parsedUser.name && parsedUser.firstName) {
                parsedUser.name = `${parsedUser.firstName} ${parsedUser.lastName || ''}`.trim();
            }
            setUser(parsedUser);
            if (storedTenant && storedTenant !== 'undefined') {
                setTenant(JSON.parse(storedTenant));
            }
            if (storedEntitlements && storedEntitlements !== 'undefined') {
                try { setEntitlements(JSON.parse(storedEntitlements)); } catch { /* ignore */ }
            }

            // Background refresh — keeps Pro grants/expiry up to date without a logout
            fetchMe(storedToken).then((me) => {
                if (!me) return;
                if (me.entitlements) {
                    setEntitlements(me.entitlements);
                    localStorage.setItem('entitlements', JSON.stringify(me.entitlements));
                }
                if (me.isSuperAdmin !== undefined) {
                    const updatedUser = { ...parsedUser, isSuperAdmin: me.isSuperAdmin };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
                if (me.tenant) {
                    setTenant(me.tenant);
                    localStorage.setItem('tenant', JSON.stringify(me.tenant));
                }
            });
        }
        setLoading(false);
    }, [fetchMe]);

    const refreshEntitlements = useCallback(async () => {
        if (!token) return;
        const me = await fetchMe(token);
        if (me?.entitlements) {
            setEntitlements(me.entitlements);
            localStorage.setItem('entitlements', JSON.stringify(me.entitlements));
        }
    }, [fetchMe, token]);

    const login = useCallback((newToken: string, newUser: User, newTenant?: Tenant | null) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        if (newTenant) localStorage.setItem('tenant', JSON.stringify(newTenant));
        setToken(newToken);
        setUser(newUser);
        if (newTenant) setTenant(newTenant);

        // Pull fresh entitlements after login
        fetchMe(newToken).then((me) => {
            if (me?.entitlements) {
                setEntitlements(me.entitlements);
                localStorage.setItem('entitlements', JSON.stringify(me.entitlements));
            }
            if (me?.isSuperAdmin !== undefined) {
                const merged = { ...newUser, isSuperAdmin: me.isSuperAdmin };
                setUser(merged);
                localStorage.setItem('user', JSON.stringify(merged));
            }
        });
    }, [fetchMe]);

    const updateOnboarding = useCallback((newToken: string, newUser: User, newTenant: Tenant) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('tenant', JSON.stringify(newTenant));
        setToken(newToken);
        setUser(newUser);
        setTenant(newTenant);
        fetchMe(newToken).then((me) => {
            if (me?.entitlements) {
                setEntitlements(me.entitlements);
                localStorage.setItem('entitlements', JSON.stringify(me.entitlements));
            }
        });
    }, [fetchMe]);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
        localStorage.removeItem('entitlements');
        setToken(null);
        setUser(null);
        setTenant(null);
        setEntitlements(null);
        router.push('/login');
    }, [router]);

    const effectiveEntitlements = entitlements || FREE_FALLBACK;
    const isPro = effectiveEntitlements.tier === 'pro';
    const canUse = useCallback(
        (feature: ProFeature) => effectiveEntitlements.features[feature] === true,
        [effectiveEntitlements]
    );

    return (
        <AuthContext.Provider
            value={{
                user,
                tenant,
                token,
                entitlements,
                isOwner: user?.role === 'owner',
                isSuperAdmin: !!user?.isSuperAdmin,
                isPro,
                isAuthenticated: !!token && !!user,
                hasCompletedOnboarding: !!user?.hasCompletedOnboarding || !!tenant,
                loading,
                canUse,
                refreshEntitlements,
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
