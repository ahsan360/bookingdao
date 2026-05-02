'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    ChevronLeft, ChevronRight, Calendar, Clock, Users, BarChart3,
    CreditCard, Palette, MessageSquare, CheckCircle, TrendingUp,
    DollarSign, Star, Phone, Mail, MapPin, Image as ImageIcon
} from 'lucide-react';

type Slide = {
    id: string;
    badge: string;
    title: string;
    description: string;
    highlights: string[];
    accent: string;
    mockup: React.ReactNode;
};

export default function FeatureShowcase() {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const slides: Slide[] = [
        {
            id: 'dashboard',
            badge: 'Smart Dashboard',
            title: 'See your business at a glance',
            description:
                'Real-time revenue tracking, live appointment status, and instant business insights — all in one beautiful dashboard.',
            highlights: ['Daily, monthly & yearly revenue', 'Live running appointments', 'One-click booking link sharing'],
            accent: 'from-primary-500 to-primary-700',
            mockup: <DashboardMockup />,
        },
        {
            id: 'schedules',
            badge: 'Flexible Scheduling',
            title: 'Set your working hours in seconds',
            description:
                'Drag-to-edit weekly schedules with custom slot durations, break times, and per-day pricing. One-click templates for common setups.',
            highlights: ['15 / 30 / 60 min slot durations', 'Custom breaks & pricing per day', 'Copy schedule to multiple days'],
            accent: 'from-purple-500 to-fuchsia-600',
            mockup: <SchedulesMockup />,
        },
        {
            id: 'bookingpage',
            badge: 'Branded Booking Page',
            title: 'Your own customer-facing page',
            description:
                'Get a shareable link with your logo, banner, gallery, and colors. Customers book you directly — no app downloads needed.',
            highlights: ['Upload logo, banner & gallery', 'Custom brand colors', 'Direct link: yourname.bookingdeo.com'],
            accent: 'from-emerald-500 to-teal-600',
            mockup: <BookingPageMockup />,
        },
        {
            id: 'payments',
            badge: 'Secure Payments',
            title: 'Accept payments online',
            description:
                'Pluggable payment gateway with encrypted credentials, automatic booking confirmation, and 10-minute slot locking to prevent double bookings.',
            highlights: ['Pluggable payment gateways', 'Auto-confirm on successful capture', 'Slot locking to prevent conflicts'],
            accent: 'from-amber-500 to-orange-600',
            mockup: <PaymentMockup />,
        },
        {
            id: 'customers',
            badge: 'Customer CRM',
            title: 'Know every customer personally',
            description:
                'Automatic customer profiles with booking history, total spend, and lifetime value. Search, filter, and sort in seconds.',
            highlights: ['Complete booking history', 'Total spend per customer', 'Search by name, phone, or email'],
            accent: 'from-pink-500 to-rose-600',
            mockup: <CustomersMockup />,
        },
        {
            id: 'sales',
            badge: 'Sales Analytics',
            title: 'Know exactly what you earned',
            description:
                'Revenue reports with interactive charts, date filtering, and daily/weekly/monthly breakdowns. Export-ready insights.',
            highlights: ['Interactive revenue charts', 'Custom date range filtering', 'Average per booking metrics'],
            accent: 'from-blue-500 to-indigo-600',
            mockup: <SalesMockup />,
        },
        {
            id: 'campaigns',
            badge: 'Marketing Campaigns',
            title: 'Bring customers back with SMS & email',
            description:
                'Send promotional messages to your entire customer base with one click. Target SMS, Email, or both channels simultaneously.',
            highlights: ['Bulk SMS & Email campaigns', 'Customer reach preview', 'Delivery & failure tracking'],
            accent: 'from-violet-500 to-purple-600',
            mockup: <CampaignsMockup />,
        },
    ];

    const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
    const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(next, 6000);
        return () => clearInterval(timer);
    }, [next, isPaused]);

    return (
        <section id="demo" className="py-24 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-white via-ink-50/30 to-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-14">
                    <p className="eyebrow mb-4">Product tour</p>
                    <h2 className="text-4xl sm:text-5xl font-semibold tracking-[-0.03em] text-ink-900 text-balance mb-5">
                        Every flow, <span className="gradient-text">end to end</span>
                    </h2>
                    <p className="text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed">
                        From scheduling to payments to customer records — every screen in the platform, designed and engineered.
                    </p>
                </div>

                {/* Slider */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="relative overflow-hidden rounded-3xl bg-white shadow-elevated border border-ink-100">
                        <div
                            className="flex transition-transform duration-700 ease-in-out"
                            style={{ transform: `translateX(-${current * 100}%)` }}
                        >
                            {slides.map((slide) => (
                                <div key={slide.id} className="min-w-full">
                                    <div className="grid lg:grid-cols-2 gap-0">
                                        {/* Text content */}
                                        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                                            <div className={`inline-flex items-center self-start gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${slide.accent} text-white text-xs font-semibold mb-5 shadow-md`}>
                                                <Star className="w-3.5 h-3.5" />
                                                {slide.badge}
                                            </div>
                                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                                                {slide.title}
                                            </h3>
                                            <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6">
                                                {slide.description}
                                            </p>
                                            <ul className="space-y-3">
                                                {slide.highlights.map((h, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <div className={`mt-0.5 w-5 h-5 rounded-full bg-gradient-to-r ${slide.accent} flex items-center justify-center flex-shrink-0`}>
                                                            <CheckCircle className="w-3 h-3 text-white" />
                                                        </div>
                                                        <span className="text-slate-700 font-medium">{h}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Mockup */}
                                        <div className={`relative p-6 sm:p-10 bg-gradient-to-br ${slide.accent} flex items-center justify-center min-h-[380px] lg:min-h-[520px]`}>
                                            {/* Decorative blobs */}
                                            <div className="absolute top-8 left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                            <div className="absolute bottom-8 right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                            <div className="relative w-full max-w-md">
                                                {slide.mockup}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Arrow controls */}
                        <button
                            onClick={prev}
                            aria-label="Previous slide"
                            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white shadow-lg hover:shadow-xl rounded-full flex items-center justify-center transition-all hover:scale-110 border border-slate-200"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-700" />
                        </button>
                        <button
                            onClick={next}
                            aria-label="Next slide"
                            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white shadow-lg hover:shadow-xl rounded-full flex items-center justify-center transition-all hover:scale-110 border border-slate-200"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-700" />
                        </button>
                    </div>

                    {/* Dot indicators */}
                    <div className="flex justify-center gap-2 mt-8">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    i === current
                                        ? 'w-10 bg-primary-600'
                                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-6 max-w-xs mx-auto h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            key={current}
                            className={`h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full ${
                                !isPaused ? 'animate-progress' : ''
                            }`}
                            style={{
                                animation: !isPaused ? 'progress 6s linear' : 'none',
                            }}
                        />
                    </div>

                    {/* Slide label */}
                    <p className="text-center mt-4 text-sm text-slate-500">
                        <span className="font-semibold text-slate-700">{current + 1}</span>
                        <span className="mx-2">/</span>
                        <span>{slides.length}</span>
                        <span className="mx-3">•</span>
                        <span className="text-slate-600">{slides[current].badge}</span>
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </section>
    );
}

/* ================== MOCKUP SCREENS ================== */

function DashboardMockup() {
    return (
        <div className="bg-white rounded-2xl shadow-2xl p-5 border border-white/50">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <p className="text-xs text-slate-400 font-medium">Welcome back</p>
                    <p className="text-sm font-bold text-slate-900">Acme Studio</p>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-emerald-600 font-semibold">LIVE</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-3">
                    <DollarSign className="w-4 h-4 text-primary-600 mb-1" />
                    <p className="text-[10px] text-slate-600">Today</p>
                    <p className="text-base font-bold text-slate-900">$420</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3">
                    <TrendingUp className="w-4 h-4 text-emerald-600 mb-1" />
                    <p className="text-[10px] text-slate-600">Month</p>
                    <p className="text-base font-bold text-slate-900">$8.7K</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3">
                    <Calendar className="w-4 h-4 text-purple-600 mb-1" />
                    <p className="text-[10px] text-slate-600">Bookings</p>
                    <p className="text-base font-bold text-slate-900">47</p>
                </div>
            </div>

            <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">Active Now</p>
                <span className="text-[10px] text-slate-500">3 running</span>
            </div>
            <div className="space-y-1.5">
                {[
                    { name: 'Sarah Khan', time: '10:00 AM', status: 'Running' },
                    { name: 'Daniel Park', time: '10:30 AM', status: 'Confirmed' },
                    { name: 'Nadia Islam', time: '11:00 AM', status: 'Confirmed' },
                ].map((apt, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg p-2.5">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[10px] font-bold">
                                {apt.name[0]}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-900">{apt.name}</p>
                                <p className="text-[10px] text-slate-500">{apt.time}</p>
                            </div>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                            apt.status === 'Running' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>{apt.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SchedulesMockup() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
        <div className="bg-white rounded-2xl shadow-2xl p-4 border border-white/50">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-slate-900">Weekly Schedule</p>
                <div className="flex items-center gap-1 text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" /> 30 min slots
                </div>
            </div>
            <div className="grid grid-cols-6 gap-1 mb-2">
                {days.map((d) => (
                    <div key={d} className="text-center text-[10px] font-semibold text-slate-500">{d}</div>
                ))}
            </div>
            <div className="space-y-1">
                {['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM'].map((time, ti) => (
                    <div key={time} className="flex items-center gap-1">
                        <div className="w-8 text-[9px] text-slate-400 font-medium">{time}</div>
                        <div className="flex-1 grid grid-cols-6 gap-1">
                            {days.map((d, di) => {
                                const isBreak = ti === 4; // Lunch
                                const isBooked = [1, 3, 5, 7].includes(ti) && [0, 2, 4].includes(di);
                                return (
                                    <div
                                        key={di}
                                        className={`h-5 rounded ${
                                            isBreak
                                                ? 'bg-amber-100 border border-amber-200'
                                                : isBooked
                                                ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500'
                                                : 'bg-emerald-100 border border-emerald-200'
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-400" />Available</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-purple-500" />Booked</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-amber-300" />Break</span>
                </div>
                <span className="text-[10px] text-slate-600 font-semibold">96 slots/week</span>
            </div>
        </div>
    );
}

function BookingPageMockup() {
    return (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/50">
            <div className="h-20 bg-gradient-to-r from-emerald-400 to-teal-600 relative">
                <div className="absolute -bottom-6 left-4 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center border-2 border-white">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                </div>
            </div>
            <div className="pt-8 px-4 pb-4">
                <p className="text-sm font-bold text-slate-900">Elegant Spa & Salon</p>
                <p className="text-[10px] text-slate-500 mb-3">Premium beauty treatments</p>

                <div className="flex items-center gap-3 text-[10px] text-slate-600 mb-3">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />+1 (415) 555</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />New York</span>
                </div>

                <p className="text-[10px] font-semibold text-slate-700 mb-2">Select a date</p>
                <div className="grid grid-cols-7 gap-1 mb-3">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div
                            key={i}
                            className={`text-center py-1.5 rounded text-[10px] font-semibold ${
                                i === 3 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 'bg-slate-50 text-slate-600'
                            }`}
                        >
                            <div>{d}</div>
                            <div className="text-[9px]">{i + 10}</div>
                        </div>
                    ))}
                </div>

                <p className="text-[10px] font-semibold text-slate-700 mb-2">Available times</p>
                <div className="grid grid-cols-3 gap-1.5">
                    {['10:00', '10:30', '11:00', '11:30', '12:00', '2:00'].map((t, i) => (
                        <div
                            key={t}
                            className={`text-center py-1.5 rounded text-[10px] font-semibold border ${
                                i === 1
                                    ? 'bg-emerald-500 text-white border-emerald-500'
                                    : 'bg-white border-slate-200 text-slate-700'
                            }`}
                        >
                            {t}
                        </div>
                    ))}
                </div>

                <button className="w-full mt-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-lg">
                    Book now — $90
                </button>
            </div>
        </div>
    );
}

function PaymentMockup() {
    return (
        <div className="bg-white rounded-2xl shadow-2xl p-5 border border-white/50">
            <div className="text-center mb-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-2">
                    <CreditCard className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-bold text-slate-900">Secure payment</p>
                <p className="text-[10px] text-slate-500">256-bit encrypted checkout</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 mb-3 space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Appointment</span>
                    <span className="font-semibold text-slate-900">Hair Treatment</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Date</span>
                    <span className="font-semibold text-slate-900">Apr 20, 10:30 AM</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-900 font-semibold text-sm">Total</span>
                    <span className="text-amber-600 font-bold text-lg">$120</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-3">
                {['Visa', 'MC', 'Amex', 'Apple Pay', 'Google', 'PayPal'].map((m) => (
                    <div key={m} className="bg-white border border-slate-200 rounded-lg py-2 text-center text-[10px] font-semibold text-slate-700">
                        {m}
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-emerald-600 bg-emerald-50 rounded-lg p-2 mb-3">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="font-semibold">256-bit SSL encrypted • PCI compliant</span>
            </div>

            <button className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold rounded-lg">
                Pay $120 securely
            </button>

            <div className="flex items-center justify-center gap-1 mt-2 text-[9px] text-slate-500">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Slot locked for 10 minutes</span>
            </div>
        </div>
    );
}

function CustomersMockup() {
    const customers = [
        { name: 'Sarah Khan', phone: '+1 (415) 555-0142', visits: 12, spent: '$1,850', color: 'from-pink-400 to-rose-600' },
        { name: 'Daniel Park', phone: '+1 (212) 555-0163', visits: 8, spent: '$1,200', color: 'from-blue-400 to-indigo-600' },
        { name: 'Nadia Islam', phone: '+1 (650) 555-0184', visits: 15, spent: '$2,475', color: 'from-emerald-400 to-teal-600' },
        { name: 'Marcus Johnson', phone: '+1 (312) 555-0125', visits: 5, spent: '$750', color: 'from-amber-400 to-orange-600' },
    ];
    return (
        <div className="bg-white rounded-2xl shadow-2xl p-4 border border-white/50">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-slate-900">Customers</p>
                <span className="text-[10px] text-pink-600 font-semibold bg-pink-50 px-2 py-1 rounded">1,247 total</span>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-slate-400" />
                <span className="text-[10px] text-slate-500">Search by name or phone...</span>
            </div>
            <div className="space-y-2">
                {customers.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-bold`}>
                            {c.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{c.name}</p>
                            <p className="text-[10px] text-slate-500">{c.phone}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-900">{c.spent}</p>
                            <p className="text-[10px] text-slate-500">{c.visits} visits</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SalesMockup() {
    const bars = [40, 65, 50, 80, 95, 70, 85];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return (
        <div className="bg-white rounded-2xl shadow-2xl p-4 border border-white/50">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-sm font-bold text-slate-900">Sales Report</p>
                    <p className="text-[10px] text-slate-500">Last 7 days</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500">Total Revenue</p>
                    <p className="text-lg font-bold text-blue-600">$12,450</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-[9px] text-slate-500">Bookings</p>
                    <p className="text-sm font-bold text-slate-900">83</p>
                    <p className="text-[9px] text-emerald-600 font-semibold">↑ 12%</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-2">
                    <p className="text-[9px] text-slate-500">Avg/Day</p>
                    <p className="text-sm font-bold text-slate-900">$1,780</p>
                    <p className="text-[9px] text-emerald-600 font-semibold">↑ 8%</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-2">
                    <p className="text-[9px] text-slate-500">Per Booking</p>
                    <p className="text-sm font-bold text-slate-900">$150</p>
                    <p className="text-[9px] text-emerald-600 font-semibold">↑ 3%</p>
                </div>
            </div>

            <div className="h-36 flex items-end justify-between gap-2 px-1">
                {bars.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                            className={`w-full rounded-t-lg transition-all ${
                                i === 4 ? 'bg-gradient-to-t from-blue-500 to-indigo-500' : 'bg-gradient-to-t from-blue-200 to-indigo-200'
                            }`}
                            style={{ height: `${h}%` }}
                        />
                        <span className="text-[9px] text-slate-500 font-medium">{days[i]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CampaignsMockup() {
    return (
        <div className="bg-white rounded-2xl shadow-2xl p-4 border border-white/50">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-slate-900">New Campaign</p>
                <div className="flex gap-1">
                    <span className="text-[9px] px-2 py-1 rounded bg-violet-100 text-violet-700 font-semibold">SMS</span>
                    <span className="text-[9px] px-2 py-1 rounded bg-purple-500 text-white font-semibold">SMS + Email</span>
                </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 mb-3">
                <p className="text-[10px] text-slate-500 mb-1">Title</p>
                <p className="text-xs font-semibold text-slate-900 mb-2">Weekend 20% Discount</p>
                <p className="text-[10px] text-slate-500 mb-1">Message</p>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                    Hi! Enjoy 20% off on all services this weekend. Book now at elegant-spa.bookingdeo.com
                </p>
                <div className="flex justify-end mt-2 text-[9px] text-slate-400">142 / 160 chars</div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center bg-violet-50 rounded-lg p-2">
                    <MessageSquare className="w-4 h-4 text-violet-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-slate-900">1,247</p>
                    <p className="text-[9px] text-slate-500">Reach</p>
                </div>
                <div className="text-center bg-purple-50 rounded-lg p-2">
                    <Phone className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-slate-900">1,180</p>
                    <p className="text-[9px] text-slate-500">With Phone</p>
                </div>
                <div className="text-center bg-pink-50 rounded-lg p-2">
                    <Mail className="w-4 h-4 text-pink-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-slate-900">894</p>
                    <p className="text-[9px] text-slate-500">With Email</p>
                </div>
            </div>

            <button className="w-full py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-lg">
                Send to 1,247 Customers
            </button>
        </div>
    );
}
