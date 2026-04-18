'use client';

import Link from 'next/link';
import {
    Calendar, Clock, Shield, Zap, Users, Globe, CreditCard,
    ArrowRight, CheckCircle, Star, Smartphone, BarChart3
} from 'lucide-react';
import FeatureShowcase from './FeatureShowcase';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">BookEase</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <a href="#features" className="hidden sm:inline-block text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-50">
                            Features
                        </a>
                        <a href="#how-it-works" className="hidden sm:inline-block text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-50">
                            How It Works
                        </a>
                        <a href="#demo" className="hidden md:inline-block text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-50">
                            Demo
                        </a>
                        <a href="#pricing" className="hidden md:inline-block text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-50">
                            Pricing
                        </a>
                        <Link href="/login" className="text-sm text-slate-700 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                            Login
                        </Link>
                        <Link href="/register" className="btn-primary !text-sm !px-4 !py-2">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
                {/* Subtle background */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 to-white -z-10" />
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl -z-10" />
                <div className="absolute top-40 right-1/4 w-96 h-96 bg-secondary-100/20 rounded-full blur-3xl -z-10" />

                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto animate-fade-in">
                        {/* Badge */}
                        <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 mb-8">
                            <Zap className="w-3.5 h-3.5 text-primary-600" />
                            <span className="text-xs font-semibold text-primary-700">The #1 Booking Platform for Small Businesses</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] tracking-tight text-slate-900">
                            Turn Visitors Into{' '}
                            <span className="gradient-text">Booked Appointments</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Give your business a professional booking page in minutes. Accept appointments, collect payments, and grow — all in one place.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-12">
                            <Link href="/register" className="btn-primary text-base px-7 py-3.5 flex items-center justify-center space-x-2">
                                <span>Start Free — No Card Needed</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a href="#how-it-works" className="btn-secondary text-base px-7 py-3.5">
                                See How It Works
                            </a>
                        </div>

                        {/* Social proof */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
                            <div className="flex items-center space-x-2">
                                <div className="flex -space-x-2">
                                    {['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'].map((color, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: color }}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                    ))}
                                </div>
                                <span className="font-medium text-slate-600">500+ businesses</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                ))}
                                <span className="ml-1 font-medium text-slate-600">4.9/5 rating</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero visual - mock booking interface */}
                    <div className="mt-16 sm:mt-20 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="bg-white rounded-2xl shadow-float border border-slate-200/80 overflow-hidden">
                            {/* Browser chrome */}
                            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center space-x-2">
                                <div className="flex space-x-1.5">
                                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                                    <div className="w-3 h-3 rounded-full bg-slate-300" />
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
                                        <div className="h-4 w-40 bg-primary-100 rounded-full mb-3" />
                                        <div className="h-3 w-56 bg-slate-100 rounded-full mb-6" />
                                        <div className="flex gap-2 mb-4">
                                            {['Mon', 'Tue', 'Wed', 'Thu'].map((day, i) => (
                                                <div key={day} className={`w-14 py-3 rounded-xl text-center text-xs font-semibold ${i === 1 ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                                                    <div className="opacity-70">{day}</div>
                                                    <div className="text-base font-bold mt-0.5">{10 + i}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['9:00', '9:30', '10:00', '10:30', '11:00', '11:30'].map((time, i) => (
                                                <div key={time} className={`py-2 rounded-lg text-center text-xs font-semibold ${i === 2 ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                                                    {time}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <div className="bg-primary-50/70 rounded-xl p-4 mb-4 border border-primary-100">
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
                                            <div className="h-11 bg-primary-600 rounded-lg flex items-center justify-center">
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

            {/* Stats strip */}
            <section className="py-12 sm:py-16 px-4 sm:px-6 border-y border-slate-100">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '500+', label: 'Active Businesses' },
                            { value: '50K+', label: 'Bookings Made' },
                            { value: '99.9%', label: 'Uptime' },
                            { value: '4.9', label: 'User Rating' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <p className="text-3xl sm:text-4xl font-bold text-slate-900">{stat.value}</p>
                                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 sm:py-28 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14 sm:mb-20">
                        <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">Features</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                            Everything You Need to <span className="gradient-text">Grow</span>
                        </h2>
                        <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-lg">
                            A complete booking solution designed for service businesses of all sizes.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Calendar,
                                color: 'bg-primary-50 text-primary-600',
                                title: 'Smart Scheduling',
                                desc: 'Set your working hours, break times, and slot durations. Customers only see available times.',
                            },
                            {
                                icon: CreditCard,
                                color: 'bg-emerald-50 text-emerald-600',
                                title: 'Online Payments',
                                desc: 'Accept payments via SSLCommerz. Get paid upfront when customers book appointments.',
                            },
                            {
                                icon: Globe,
                                color: 'bg-secondary-50 text-secondary-600',
                                title: 'Custom Booking Page',
                                desc: 'Get your own branded booking page with logo, banner, gallery, and contact details.',
                            },
                            {
                                icon: Smartphone,
                                color: 'bg-pink-50 text-pink-600',
                                title: 'Mobile Friendly',
                                desc: 'Beautiful responsive design. Your customers can book from any device, anywhere.',
                            },
                            {
                                icon: Shield,
                                color: 'bg-amber-50 text-amber-600',
                                title: 'Secure & Reliable',
                                desc: 'Enterprise-grade security with encrypted credentials and isolated tenant data.',
                            },
                            {
                                icon: BarChart3,
                                color: 'bg-cyan-50 text-cyan-600',
                                title: 'Dashboard & Analytics',
                                desc: 'Track your appointments, payments, and business performance at a glance.',
                            },
                        ].map((feature, i) => (
                            <div key={feature.title} className="card-hover group p-6">
                                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14 sm:mb-20">
                        <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">How It Works</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                            Up and Running in <span className="gradient-text">3 Steps</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
                        {[
                            {
                                step: '1',
                                title: 'Create Your Account',
                                desc: 'Sign up in 30 seconds. Add your business name and get your own subdomain instantly.',
                                icon: Users,
                            },
                            {
                                step: '2',
                                title: 'Set Up Schedules',
                                desc: 'Configure your working days, time slots, prices, and customize your booking page.',
                                icon: Clock,
                            },
                            {
                                step: '3',
                                title: 'Share & Accept Bookings',
                                desc: 'Share your booking link. Customers pick a slot, pay online, and you\'re all set.',
                                icon: Calendar,
                            },
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="relative inline-flex items-center justify-center mb-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-card flex items-center justify-center border border-slate-100">
                                        <item.icon className="w-7 h-7 text-primary-600" />
                                    </div>
                                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Showcase Slider */}
            <FeatureShowcase />

            {/* Testimonials */}
            <section className="py-20 sm:py-28 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14 sm:mb-20">
                        <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">Testimonials</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                            Loved by <span className="gradient-text">Business Owners</span>
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                name: 'Dr. Rahim Ahmed',
                                role: 'Dental Clinic Owner',
                                text: 'BookEase transformed how we manage patient appointments. No more phone tag — patients book online and pay upfront.',
                                initial: 'R',
                                color: 'bg-blue-100 text-blue-700',
                            },
                            {
                                name: 'Fatima Khatun',
                                role: 'Salon Owner',
                                text: 'Setting up took 5 minutes. My customers love the clean booking page and I love seeing payments come in automatically.',
                                initial: 'F',
                                color: 'bg-purple-100 text-purple-700',
                            },
                            {
                                name: 'Tanvir Hasan',
                                role: 'Photography Studio',
                                text: 'The custom page feature is amazing. I added my portfolio gallery and it doubled my bookings within a month.',
                                initial: 'T',
                                color: 'bg-emerald-100 text-emerald-700',
                            },
                        ].map((testimonial) => (
                            <div key={testimonial.name} className="card p-6">
                                <div className="flex items-center space-x-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-6 text-sm">"{testimonial.text}"</p>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 ${testimonial.color} rounded-full flex items-center justify-center`}>
                                        <span className="font-bold text-sm">{testimonial.initial}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{testimonial.name}</p>
                                        <p className="text-xs text-slate-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14 sm:mb-20">
                        <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">Pricing</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                            Simple, <span className="gradient-text">Transparent</span> Pricing
                        </h2>
                        <p className="text-slate-500 mt-4 max-w-xl mx-auto">
                            Start free. Upgrade when you need more.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Free */}
                        <div className="card text-center p-8">
                            <h3 className="text-lg font-semibold text-slate-800 mb-1">Starter</h3>
                            <p className="text-sm text-slate-500 mb-6">For getting started</p>
                            <p className="text-4xl font-bold text-slate-900 mb-1">Free</p>
                            <p className="text-sm text-slate-500 mb-8">forever</p>
                            <ul className="text-sm text-slate-600 space-y-3 mb-8 text-left">
                                {['Custom booking page', 'Up to 50 bookings/month', 'Email notifications', 'Basic dashboard'].map((f) => (
                                    <li key={f} className="flex items-center space-x-2.5">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register" className="btn-secondary w-full text-center block">
                                Get Started
                            </Link>
                        </div>

                        {/* Pro - Highlighted */}
                        <div className="card text-center p-8 relative border-2 !border-primary-500 shadow-float">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="bg-primary-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                                    Most Popular
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-1 mt-1">Professional</h3>
                            <p className="text-sm text-slate-500 mb-6">For growing businesses</p>
                            <p className="text-4xl font-bold text-slate-900 mb-1">৳999</p>
                            <p className="text-sm text-slate-500 mb-8">/month</p>
                            <ul className="text-sm text-slate-600 space-y-3 mb-8 text-left">
                                {['Everything in Starter', 'Unlimited bookings', 'Online payment collection', 'Custom branding & gallery', 'Priority support'].map((f) => (
                                    <li key={f} className="flex items-center space-x-2.5">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register" className="btn-primary w-full text-center block">
                                Start Free Trial
                            </Link>
                        </div>

                        {/* Enterprise */}
                        <div className="card text-center p-8">
                            <h3 className="text-lg font-semibold text-slate-800 mb-1">Enterprise</h3>
                            <p className="text-sm text-slate-500 mb-6">For large organizations</p>
                            <p className="text-4xl font-bold text-slate-900 mb-1">Custom</p>
                            <p className="text-sm text-slate-500 mb-8">contact us</p>
                            <ul className="text-sm text-slate-600 space-y-3 mb-8 text-left">
                                {['Everything in Professional', 'Multiple staff members', 'API access', 'Custom integrations', 'Dedicated support'].map((f) => (
                                    <li key={f} className="flex items-center space-x-2.5">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
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
            <section className="py-20 sm:py-28 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto rounded-3xl bg-slate-900 text-white p-10 sm:p-16 text-center relative overflow-hidden">
                    {/* Subtle pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-secondary-900/20" />

                    <div className="relative">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Ready to Simplify Your Bookings?
                        </h2>
                        <p className="text-lg mb-8 text-slate-300 max-w-xl mx-auto">
                            Join hundreds of businesses who save hours every week. Set up your booking page in minutes.
                        </p>
                        <Link href="/register" className="inline-flex items-center justify-center space-x-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold text-base hover:bg-slate-100 active:scale-[0.98] transition-all duration-200">
                            <span>Get Started Free</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <p className="text-sm text-slate-400 mt-4">No credit card required. Set up in under 2 minutes.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-14 sm:py-16 px-4 sm:px-6 border-t border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-lg font-bold text-slate-900">BookEase</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                The simplest way to accept online bookings and payments for your business.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-800 mb-3 text-sm">Product</h4>
                            <ul className="text-sm text-slate-500 space-y-2.5">
                                <li><a href="#features" className="hover:text-slate-700 transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-slate-700 transition-colors">Pricing</a></li>
                                <li><a href="#how-it-works" className="hover:text-slate-700 transition-colors">How It Works</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-800 mb-3 text-sm">Company</h4>
                            <ul className="text-sm text-slate-500 space-y-2.5">
                                <li><a href="#" className="hover:text-slate-700 transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-slate-700 transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-slate-700 transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-800 mb-3 text-sm">Legal</h4>
                            <ul className="text-sm text-slate-500 space-y-2.5">
                                <li><a href="#" className="hover:text-slate-700 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-slate-700 transition-colors">Terms of Service</a></li>
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
