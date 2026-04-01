'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

function BookingCancelledContent() {
    const [returnUrl, setReturnUrl] = useState('/');

    useEffect(() => {
        const savedUrl = sessionStorage.getItem('bookingReturnUrl');
        if (savedUrl) setReturnUrl(savedUrl);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card max-w-lg w-full text-center py-12 animate-fade-in">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-yellow-600" />
                </div>

                <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Cancelled</h1>
                <p className="text-slate-600 mb-8">
                    You cancelled the payment process. Your appointment has not been booked.
                </p>

                <a
                    href={returnUrl}
                    className="btn-secondary inline-block"
                >
                    Return to Booking Page
                </a>
            </div>
        </div>
    );
}

export default function BookingCancelledPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingCancelledContent />
        </Suspense>
    );
}
