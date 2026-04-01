'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Phone, Mail } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

type ContactMethod = 'phone' | 'email';

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [contactMethod, setContactMethod] = useState<ContactMethod>('phone');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (contactMethod === 'phone' && !formData.phone) {
            setError('Phone number is required');
            return;
        }

        if (contactMethod === 'email' && !formData.email) {
            setError('Email is required');
            return;
        }

        setLoading(true);

        try {
            const payload: any = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                password: formData.password,
            };

            if (contactMethod === 'phone') {
                payload.phone = formData.phone;
            } else {
                payload.email = formData.email;
            }

            const response = await api.post('/auth/signup', payload);

            login(response.data.token, response.data.user, response.data.tenant);

            // New signup flow: redirect to onboarding (no tenant yet)
            router.push('/onboarding');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-6 animate-fade-in">
                    <Link href="/" className="inline-flex items-center space-x-2 mb-4">
                        <Calendar className="w-9 h-9 text-primary-600" />
                        <span className="text-2xl font-bold gradient-text">BookEase</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800 mb-1">Create Account</h1>
                    <p className="text-sm text-slate-600">Start managing appointments today</p>
                </div>

                <div className="card animate-slide-up">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name fields - side by side */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="label">First Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="label">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        {/* Contact method toggle */}
                        <div>
                            <label className="label mb-2">Sign up with</label>
                            <div className="flex rounded-xl bg-slate-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => setContactMethod('phone')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                        contactMethod === 'phone'
                                            ? 'bg-white text-primary-700 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <Phone className="w-4 h-4" />
                                    Phone
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setContactMethod('email')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                        contactMethod === 'email'
                                            ? 'bg-white text-primary-700 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <Mail className="w-4 h-4" />
                                    Email
                                </button>
                            </div>
                        </div>

                        {/* Phone or Email field */}
                        {contactMethod === 'phone' ? (
                            <div>
                                <label className="label">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    className="input-field"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="01XXXXXXXXX"
                                    pattern="01[3-9][0-9]{8}"
                                    inputMode="numeric"
                                />
                                <p className="text-xs text-slate-400 mt-1">Bangladesh mobile number</p>
                            </div>
                        ) : (
                            <div>
                                <label className="label">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="input-field"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="you@example.com"
                                    inputMode="email"
                                />
                            </div>
                        )}

                        <div>
                            <label className="label">Password</label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="label">Confirm Password</label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-5 text-center">
                        <p className="text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
