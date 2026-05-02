'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, ArrowLeft, Phone, Mail } from 'lucide-react';
import api from '@/lib/api';

type Step = 'request' | 'verify' | 'reset' | 'done';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('request');
    const [method, setMethod] = useState<'phone' | 'email'>('phone');
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { identifier });
            setStep('verify');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/verify-otp', {
                identifier,
                code: otp,
                type: 'password_reset',
            });
            setResetToken(response.data.resetToken);
            setStep('reset');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/reset-password', {
                resetToken,
                newPassword,
            });
            setStep('done');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-6 animate-fade-in">
                    <Link href="/" className="inline-flex items-center space-x-2 mb-4">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}>
                            <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-semibold gradient-text tracking-tight">BookingDeo</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800 mb-1">
                        {step === 'done' ? 'Password Reset!' : 'Reset Password'}
                    </h1>
                    <p className="text-sm text-slate-600">
                        {step === 'request' && 'Enter your phone or email to get a reset code'}
                        {step === 'verify' && `We sent a 6-digit code to ${identifier}`}
                        {step === 'reset' && 'Enter your new password'}
                        {step === 'done' && 'Your password has been reset successfully'}
                    </p>
                </div>

                <div className="card animate-slide-up">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Request OTP */}
                    {step === 'request' && (
                        <form onSubmit={handleRequestOtp} className="space-y-4">
                            <div>
                                <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => { setMethod('phone'); setIdentifier(''); }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                            method === 'phone'
                                                ? 'bg-white text-primary-700 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        <Phone className="w-4 h-4" />
                                        Phone
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setMethod('email'); setIdentifier(''); }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                            method === 'email'
                                                ? 'bg-white text-primary-700 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </button>
                                </div>

                                {method === 'phone' ? (
                                    <div>
                                        <label className="label">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            className="input-field"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            placeholder="01XXXXXXXXX"
                                            inputMode="numeric"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="label">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            className="input-field"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            placeholder="you@example.com"
                                            inputMode="email"
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send Reset Code'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verify OTP */}
                    {step === 'verify' && (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <label className="label">Enter 6-digit Code</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    maxLength={6}
                                    inputMode="numeric"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setStep('request'); setOtp(''); setError(''); }}
                                className="w-full text-sm text-slate-500 hover:text-slate-700"
                            >
                                Didn&apos;t get a code? Try again
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="label">New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input-field"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="label">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input-field"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    {/* Step 4: Done */}
                    {step === 'done' && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-slate-600 mb-4">You can now sign in with your new password.</p>
                            <button
                                onClick={() => router.push('/login')}
                                className="btn-primary w-full"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}

                    {step !== 'done' && (
                        <div className="mt-5 text-center">
                            <Link href="/login" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Back to login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
