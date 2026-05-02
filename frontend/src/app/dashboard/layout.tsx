'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Calendar, Clock, Users, LogOut, Settings, FileEdit,
    TrendingUp, CalendarDays, FileText, Menu, X, LayoutDashboard, Megaphone, Contact,
    ShieldCheck, Sparkles, ArrowRight, CreditCard
} from 'lucide-react';
import { useAuth, ProFeature } from '@/lib/auth';
import ProBadge from '@/components/ui/ProBadge';

interface NavItem {
    href: string;
    label: string;
    icon: any;
    ownerOnly?: boolean;
    proFeature?: ProFeature;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
    {
        label: 'Overview',
        items: [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays },
        ],
    },
    {
        label: 'Business',
        items: [
            { href: '/dashboard/schedules', label: 'Schedules', icon: Clock },
            { href: '/dashboard/sales', label: 'Sales', icon: TrendingUp, proFeature: 'salesAnalytics' },
            { href: '/dashboard/customers', label: 'Customers', icon: Contact, proFeature: 'customerCRM' },
            { href: '/dashboard/campaigns', label: 'Campaigns', icon: Megaphone, proFeature: 'campaigns' },
        ],
    },
    {
        label: 'Settings',
        items: [
            { href: '/dashboard/page-editor', label: 'My Page', icon: FileEdit, proFeature: 'pageEditor' },
            { href: '/dashboard/payment-config', label: 'Payments', icon: CreditCard, ownerOnly: true, proFeature: 'paymentGateway' },
            { href: '/dashboard/team', label: 'Team', icon: Users, ownerOnly: true },
            { href: '/dashboard/audit-log', label: 'Audit Log', icon: FileText, ownerOnly: true, proFeature: 'auditLog' },
            { href: '/dashboard/settings', label: 'Settings', icon: Settings, ownerOnly: true },
        ],
    },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, tenant, isOwner, isSuperAdmin, isPro, entitlements, canUse, isAuthenticated, hasCompletedOnboarding, loading, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && isAuthenticated && !hasCompletedOnboarding) {
            router.push('/onboarding');
        }
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, hasCompletedOnboarding, router]);

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200
                z-50 transform transition-transform duration-200 ease-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                {/* Logo */}
                <div className="px-5 py-5 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}>
                                <Calendar className="w-4 h-4 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-sm font-semibold text-slate-900 leading-tight tracking-tight">BookingDeo</h1>
                                <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{tenant?.businessName}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 lg:hidden"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Nav Groups */}
                <nav className="px-3 py-4 space-y-5 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                    {NAV_GROUPS.map(group => {
                        const visibleItems = group.items.filter(item => !item.ownerOnly || isOwner);
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={group.label}>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-1.5">
                                    {group.label}
                                </p>
                                <div className="space-y-0.5">
                                    {visibleItems.map(item => {
                                        const Icon = item.icon;
                                        const active = isActive(item.href);
                                        const locked = !!item.proFeature && !canUse(item.proFeature);
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`
                                                    flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all
                                                    ${active
                                                        ? 'bg-primary-50 text-primary-700'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                                    }
                                                `}
                                            >
                                                <span className="flex items-center space-x-2.5 min-w-0">
                                                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary-600' : 'text-slate-400'}`} />
                                                    <span className="truncate">{item.label}</span>
                                                </span>
                                                {locked && <ProBadge size="xs" />}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* User info + plan + super admin + Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-100 bg-white space-y-1">
                    {/* Plan status */}
                    {isPro ? (
                        <div className="px-3 py-2 rounded-lg text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}>
                            <div className="flex items-center justify-between gap-2">
                                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                                    <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                                    Pro plan
                                </span>
                                {entitlements?.proUntil && (
                                    <span className="text-[10px] text-white/80">
                                        until {new Date(entitlements.proUntil).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Link
                            href="/pricing"
                            className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-all"
                        >
                            <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
                                Upgrade to Pro
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    )}

                    {isSuperAdmin && (
                        <Link
                            href="/super-admin"
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 w-full transition-all"
                        >
                            <ShieldCheck className="w-4 h-4 text-slate-400" />
                            <span>Super admin</span>
                        </Link>
                    )}

                    <div className="flex items-center space-x-2.5 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                            {user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{user?.name}</p>
                            <p className="text-[11px] text-slate-400 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 w-full transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content area */}
            <div className="lg:pl-64">
                {/* Top bar (mobile) */}
                <header className="sticky top-0 z-30 bg-white border-b border-slate-200 lg:hidden">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-lg hover:bg-slate-50"
                        >
                            <Menu className="w-5 h-5 text-slate-600" />
                        </button>
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}>
                                <Calendar className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 tracking-tight">BookingDeo</span>
                        </div>
                        <div className="w-9" />
                    </div>
                </header>

                {/* Page content */}
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
}
