'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Check, X, Building2, Globe } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function OnboardingPage() {
    const router = useRouter();
    const { user, isAuthenticated, hasCompletedOnboarding, loading: authLoading, updateOnboarding } = useAuth();

    const [formData, setFormData] = useState({
        businessName: '',
        subdomain: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
    const [checkingSubdomain, setCheckingSubdomain] = useState(false);
    const [subdomainEdited, setSubdomainEdited] = useState(false);

    // Redirect if not authenticated or already onboarded
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
        if (!authLoading && hasCompletedOnboarding) {
            router.push('/dashboard');
        }
    }, [authLoading, isAuthenticated, hasCompletedOnboarding, router]);

    // Auto-generate subdomain from business name
    useEffect(() => {
        if (!subdomainEdited && formData.businessName) {
            const auto = formData.businessName
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .slice(0, 20);
            setFormData(prev => ({ ...prev, subdomain: auto }));
        }
    }, [formData.businessName, subdomainEdited]);

    // Check subdomain availability
    useEffect(() => {
        const checkSubdomain = async () => {
            if (formData.subdomain.length < 3) {
                setSubdomainAvailable(null);
                return;
            }

            if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
                setSubdomainAvailable(false);
                return;
            }

            setCheckingSubdomain(true);
            try {
                const response = await api.get(`/auth/check-subdomain/${formData.subdomain}`);
                setSubdomainAvailable(response.data.available);
            } catch {
                setSubdomainAvailable(true);
            } finally {
                setCheckingSubdomain(false);
            }
        };

        const timer = setTimeout(checkSubdomain, 500);
        return () => clearTimeout(timer);
    }, [formData.subdomain]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.subdomain.length < 3) {
            setError('Subdomain must be at least 3 characters');
            return;
        }

        if (!subdomainAvailable) {
            setError('Please choose an available subdomain');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/onboarding', {
                businessName: formData.businessName,
                subdomain: formData.subdomain,
            });

            updateOnboarding(response.data.token, response.data.user, response.data.tenant);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Setup failed');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse-slow text-primary-600">
                    <Calendar className="w-12 h-12" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-6 animate-fade-in">
                    <div className="inline-flex items-center space-x-2 mb-4">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}>
                            <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-semibold gradient-text tracking-tight">BookingDeo</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-1">Set Up Your Business</h1>
                    <p className="text-sm text-slate-600">
                        Welcome, {user?.firstName}! Let&apos;s get your booking page ready.
                    </p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs text-slate-500">Account</span>
                        <div className="w-8 h-0.5 bg-primary-300"></div>
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <span className="text-xs text-primary-700 font-medium">Business</span>
                    </div>
                </div>

                <div className="card animate-slide-up">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5" />
                                Business Name
                            </label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                placeholder="Fun Zone Gaming"
                            />
                        </div>

                        <div>
                            <label className="label flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5" />
                                Your Booking URL
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    className="input-field pr-10"
                                    value={formData.subdomain}
                                    onChange={(e) => {
                                        setSubdomainEdited(true);
                                        setFormData({ ...formData, subdomain: e.target.value.toLowerCase() });
                                    }}
                                    placeholder="funzone"
                                    pattern="[a-z0-9-]+"
                                    minLength={3}
                                    maxLength={20}
                                />
                                {formData.subdomain.length >= 3 && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {checkingSubdomain ? (
                                            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                        ) : subdomainAvailable ? (
                                            <Check className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <X className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5">
                                <span className="font-semibold text-primary-600">
                                    {formData.subdomain || 'your-subdomain'}.bookdao.com
                                </span>
                            </p>
                            {subdomainAvailable === false && formData.subdomain.length >= 3 && (
                                <p className="text-xs text-red-500 mt-1">This subdomain is not available</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || (formData.subdomain.length >= 3 && !subdomainAvailable)}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Setting up...' : 'Launch My Booking Page'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
