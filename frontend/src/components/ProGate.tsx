'use client';

import Link from 'next/link';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth, ProFeature } from '@/lib/auth';

interface ProGateProps {
    feature: ProFeature;
    title: string;
    description: string;
    bullets?: string[];
    children: React.ReactNode;
}

/**
 * Wraps a Pro-only page. If the tenant is on Free, renders an upgrade
 * empty state. Otherwise renders the children.
 */
export default function ProGate({ feature, title, description, bullets, children }: ProGateProps) {
    const { canUse, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (canUse(feature)) {
        return <>{children}</>;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="card !p-10 sm:!p-14 text-center relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-30 blur-[80px] pointer-events-none"
                     style={{ background: 'radial-gradient(closest-side, rgba(99,91,255,0.5), transparent)' }} />

                <div className="relative">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}
                    >
                        <Lock className="w-7 h-7 text-white" strokeWidth={2.25} />
                    </div>

                    <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-[11px] font-bold px-2.5 py-1 rounded-full mb-4 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                        Pro feature
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
                        {title}
                    </h1>
                    <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
                        {description}
                    </p>

                    {bullets && bullets.length > 0 && (
                        <ul className="text-left max-w-md mx-auto mb-8 space-y-2.5">
                            {bullets.map((b) => (
                                <li key={b} className="flex items-start gap-2.5 text-sm text-slate-700">
                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/pricing"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white transition-all"
                            style={{
                                background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)',
                                boxShadow: '0 4px 16px -4px rgba(99,91,255,0.4)',
                            }}
                        >
                            Upgrade to Pro
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                        >
                            Back to dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
