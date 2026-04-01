'use client';

import Link from 'next/link';
import {
    Calendar, Clock, Shield, Zap, Users, Globe, CreditCard,
    ArrowRight, CheckCircle, Star, Smartphone, BarChart3
} from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <span className="text-lg sm:text-2xl font-bold gradient-text">BookEase</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <a href="#features" className="hidden sm:inline-block text-sm text-slate-600 hover:text-primary-600 font-medium transition-colors px-3 py-2">
                            Features
                        </a>
                        <a href="#how-it-works" className="hidden sm:inline-block text-sm text-slate-600 hover:text-primary-600 font-medium transition-colors px-3 py-2">
                            How It Works
                        </a>
                        <a href="#pricing" className="hidden sm:inline-block text-sm text-slate-600 hover:text-primary-600 font-medium transition-colors px-3 py-2">
                            Pricing
                        </a>
                        <Link href="/login" className="text-sm sm:text-base text-slate-700 font-semibold px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
                            Login
                        </Link>
                        <Link href="/register" className="btn-primary !text-sm sm:!text-base !px-4 sm:!px-6 !py-2 sm:!py-2.5 !shadow-md">
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary-100/40 via-secondary-100/30 to-transparent rounded-full blur-3xl -z-10" />
                <div className="absolute top-40 right-0 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl -z-10" />
                <div className="absolute top-60 left-0 w-72 h-72 bg-secondary-200/20 rounded-full blur-3xl -z-10" />

                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto animate-fade-in">
                        {/* Badge */}
                        <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-200 rounded-full px-4 py-1.5 mb-6 sm:mb-8">
                            <Zap className="w-4 h-4 text-primary-600" />
                            <span className="text-sm font-semibold text-primary-700">The #1 Booking Platform for Small Businesses</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                            <span className="text-slate-900">Turn Visitors Into</span>
                            <br />
                            <span className="gradient-text">Booked Appointments</span>
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
                            Give your business a professional booking page in minutes. Accept appointments, collect payments, and grow your business — all in one place.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-10 sm:mb-14">
                            <Link href="/register" className="btn-primary text-base sm:text-lg px-7 sm:px-8 py-3.5 sm:py-4 flex items-center justify-center space-x-2">
                                <span>Start Free — No Card Needed</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a href="#how-it-works" className="btn-secondary text-base sm:text-lg px-7 sm:px-8 py-3.5 sm:py-4">
                                See How It Works
                            </a>
                        </div>

                        {/* Social proof */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-500">
                            <div className="flex items-center space-x-1">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 border-2 border-white flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">{String.fromCharCode(64 + i)}</span>
                                        </div>
                                    ))}
                                </div>
                                <span className="ml-2 font-medium">500+ businesses</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                ))}
                                <span className="ml-1 font-medium">4.9/5 rating</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero visual - mock booking interface */}
                    <div className="mt-14 sm:mt-20 max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                            {/* Browser chrome */}
                            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center space-x-2">
                                <div className="flex space-x-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="bg-white rounded-lg px-4 py-1.5 text-sm text-slate-400 border border-slate-200 w-64 sm:w-80 text-center">
                                        yourbusiness.bookease.com
                                    </div>
                                </div>
                            </div>
                            {/* Mock content */}
                            <div className="p-6 sm:p-8">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <div className="h-4 w-40 bg-gradient-to-r from-primary-200 to-primary-100 rounded-full mb-3" />
                                        <div className="h-3 w-56 bg-slate-100 rounded-full mb-6" />
                                        <div className="flex gap-2 mb-4">
                                            {['Mon', 'Tue', 'Wed', 'Thu'].map((day, i) => (
                                                <div key={day} className={`w-14 py-3 rounded-xl text-center text-xs font-semibold ${i === 1 ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                                                    <div className="opacity-70">{day}</div>
                                                    <div className="text-base font-bold mt-0.5">{10 + i}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['9:00', '9:30', '10:00', '10:30', '11:00', '11:30'].map((time, i) => (
                                                <div key={time} className={`py-2 rounded-lg text-center text-xs font-semibold ${i === 2 ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                                                    {time}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <div className="bg-primary-50 rounded-xl p-4 mb-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <CheckCircle className="w-5 h-5 text-primary-600" />
                                                <span className="font-semibold text-sm text-slate-800">Booking Summary</span>
                                            </div>
                                            <div className="text-sm text-slate-600 space-y-1">
                                                <p>Tuesday, March 11</p>
                                                <p className="font-semibold text-primary-700">10:00 AM</p>
                                                <p className="text-lg font-bold text-primary-700 mt-2">৳500</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-10 bg-slate-50 rounded-lg border border-slate-200" />
                                            <div className="h-10 bg-slate-50 rounded-lg border border-slate-200" />
                                            <div className="h-11 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                                                <span className="text-white text-sm font-semibold">Confirm & Pay ৳500</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted by / Stats strip */}
            <section className="py-10 sm:py-14 px-4 sm:px-6 bg-white border-y border-slate-100">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
                        <div>
                            <p className="text-3xl sm:text-4xl font-extrabold gradient-text">500+</p>
                            <p className="text-sm text-slate-500 mt-1 font-medium">Active Businesses</p>
                        </div>
                        <div>
                            <p className="text-3xl sm:text-4xl font-extrabold gradient-text">50K+</p>
                            <p className="text-sm text-slate-500 mt-1 font-medium">Bookings Made</p>
                        </div>
                        <div>
                            <p className="text-3xl sm:text-4xl font-extrabold gradient-text">99.9%</p>
                            <p className="text-sm text-slate-500 mt-1 font-medium">Uptime</p>
                        </div>
                        <div>
                            <p className="text-3xl sm:text-4xl font-extrabold gradient-text">4.9</p>
                            <p className="text-sm text-slate-500 mt-1 font-medium">User Rating</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16">
                        <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">Features</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 text-slate-900">
                            Everything You Need to <span className="gradient-text">Grow</span>
                        </h2>
                        <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-base sm:text-lg">
                            A complete booking solution designed for service businesses of all sizes.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                icon: Calendar,
                                gradient: 'from-primary-500 to-primary-600',
                                title: 'Smart Scheduling',
                                desc: 'Set your working hours, break times, and slot durations. Customers only see available times.',
                            },
                            {
                                icon: CreditCard,
                                gradient: 'from-green-500 to-emerald-600',
                                title: 'Online Payments',
                                desc: 'Accept payments via SSLCommerz. Get paid upfront when customers book appointments.',
                            },
                            {
                                icon: Globe,
                                gradient: 'from-secondary-500 to-secondary-600',
                                title: 'Custom Booking Page',
                                desc: 'Get your own branded booking page with logo, banner, gallery, and contact details.',
                            },
                            {
                                icon: Smartphone,
                                gradient: 'from-pink-500 to-rose-600',
                                title: 'Mobile Friendly',
                                desc: 'Beautiful responsive design. Your customers can book from any device, anywhere.',
                            },
                            {
                                icon: Shield,
                                gradient: 'from-amber-500 to-orange-600',
                                title: 'Secure & Reliable',
                                desc: 'Enterprise-grade security with encrypted credentials and isolated tenant data.',
                            },
                            {
                                icon: BarChart3,
                                gradient: 'from-cyan-500 to-blue-600',
                                title: 'Dashboard & Analytics',
                                desc: 'Track your appointments, payments, and business performance at a glance.',
                            },
                        ].map((feature, i) => (
                            <div key={feature.title} className="card group animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16">
                        <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">How It Works</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 text-slate-900">
                            Up and Running in <span className="gradient-text">3 Steps</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 sm:gap-10">
                        {[
                            {
                                step: '01',
                                title: 'Create Your Account',
                                desc: 'Sign up in 30 seconds. Add your business name and get your own subdomain instantly.',
                                icon: Users,
                            },
                            {
                                step: '02',
                                title: 'Set Up Schedules',
                                desc: 'Configure your working days, time slots, prices, and customize your booking page.',
                                icon: Clock,
                            },
                            {
                                step: '03',
                                title: 'Share & Accept Bookings',
                                desc: 'Share your booking link. Customers pick a slot, pay online, and you\'re all set.',
                                icon: Calendar,
                            },
                        ].map((item, i) => (
                            <div key={item.step} className="text-center animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
                                <div className="relative inline-flex items-center justify-center mb-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center">
                                        <item.icon className="w-9 h-9 text-primary-600" />
                                    </div>
                                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 sm:py-24 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16">
                        <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">Testimonials</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 text-slate-900">
                            Loved by <span className="gradient-text">Business Owners</span>
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                name: 'Dr. Rahim Ahmed',
                                role: 'Dental Clinic Owner',
                                text: 'BookEase transformed how we manage patient appointments. No more phone tag — patients book online and pay upfront.',
                            },
                            {
                                name: 'Fatima Khatun',
                                role: 'Salon Owner',
                                text: 'Setting up took 5 minutes. My customers love the clean booking page and I love seeing payments come in automatically.',
                            },
                            {
                                name: 'Tanvir Hasan',
                                role: 'Photography Studio',
                                text: 'The custom page feature is amazing. I added my portfolio gallery and it doubled my bookings within a month.',
                            },
                        ].map((testimonial, i) => (
                            <div key={testimonial.name} className="card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="flex items-center space-x-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-5 text-sm sm:text-base">"{testimonial.text}"</p>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">{testimonial.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{testimonial.name}</p>
                                        <p className="text-xs text-slate-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16">
                        <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">Pricing</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 text-slate-900">
                            Simple, <span className="gradient-text">Transparent</span> Pricing
                        </h2>
                        <p className="text-slate-600 mt-4 max-w-xl mx-auto">
                            Start free. Upgrade when you need more.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                        {/* Free */}
                        <div className="card text-center">
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Starter</h3>
                            <p className="text-sm text-slate-500 mb-4">For getting started</p>
                            <p className="text-4xl font-extrabold text-slate-900 mb-1">Free</p>
                            <p className="text-sm text-slate-500 mb-6">forever</p>
                            <ul className="text-sm text-slate-600 space-y-3 mb-8 text-left">
                                {['Custom booking page', 'Up to 50 bookings/month', 'Email notifications', 'Basic dashboard'].map((f) => (
                                    <li key={f} className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register" className="btn-secondary w-full text-center block">
                                Get Started
                            </Link>
                        </div>

                        {/* Pro - Highlighted */}
                        <div className="card text-center relative border-2 !border-primary-500 shadow-2xl shadow-primary-100/50 scale-[1.03]">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                                    Most Popular
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1 mt-2">Professional</h3>
                            <p className="text-sm text-slate-500 mb-4">For growing businesses</p>
                            <p className="text-4xl font-extrabold text-slate-900 mb-1">৳999</p>
                            <p className="text-sm text-slate-500 mb-6">/month</p>
                            <ul className="text-sm text-slate-600 space-y-3 mb-8 text-left">
                                {['Everything in Starter', 'Unlimited bookings', 'Online payment collection', 'Custom branding & gallery', 'Priority support'].map((f) => (
                                    <li key={f} className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register" className="btn-primary w-full text-center block">
                                Start Free Trial
                            </Link>
                        </div>

                        {/* Enterprise */}
                        <div className="card text-center">
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Enterprise</h3>
                            <p className="text-sm text-slate-500 mb-4">For large organizations</p>
                            <p className="text-4xl font-extrabold text-slate-900 mb-1">Custom</p>
                            <p className="text-sm text-slate-500 mb-6">contact us</p>
                            <ul className="text-sm text-slate-600 space-y-3 mb-8 text-left">
                                {['Everything in Professional', 'Multiple staff members', 'API access', 'Custom integrations', 'Dedicated support'].map((f) => (
                                    <li key={f} className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <a href="mailto:hello@bookease.com" className="btn-secondary w-full text-center block">
                                Contact Sales
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-16 sm:py-24 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 text-white p-8 sm:p-14 text-center relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

                    <div className="relative">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6">
                            Ready to Simplify Your Bookings?
                        </h2>
                        <p className="text-lg sm:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                            Join hundreds of businesses who save hours every week. Set up your booking page in minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                            <Link href="/register" className="inline-flex items-center justify-center space-x-2 bg-white text-primary-700 px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-slate-50 transition-all duration-300 transform hover:-translate-y-1 shadow-xl">
                                <span>Get Started Free</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <p className="text-sm text-white/70 mt-4">No credit card required. Set up in under 2 minutes.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 sm:py-16 px-4 sm:px-6 border-t border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-lg font-bold gradient-text">BookEase</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                The simplest way to accept online bookings and payments for your business.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-3 text-sm">Product</h4>
                            <ul className="text-sm text-slate-500 space-y-2">
                                <li><a href="#features" className="hover:text-primary-600 transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-primary-600 transition-colors">Pricing</a></li>
                                <li><a href="#how-it-works" className="hover:text-primary-600 transition-colors">How It Works</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-3 text-sm">Company</h4>
                            <ul className="text-sm text-slate-500 space-y-2">
                                <li><a href="#" className="hover:text-primary-600 transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-3 text-sm">Legal</h4>
                            <ul className="text-sm text-slate-500 space-y-2">
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-100 pt-8 text-center text-sm text-slate-400">
                        <p>&copy; {new Date().getFullYear()} BookEase. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
