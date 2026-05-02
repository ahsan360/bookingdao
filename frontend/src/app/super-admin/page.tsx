'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Calendar, ShieldCheck, Search, Sparkles, ArrowLeft,
    CheckCircle, X, AlertTriangle, Crown, Calendar as CalendarIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { useToast } from '@/components/useToast';
import { useConfirm } from '@/components/ConfirmDialog';

interface SuperAdminTenant {
    id: string;
    businessName: string;
    subdomain: string;
    email: string | null;
    proUntil: string | null;
    tier: 'free' | 'pro';
    createdAt: string;
    userCount: number;
    appointmentCount: number;
}

export default function SuperAdminPage() {
    const router = useRouter();
    const { isSuperAdmin, isAuthenticated, loading: authLoading } = useAuth();
    const { addToast, ToastContainer } = useToast();
    const { confirm, ConfirmDialogComponent } = useConfirm();

    const [tenants, setTenants] = useState<SuperAdminTenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'free' | 'pro'>('all');
    const [grantModal, setGrantModal] = useState<SuperAdminTenant | null>(null);
    const [grantDate, setGrantDate] = useState('');
    const [grantBusy, setGrantBusy] = useState(false);

    const fetchTenants = async () => {
        try {
            const res = await api.get('/admin/super-admin/tenants');
            setTenants(res.data.tenants);
        } catch (err: any) {
            addToast(err.response?.data?.error || 'Failed to load tenants', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (!isSuperAdmin) {
            router.push('/dashboard');
            return;
        }
        fetchTenants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, isAuthenticated, isSuperAdmin, router]);

    const openGrantModal = (tenant: SuperAdminTenant) => {
        setGrantModal(tenant);
        // Default to 30 days from now
        const d = new Date();
        d.setDate(d.getDate() + 30);
        setGrantDate(d.toISOString().split('T')[0]);
    };

    const presetDate = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        setGrantDate(d.toISOString().split('T')[0]);
    };

    const submitGrant = async () => {
        if (!grantModal) return;
        const proUntilISO = new Date(grantDate + 'T23:59:59').toISOString();
        setGrantBusy(true);
        try {
            await api.post(`/admin/super-admin/tenants/${grantModal.id}/grant-pro`, {
                proUntil: proUntilISO,
            });
            addToast(`Pro granted to ${grantModal.businessName} until ${grantDate}`, 'success');
            setGrantModal(null);
            await fetchTenants();
        } catch (err: any) {
            addToast(err.response?.data?.error || 'Failed to grant Pro', 'error');
        } finally {
            setGrantBusy(false);
        }
    };

    const handleRevoke = async (tenant: SuperAdminTenant) => {
        const ok = await confirm(
            'Revoke Pro access?',
            `${tenant.businessName} will be downgraded to Free immediately.`,
            'danger'
        );
        if (!ok) return;
        try {
            await api.post(`/admin/super-admin/tenants/${tenant.id}/revoke-pro`);
            addToast(`Pro revoked for ${tenant.businessName}`, 'success');
            await fetchTenants();
        } catch (err: any) {
            addToast(err.response?.data?.error || 'Failed to revoke', 'error');
        }
    };

    const filtered = tenants.filter(t => {
        if (filter !== 'all' && t.tier !== filter) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            t.businessName.toLowerCase().includes(q) ||
            t.subdomain.toLowerCase().includes(q) ||
            (t.email || '').toLowerCase().includes(q)
        );
    });

    const stats = {
        total: tenants.length,
        free: tenants.filter(t => t.tier === 'free').length,
        pro: tenants.filter(t => t.tier === 'pro').length,
        bookings: tenants.reduce((s, t) => s + t.appointmentCount, 0),
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <ToastContainer />
            {ConfirmDialogComponent}

            {/* Header */}
            <header className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}>
                                <ShieldCheck className="w-4 h-4 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-base font-semibold text-slate-900 tracking-tight">Super Admin</h1>
                                <p className="text-xs text-slate-500">Platform-level tenant management</p>
                            </div>
                        </div>
                    </div>
                    <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                        Back to dashboard
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    {[
                        { label: 'Total tenants', value: stats.total, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
                        { label: 'Free tier', value: stats.free, icon: Calendar, color: 'bg-slate-100 text-slate-600' },
                        { label: 'Pro tier', value: stats.pro, icon: Crown, color: 'bg-primary-50 text-primary-600' },
                        { label: 'Total bookings', value: stats.bookings.toLocaleString(), icon: CalendarIcon, color: 'bg-emerald-50 text-emerald-600' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="card !p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-medium text-slate-500">{label}</p>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="card !p-0 overflow-hidden">
                    <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by name, subdomain, email..."
                                    className="input-field !py-2 !pl-9 text-sm w-72"
                                />
                            </div>
                            <div className="flex bg-slate-100 rounded-lg p-0.5">
                                {(['all', 'free', 'pro'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                                            filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">
                            Showing {filtered.length} of {tenants.length}
                        </p>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-left">
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tenant</th>
                                    <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Plan</th>
                                    <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pro until</th>
                                    <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-center">Users</th>
                                    <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-center">Bookings</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                                            No tenants match the current filter.
                                        </td>
                                    </tr>
                                ) : filtered.map(t => (
                                    <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                                        <td className="px-5 py-3.5">
                                            <p className="font-semibold text-slate-900">{t.businessName}</p>
                                            <p className="text-xs text-slate-500 font-mono">{t.subdomain}.bookingdeo.com</p>
                                            {t.email && <p className="text-xs text-slate-400 mt-0.5">{t.email}</p>}
                                        </td>
                                        <td className="px-3 py-3.5">
                                            {t.tier === 'pro' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}>
                                                    <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />
                                                    PRO
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                                                    FREE
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3.5 text-xs text-slate-600">
                                            {t.proUntil ? new Date(t.proUntil).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                        </td>
                                        <td className="px-3 py-3.5 text-center text-slate-700 font-medium">{t.userCount}</td>
                                        <td className="px-3 py-3.5 text-center text-slate-700 font-medium">{t.appointmentCount.toLocaleString()}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openGrantModal(t)}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-md text-white transition-all"
                                                    style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}
                                                >
                                                    {t.tier === 'pro' ? 'Extend' : 'Grant Pro'}
                                                </button>
                                                {t.tier === 'pro' && (
                                                    <button
                                                        onClick={() => handleRevoke(t)}
                                                        className="px-3 py-1.5 text-xs font-semibold rounded-md text-red-600 hover:bg-red-50 transition-all"
                                                    >
                                                        Revoke
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Grant modal */}
            {grantModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => !grantBusy && setGrantModal(null)}>
                    <div className="bg-white rounded-2xl shadow-elevated max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                                    {grantModal.tier === 'pro' ? 'Extend Pro access' : 'Grant Pro access'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-0.5">{grantModal.businessName}</p>
                            </div>
                            <button onClick={() => !grantBusy && setGrantModal(null)} className="p-1 rounded-lg hover:bg-slate-100">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        {grantModal.tier === 'pro' && grantModal.proUntil && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4 text-xs text-amber-700 flex items-start gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                <span>Currently Pro until {new Date(grantModal.proUntil).toLocaleDateString()}. New date will replace the existing one.</span>
                            </div>
                        )}

                        <label className="label">Pro until</label>
                        <input
                            type="date"
                            value={grantDate}
                            onChange={e => setGrantDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="input-field mb-3"
                        />

                        <div className="flex flex-wrap gap-2 mb-6">
                            {[
                                { label: '+30 days', days: 30 },
                                { label: '+90 days', days: 90 },
                                { label: '+1 year', days: 365 },
                            ].map(p => (
                                <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => presetDate(p.days)}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setGrantModal(null)}
                                disabled={grantBusy}
                                className="btn-secondary flex-1 !rounded-full"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitGrant}
                                disabled={grantBusy || !grantDate}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white disabled:opacity-50 transition-all"
                                style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}
                            >
                                {grantBusy ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <CheckCircle className="w-4 h-4" />
                                )}
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
