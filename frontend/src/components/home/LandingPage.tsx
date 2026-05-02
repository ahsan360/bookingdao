'use client';

import Link from 'next/link';
import {
    Calendar, Clock, Shield, Zap, Users, Globe, CreditCard,
    ArrowRight, CheckCircle, Smartphone, BarChart3, Sparkles
} from 'lucide-react';
import FeatureShowcase from './FeatureShowcase';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white text-ink-900">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}>
                            <Calendar className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-[17px] font-semibold tracking-tight text-ink-900">BookingDeo</span>
                    </Link>
                    <div className="flex items-center space-x-1">
                        <a href="#features" className="hidden md:inline-block text-sm text-ink-600 hover:text-ink-900 font-medium transition-colors px-3 py-2 rounded-lg">
                            Features
                        </a>
                        <a href="#how-it-works" className="hidden md:inline-block text-sm text-ink-600 hover:text-ink-900 font-medium transition-colors px-3 py-2 rounded-lg">
                            How it works
                        </a>
                        <a href="#demo" className="hidden md:inline-block text-sm text-ink-600 hover:text-ink-900 font-medium transition-colors px-3 py-2 rounded-lg">
                            Product
                        </a>
                        <Link href="/login" className="text-sm text-ink-700 font-medium px-3 py-2 rounded-lg hover:text-ink-900">
                            Sign in
                        </Link>
                        <Link href="/register" className="btn-primary-gradient ml-1 !px-4 !py-2 !text-sm">
                            Get started
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
                {/* Backdrop layers */}
                <div className="absolute inset-0 -z-10 grid-bg opacity-60" />
                <div className="absolute inset-x-0 top-0 -z-10 h-[600px] bg-gradient-to-b from-primary-50/40 via-white to-transparent" />
                <div className="absolute top-32 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[600px] rounded-full opacity-40 blur-[120px]" style={{ background: 'radial-gradient(closest-side, rgba(99,91,255,0.35), transparent)' }} />
                <div className="absolute top-72 right-[10%] -z-10 w-[400px] h-[400px] rounded-full opacity-30 blur-[100px]" style={{ background: 'radial-gradient(closest-side, rgba(236,72,153,0.3), transparent)' }} />

                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto animate-fade-in">
                        {/* Eyebrow badge */}
                        <div className="inline-flex items-center gap-2 bg-white border border-ink-200 rounded-full pl-1 pr-4 py-1 mb-8 shadow-sm">
                            <span className="flex items-center gap-1 bg-primary-50 text-primary-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                                <Sparkles className="w-3 h-3" />
                                New
                            </span>
                            <span className="text-xs font-medium text-ink-700">Multi-tenant booking infrastructure</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold mb-6 leading-[1.05] tracking-[-0.04em] text-ink-900 text-balance">
                            Bookings &amp; payments,<br />
                            <span className="gradient-text">infrastructure for service businesses</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-ink-500 mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
                            BookingDeo is a complete platform for accepting appointments online. Set your hours, share a branded page, collect payments — built on a multi-tenant architecture.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-16">
                            <Link href="/register" className="btn-primary-gradient text-[15px] px-7 py-3.5">
                                Create your workspace
                                <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Link>
                            <a href="#demo" className="btn-secondary text-[15px] px-7 py-3.5">
                                Explore the product
                            </a>
                        </div>
                    </div>

                    {/* Hero visual - mock booking interface */}
                    <div className="mt-8 sm:mt-12 max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="relative">
                            {/* Glow */}
                            <div className="absolute inset-0 -z-10 shadow-glow rounded-3xl" />

                            <div className="bg-white rounded-2xl shadow-elevated border border-ink-100 overflow-hidden">
                                {/* Browser chrome */}
                                <div className="bg-ink-50/70 border-b border-ink-100 px-4 py-3 flex items-center">
                                    <div className="flex space-x-1.5">
                                        <div className="w-3 h-3 rounded-full bg-ink-200" />
                                        <div className="w-3 h-3 rounded-full bg-ink-200" />
                                        <div className="w-3 h-3 rounded-full bg-ink-200" />
                                    </div>
                                    <div className="flex-1 flex justify-center">
                                        <div className="bg-white rounded-md px-3 py-1 text-[11px] text-ink-400 border border-ink-200 font-mono w-72 sm:w-96 text-center">
                                            <span className="text-ink-300">https://</span>acme-clinic<span className="text-ink-300">.bookingdeo.com</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Mock content */}
                                <div className="p-6 sm:p-10">
                                    <div className="grid sm:grid-cols-5 gap-8">
                                        {/* Left: business header + slots */}
                                        <div className="sm:col-span-3">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}>
                                                    AC
                                                </div>
                                                <div>
                                                    <p className="text-base font-semibold text-ink-900">Acme Clinic</p>
                                                    <p className="text-xs text-ink-500">General consultation · 30 min</p>
                                                </div>
                                            </div>
                                            <p className="text-xs font-semibold text-ink-700 uppercase tracking-wider mb-3">Select a date</p>
                                            <div className="flex gap-2 mb-6">
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                                                    <div key={day} className={`flex-1 py-3 rounded-xl text-center transition-all ${i === 1 ? 'text-white shadow-md' : 'bg-ink-50 text-ink-600 border border-ink-100'}`} style={i === 1 ? { background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' } : {}}>
                                                        <div className="text-[10px] font-medium opacity-70">{day}</div>
                                                        <div className="text-base font-bold mt-0.5">{10 + i}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs font-semibold text-ink-700 uppercase tracking-wider mb-3">Select a time</p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30'].map((time, i) => (
                                                    <div key={time} className={`py-2.5 rounded-lg text-center text-xs font-semibold transition-all ${i === 2 ? 'text-white shadow-sm' : 'bg-white text-ink-700 border border-ink-200 hover:border-ink-300'}`} style={i === 2 ? { background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' } : {}}>
                                                        {time}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Right: booking summary */}
                                        <div className="sm:col-span-2 hidden sm:block">
                                            <div className="bg-ink-50/70 rounded-2xl p-5 border border-ink-100">
                                                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-4">Summary</p>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-ink-500">Date</span>
                                                        <span className="font-medium text-ink-900">Tue, Mar 11</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-ink-500">Time</span>
                                                        <span className="font-medium text-ink-900">10:00 AM</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-ink-500">Duration</span>
                                                        <span className="font-medium text-ink-900">30 min</span>
                                                    </div>
                                                    <div className="border-t border-ink-200 pt-3 flex justify-between items-baseline">
                                                        <span className="text-ink-500">Total</span>
                                                        <span className="text-2xl font-bold text-ink-900">$50<span className="text-sm font-medium text-ink-400">.00</span></span>
                                                    </div>
                                                </div>
                                                <div className="mt-5 space-y-2">
                                                    <div className="h-9 bg-white rounded-lg border border-ink-200" />
                                                    <div className="h-9 bg-white rounded-lg border border-ink-200" />
                                                    <button className="w-full h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm" style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}>
                                                        Confirm &amp; pay $50
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Logo / proof strip — neutral capability claims, no fake numbers */}
            <section className="py-12 px-4 sm:px-6 border-y border-ink-100 bg-ink-50/40">
                <div className="max-w-6xl mx-auto">
                    <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-400 mb-6">Built for any service business</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
                        {[
                            { label: 'Clinics', icon: Calendar },
                            { label: 'Salons', icon: Sparkles },
                            { label: 'Studios', icon: Users },
                            { label: 'Coaches', icon: Clock },
                            { label: 'Agencies', icon: BarChart3 },
                            { label: 'Tutors', icon: Globe },
                        ].map(({ label, icon: Icon }) => (
                            <div key={label} className="flex items-center justify-center gap-2 text-ink-500">
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-semibold">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 sm:mb-20 max-w-3xl mx-auto">
                        <p className="eyebrow mb-4">Platform</p>
                        <h2 className="text-4xl sm:text-5xl font-semibold tracking-[-0.03em] text-ink-900 text-balance">
                            Every primitive you need <span className="gradient-text">to run a bookings business</span>
                        </h2>
                        <p className="text-ink-500 mt-5 text-lg leading-relaxed">
                            Scheduling, payments, customer records, branded pages, marketing — built into one cohesive platform on a multi-tenant foundation.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            {
                                icon: Calendar,
                                color: 'bg-primary-50 text-primary-600',
                                title: 'Smart scheduling',
                                desc: 'Configure working hours, slot durations, breaks and pricing per day. Conflicts and double-bookings are prevented at the database layer.',
                            },
                            {
                                icon: CreditCard,
                                color: 'bg-emerald-50 text-emerald-600',
                                title: 'Online payments',
                                desc: 'Pluggable payment gateway integration with encrypted credentials, slot locking and automatic confirmation on successful capture.',
                            },
                            {
                                icon: Globe,
                                color: 'bg-secondary-50 text-secondary-600',
                                title: 'Branded subdomains',
                                desc: 'Each tenant gets a custom subdomain with their own logo, banner, gallery and colors — no app downloads required.',
                            },
                            {
                                icon: Smartphone,
                                color: 'bg-pink-50 text-pink-600',
                                title: 'Responsive by default',
                                desc: 'Both the customer-facing booking page and the operator dashboard are designed mobile-first and scale up to desktop.',
                            },
                            {
                                icon: Shield,
                                color: 'bg-amber-50 text-amber-600',
                                title: 'Tenant isolation',
                                desc: 'Each workspace has isolated data and credentials with role-based access control for owners, staff and viewers.',
                            },
                            {
                                icon: BarChart3,
                                color: 'bg-cyan-50 text-cyan-600',
                                title: 'Insights & reports',
                                desc: 'Daily, weekly and monthly revenue breakdowns. Customer profiles with lifetime value. Audit logs for compliance.',
                            },
                        ].map((feature) => (
                            <div key={feature.title} className="card-hover group p-7">
                                <div className={`w-11 h-11 ${feature.color} rounded-xl flex items-center justify-center mb-5`}>
                                    <feature.icon className="w-[22px] h-[22px]" strokeWidth={2.25} />
                                </div>
                                <h3 className="text-[17px] font-semibold text-ink-900 mb-2 tracking-tight">{feature.title}</h3>
                                <p className="text-sm text-ink-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 bg-ink-50/40 border-y border-ink-100 relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-50" />
                <div className="max-w-6xl mx-auto relative">
                    <div className="text-center mb-16 sm:mb-20 max-w-2xl mx-auto">
                        <p className="eyebrow mb-4">How it works</p>
                        <h2 className="text-4xl sm:text-5xl font-semibold tracking-[-0.03em] text-ink-900 text-balance">
                            From sign-up to first booking <span className="gradient-text">in three steps</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                step: '01',
                                title: 'Create your workspace',
                                desc: 'Sign up and provision your tenant. You get a dedicated subdomain and an isolated workspace in seconds.',
                                icon: Users,
                            },
                            {
                                step: '02',
                                title: 'Configure schedules',
                                desc: 'Set working days, slot durations, breaks and pricing. Customize your booking page with logo, banner and gallery.',
                                icon: Clock,
                            },
                            {
                                step: '03',
                                title: 'Share & accept',
                                desc: 'Share your link. Customers pick a slot, pay online, and the system confirms automatically — no manual touch.',
                                icon: Calendar,
                            },
                        ].map((item) => (
                            <div key={item.step} className="card !p-7 relative">
                                <span className="absolute top-7 right-7 text-xs font-mono font-semibold text-ink-300">{item.step}</span>
                                <div className="w-11 h-11 rounded-xl bg-white border border-ink-100 flex items-center justify-center mb-5 shadow-sm">
                                    <item.icon className="w-5 h-5 text-primary-600" strokeWidth={2.25} />
                                </div>
                                <h3 className="text-[17px] font-semibold text-ink-900 mb-2 tracking-tight">{item.title}</h3>
                                <p className="text-sm text-ink-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Showcase Slider */}
            <FeatureShowcase />

            {/* Architecture / Tech credibility section — replaces fake testimonials */}
            <section className="py-24 sm:py-32 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <p className="eyebrow mb-4">Engineering</p>
                        <h2 className="text-4xl sm:text-5xl font-semibold tracking-[-0.03em] text-ink-900 text-balance">
                            Built on production-grade <span className="gradient-text">foundations</span>
                        </h2>
                        <p className="text-ink-500 mt-5 text-lg leading-relaxed">
                            Designed and engineered as a real SaaS product — not a prototype. Multi-tenant from day one.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-5">
                        {[
                            {
                                icon: Shield,
                                title: 'Multi-tenant architecture',
                                desc: 'Subdomain-based tenant routing, isolated data per workspace, and tenant-aware middleware on every request.',
                                tags: ['Subdomain routing', 'Row-level isolation', 'RBAC'],
                            },
                            {
                                icon: Zap,
                                title: 'Modern stack',
                                desc: 'Next.js 14 App Router on the frontend, Node.js + TypeScript backend, with Tailwind for the UI system.',
                                tags: ['Next.js 14', 'TypeScript', 'Tailwind'],
                            },
                            {
                                icon: CreditCard,
                                title: 'Real payment flow',
                                desc: 'Slot-locking on payment intent, idempotent confirmation webhooks, and retry-safe failure handling.',
                                tags: ['Slot locking', 'Webhooks', 'Idempotency'],
                            },
                        ].map((item) => (
                            <div key={item.title} className="card !p-7">
                                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-5">
                                    <item.icon className="w-5 h-5 text-primary-600" strokeWidth={2.25} />
                                </div>
                                <h3 className="text-[17px] font-semibold text-ink-900 mb-2 tracking-tight">{item.title}</h3>
                                <p className="text-sm text-ink-500 leading-relaxed mb-5">{item.desc}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="text-[11px] font-medium font-mono px-2 py-1 rounded-md bg-ink-50 text-ink-600 border border-ink-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="pb-20 sm:pb-28 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto rounded-3xl text-white p-12 sm:p-16 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1f2c 0%, #312e81 50%, #4c1d95 100%)' }}>
                    <div className="absolute inset-0 grid-bg opacity-[0.03]" />
                    <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] opacity-30" style={{ background: 'radial-gradient(closest-side, #635bff, transparent)' }} />
                    <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-[100px] opacity-30" style={{ background: 'radial-gradient(closest-side, #ec4899, transparent)' }} />

                    <div className="relative">
                        <h2 className="text-4xl sm:text-5xl font-semibold mb-5 tracking-[-0.03em] text-balance">
                            Ready to launch your booking page?
                        </h2>
                        <p className="text-lg mb-10 text-white/70 max-w-xl mx-auto leading-relaxed">
                            Spin up a workspace, configure your schedule, and accept your first booking — all in a few minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white text-ink-900 px-7 py-3.5 rounded-full font-semibold text-[15px] hover:bg-ink-50 active:scale-[0.98] transition-all duration-200">
                                Create your workspace
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a href="#demo" className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-7 py-3.5 rounded-full font-semibold text-[15px] hover:bg-white/15 border border-white/20 backdrop-blur active:scale-[0.98] transition-all duration-200">
                                Take the product tour
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-14 sm:py-16 px-4 sm:px-6 border-t border-ink-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}>
                                    <Calendar className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                                </div>
                                <span className="text-base font-semibold text-ink-900 tracking-tight">BookingDeo</span>
                            </div>
                            <p className="text-sm text-ink-500 leading-relaxed max-w-xs">
                                Multi-tenant booking and payments infrastructure for service businesses.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-ink-800 mb-3 text-sm">Product</h4>
                            <ul className="text-sm text-ink-500 space-y-2.5">
                                <li><a href="#features" className="hover:text-ink-800 transition-colors">Features</a></li>
                                <li><a href="#how-it-works" className="hover:text-ink-800 transition-colors">How it works</a></li>
                                <li><a href="#demo" className="hover:text-ink-800 transition-colors">Product tour</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-ink-800 mb-3 text-sm">Company</h4>
                            <ul className="text-sm text-ink-500 space-y-2.5">
                                <li><a href="#" className="hover:text-ink-800 transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-ink-800 transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-ink-800 transition-colors">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-ink-800 mb-3 text-sm">Legal</h4>
                            <ul className="text-sm text-ink-500 space-y-2.5">
                                <li><a href="#" className="hover:text-ink-800 transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-ink-800 transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-ink-800 transition-colors">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-ink-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-ink-400">
                        <p>&copy; {new Date().getFullYear()} BookingDeo. All rights reserved.</p>
                        <p className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            All systems operational
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
