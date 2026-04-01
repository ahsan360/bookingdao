'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, AlertCircle } from 'lucide-react';

function BookingFailedContent() {
    const searchParams = useSearchParams();
    const reason = searchParams.get('reason');
    const [returnUrl, setReturnUrl] = useState('/');

    useEffect(() => {
        const savedUrl = sessionStorage.getItem('bookingReturnUrl');
        if (savedUrl) setReturnUrl(savedUrl);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card max-w-lg w-full text-center py-12 animate-fade-in">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>

                <h1 className="text-3xl font-bold text-slate-800 mb-2">Booking Failed</h1>
                <p className="text-slate-600 mb-8">
                    {reason === 'payment_failed'
                        ? 'The payment could not be processed.'
                        : 'Something went wrong with your booking.'}
                </p>

                <div className="bg-red-50 p-4 rounded-lg flex items-center justify-center space-x-2 text-red-700 mb-8">
                    <AlertCircle className="w-5 h-5" />
                    <span>Please try again or contact support.</span>
                </div>

                <a
                    href={returnUrl}
                    className="btn-secondary inline-block"
                >
                    Try Again
                </a>
            </div>
        </div>
    );
}

export default function BookingFailedPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingFailedContent />
        </Suspense>
    );
}
