'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Calendar, Clock, Users, LogOut, Settings, FileEdit,
    TrendingUp, CalendarDays, FileText, Menu, X, LayoutDashboard, Megaphone, Contact
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface NavItem {
    href: string;
    label: string;
    icon: any;
    color?: string;
    ownerOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-primary-600' },
    { href: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays, color: 'text-blue-600' },
    { href: '/dashboard/schedules', label: 'Schedules', icon: Clock, color: 'text-indigo-600' },
    { href: '/dashboard/sales', label: 'Sales', icon: TrendingUp, color: 'text-emerald-600' },
    { href: '/dashboard/page-editor', label: 'My Page', icon: FileEdit, color: 'text-pink-600' },
    { href: '/dashboard/customers', label: 'Customers', icon: Contact, color: 'text-cyan-600' },
    { href: '/dashboard/campaigns', label: 'Campaigns', icon: Megaphone, color: 'text-orange-600' },
    { href: '/dashboard/team', label: 'Team', icon: Users, color: 'text-violet-600', ownerOnly: true },
    { href: '/dashboard/audit-log', label: 'Audit Log', icon: FileText, color: 'text-amber-600', ownerOnly: true },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings, color: 'text-slate-600', ownerOnly: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, tenant, isOwner, isAuthenticated, hasCompletedOnboarding, loading, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Redirect to onboarding if not completed
    useEffect(() => {
        if (!loading && isAuthenticated && !hasCompletedOnboarding) {
            router.push('/onboarding');
        }
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, hasCompletedOnboarding, router]);

    const filteredNavItems = NAV_ITEMS.filter(item =>
        !item.ownerOnly || isOwner
    );

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    // Show nothing while auth is loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse-slow text-primary-600">
                    <Calendar className="w-16 h-16" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/60
                shadow-lg z-50 transform transition-transform duration-200 ease-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:shadow-none
            `}>
                {/* Logo */}
                <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold gradient-text leading-tight">BookEase</h1>
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

                {/* Nav Items */}
                <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
                    {filteredNavItems.map(item => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                                    ${active
                                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                    }
                                `}
                            >
                                <Icon className={`w-[18px] h-[18px] ${active ? 'text-primary-600' : item.color || 'text-slate-400'}`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User info + Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-100 bg-white/90">
                    <div className="flex items-center space-x-2.5 px-3 py-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                            {user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{user?.name}</p>
                            <p className="text-[11px] text-slate-400 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all"
                    >
                        <LogOut className="w-[18px] h-[18px]" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content area */}
            <div className="lg:pl-64">
                {/* Top bar (mobile) */}
                <header className="sticky top-0 z-30 glass border-b border-white/20 lg:hidden">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-lg hover:bg-white/50"
                        >
                            <Menu className="w-5 h-5 text-slate-600" />
                        </button>
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-primary-600" />
                            <span className="text-sm font-bold gradient-text">BookEase</span>
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
