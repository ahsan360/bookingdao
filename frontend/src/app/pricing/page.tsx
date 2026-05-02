'use client';

import Link from 'next/link';
import { Calendar, Check, Sparkles, ArrowRight, X, MessageCircle, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const FEATURE_GROUPS: { title: string; items: { label: string; free: boolean | string; pro: boolean | string }[] }[] = [
    {
        title: 'Workspace & branding',
        items: [
            { label: 'Custom subdomain (yourname.bookingdeo.com)', free: true, pro: true },
            { label: 'Logo on booking page', free: true, pro: true },
            { label: 'Banner image, gallery & brand colors', free: false, pro: true },
            { label: 'Page editor (custom layout)', free: false, pro: true },
            { label: '"Powered by BookingDeo" badge', free: 'Shown', pro: 'Removable' },
        ],
    },
    {
        title: 'Bookings & scheduling',
        items: [
            { label: 'Bookings per month', free: '50', pro: 'Unlimited' },
            { label: 'Working schedules', free: '1', pro: 'Unlimited' },
            { label: 'Slot durations', free: '30 min', pro: '15 / 30 / 60 min' },
            { label: 'Per-day custom pricing', free: false, pro: true },
            { label: 'Multiple breaks per day', free: false, pro: true },
        ],
    },
    {
        title: 'Payments',
        items: [
            { label: 'Online payment collection', free: false, pro: true },
            { label: 'Slot locking (anti double-book)', free: false, pro: true },
            { label: 'Payment gateway integration', free: false, pro: true },
        ],
    },
    {
        title: 'Customers & analytics',
        items: [
            { label: 'Basic customer list', free: true, pro: true },
            { label: 'Customer profiles & history', free: false, pro: true },
            { label: 'Lifetime value tracking', free: false, pro: true },
            { label: 'Sales reports & charts', free: false, pro: true },
            { label: 'Per-booking averages', free: false, pro: true },
        ],
    },
    {
        title: 'Marketing',
        items: [
            { label: 'Email confirmations', free: true, pro: true },
            { label: 'Bulk SMS campaigns', free: false, pro: true },
            { label: 'Bulk Email campaigns', free: false, pro: true },
            { label: 'Delivery & failure tracking', free: false, pro: true },
        ],
    },
    {
        title: 'Team & operations',
        items: [
            { label: 'Team members', free: '1 (owner only)', pro: 'Up to 5' },
            { label: 'Role-based access control', free: false, pro: true },
            { label: 'Audit log', free: false, pro: true },
            { label: 'Priority support', free: false, pro: true },
        ],
    },
];

function Cell({ value }: { value: boolean | string }) {
    if (value === true) return <Check className="w-4 h-4 text-emerald-500 mx-auto" strokeWidth={3} />;
    if (value === false) return <X className="w-4 h-4 text-slate-300 mx-auto" strokeWidth={2.5} />;
    return <span className="text-xs font-medium text-slate-700">{value}</span>;
}

export default function PricingPage() {
    const { tenant, user, isAuthenticated } = useAuth();

    const contactSubject = encodeURIComponent('Pro plan upgrade — BookingDeo');
    const contactBody = encodeURIComponent(
        `Hi,\n\nI'd like to upgrade my BookingDeo workspace to Pro.\n\n` +
        `Workspace: ${tenant?.businessName || '(not signed in)'}\n` +
        `Subdomain: ${tenant?.subdomain || '-'}\n` +
        `Tenant ID: ${tenant?.id || '-'}\n` +
        `Account: ${user?.email || user?.phone || '-'}\n\n` +
        `Please send payment instructions and let me know which billing cycle works.\n\nThanks!`
    );
    const mailto = `mailto:upgrade@bookingdeo.com?subject=${contactSubject}&body=${contactBody}`;

    return (
        <div className="min-h-screen bg-white text-ink-900">
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}>
                            <Calendar className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-[17px] font-semibold tracking-tight">BookingDeo</span>
                    </Link>
                    <div className="flex items-center space-x-1">
                        {isAuthenticated ? (
                            <Link href="/dashboard" className="text-sm text-slate-700 font-medium px-3 py-2 rounded-lg hover:text-slate-900">
                                Dashboard
                            </Link>
                        ) : (
                            <Link href="/login" className="text-sm text-slate-700 font-medium px-3 py-2 rounded-lg hover:text-slate-900">
                                Sign in
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 sm:pt-40 pb-12 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute inset-0 -z-10 grid-bg opacity-50" />
                <div className="absolute top-32 left-1/2 -translate-x-1/2 -z-10 w-[600px] h-[400px] rounded-full opacity-30 blur-[100px]" style={{ background: 'radial-gradient(closest-side, rgba(99,91,255,0.4), transparent)' }} />
                <div className="max-w-3xl mx-auto text-center">
                    <p className="eyebrow mb-4">Pricing</p>
                    <h1 className="text-5xl sm:text-6xl font-semibold tracking-[-0.03em] text-balance mb-5">
                        Start free.<br /><span className="gradient-text">Upgrade when you grow.</span>
                    </h1>
                    <p className="text-lg text-slate-500 text-balance">
                        BookingDeo is free to use forever. Upgrade to Pro for unlimited bookings, online payments, marketing campaigns and more.
                    </p>
                </div>
            </section>

            {/* Plan cards */}
            <section className="px-4 sm:px-6 pb-12">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-5">
                    {/* Free */}
                    <div className="card !p-8 relative">
                        <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Free</h3>
                        <p className="text-sm text-slate-500 mt-1">For getting started</p>
                        <div className="mt-6 mb-1 flex items-baseline gap-1">
                            <span className="text-5xl font-semibold tracking-tight">$0</span>
                            <span className="text-sm text-slate-500">/ month</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-7">forever — no card required</p>
                        <Link href={isAuthenticated ? '/dashboard' : '/register'} className="btn-secondary w-full !rounded-full !py-3">
                            {isAuthenticated ? 'Current plan' : 'Get started free'}
                        </Link>
                        <ul className="mt-7 space-y-3 text-sm">
                            {[
                                'Custom subdomain & booking page',
                                'Up to 50 bookings / month',
                                '1 working schedule',
                                'Email confirmations',
                                'Basic customer list',
                                'Today\'s revenue snapshot',
                            ].map(f => (
                                <li key={f} className="flex items-start gap-2.5">
                                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                                    <span className="text-slate-700">{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pro */}
                    <div className="rounded-2xl p-8 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1f2c 0%, #312e81 50%, #4c1d95 100%)' }}>
                        <div className="absolute inset-0 grid-bg opacity-[0.04]" />
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-30" style={{ background: 'radial-gradient(closest-side, #635bff, transparent)' }} />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-xl font-semibold tracking-tight">Pro</h3>
                                <span className="inline-flex items-center gap-1 bg-white/15 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur">
                                    <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                                    Recommended
                                </span>
                            </div>
                            <p className="text-sm text-white/60">For growing service businesses</p>
                            <div className="mt-6 mb-1 flex items-baseline gap-1">
                                <span className="text-5xl font-semibold tracking-tight">$19</span>
                                <span className="text-sm text-white/60">/ month</span>
                            </div>
                            <p className="text-sm text-white/60 mb-7">or $190 / year (save 17%)</p>

                            <a
                                href={mailto}
                                className="inline-flex items-center justify-center w-full gap-2 px-5 py-3 rounded-full font-semibold text-sm bg-white text-slate-900 hover:bg-slate-100 transition-all"
                            >
                                Contact us to upgrade
                                <ArrowRight className="w-4 h-4" />
                            </a>
                            <p className="text-[11px] text-white/50 mt-3 text-center">
                                Activation is manual — we'll respond within 24 hours.
                            </p>

                            <ul className="mt-7 space-y-3 text-sm">
                                {[
                                    'Everything in Free',
                                    'Unlimited bookings',
                                    'Unlimited schedules with custom pricing',
                                    'Online payment collection',
                                    'Customer CRM with lifetime value',
                                    'Sales analytics & reports',
                                    'Bulk SMS & Email campaigns',
                                    'Up to 5 team members',
                                    'Audit log',
                                    'Custom branding & remove BookingDeo badge',
                                    'Priority support',
                                ].map(f => (
                                    <li key={f} className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-300 mt-0.5 flex-shrink-0" strokeWidth={3} />
                                        <span className="text-white/85">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison table */}
            <section className="px-4 sm:px-6 pb-20">
                <div className="max-w-5xl mx-auto">
                    <div className="card !p-0 overflow-hidden">
                        <div className="grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_160px_160px] sticky top-0 bg-white border-b border-slate-100">
                            <div className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Feature</div>
                            <div className="px-3 py-4 text-center text-sm font-semibold text-slate-900">Free</div>
                            <div className="px-3 py-4 text-center text-sm font-semibold text-primary-600 flex items-center justify-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                Pro
                            </div>
                        </div>
                        {FEATURE_GROUPS.map(group => (
                            <div key={group.title}>
                                <div className="bg-slate-50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-y border-slate-100">
                                    {group.title}
                                </div>
                                {group.items.map(item => (
                                    <div
                                        key={item.label}
                                        className="grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_160px_160px] border-b border-slate-50 last:border-b-0"
                                    >
                                        <div className="px-5 py-3.5 text-sm text-slate-700">{item.label}</div>
                                        <div className="px-3 py-3.5 text-center"><Cell value={item.free} /></div>
                                        <div className="px-3 py-3.5 text-center"><Cell value={item.pro} /></div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 sm:px-6 pb-24">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-semibold tracking-tight mb-3">Need help deciding?</h2>
                    <p className="text-slate-500 mb-7">Talk to us — we'll help you pick the right plan.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href={mailto}
                            className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-slate-800 transition-all"
                        >
                            <Mail className="w-4 h-4" />
                            Email us
                        </a>
                        <a
                            href="https://wa.me/15555550100"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-semibold text-sm border border-slate-200 hover:bg-slate-50 transition-all"
                        >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
