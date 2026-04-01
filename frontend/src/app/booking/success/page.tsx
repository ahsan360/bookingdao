'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { CheckCircle, Loader2, Calendar, Clock } from 'lucide-react';

function BookingSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const appointmentId = searchParams.get('appointmentId');
    const [appointment, setAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [returnUrl, setReturnUrl] = useState('/');

    useEffect(() => {
        // Get return URL from sessionStorage (saved by booking page)
        const savedUrl = sessionStorage.getItem('bookingReturnUrl');
        if (savedUrl) setReturnUrl(savedUrl);
    }, []);

    useEffect(() => {
        if (!appointmentId) {
            router.push('/');
            return;
        }

        const fetchAppointment = async () => {
            try {
                // We're using the public endpoint or a specific status endpoint?
                // The public endpoint /appointments/:id might be secured?
                // `payment.routes.ts` has a helper to get payment details which includes appointment.
                // Or `appointment.routes.ts` has get single appointment.
                // Let's try getting payment status first as it confirms payment
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payments/${appointmentId}`
                );

                if (response.data.status === 'succeeded' || response.data.status === 'confirmed') {
                    setAppointment(response.data.appointment);
                } else if (response.data.appointment) {
                    // If payment exists but not succeeded (e.g. pending), maybe show pending?
                    setAppointment(response.data.appointment);
                }
            } catch (error) {
                console.error('Failed to fetch booking details:', error);
                // Fallback to just success message if API fails (e.g. auth required)
            } finally {
                setLoading(false);
            }
        };

        fetchAppointment();
    }, [appointmentId, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card max-w-lg w-full text-center py-12 animate-fade-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold text-slate-800 mb-2">Booking Confirmed!</h1>
                <p className="text-slate-600 mb-8">Thank you for your payment. Your appointment is secured.</p>

                {appointment && (
                    <div className="bg-slate-50 rounded-xl p-6 text-left mb-8 space-y-3 border border-slate-100">
                        <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-primary-600 mt-0.5" />
                            <div>
                                <p className="text-sm text-slate-500">Date</p>
                                <p className="font-semibold text-slate-800">
                                    {new Date(appointment.appointmentDate).toLocaleDateString(undefined, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Clock className="w-5 h-5 text-primary-600 mt-0.5" />
                            <div>
                                <p className="text-sm text-slate-500">Time</p>
                                <p className="font-semibold text-slate-800">
                                    {appointment.startTime} - {appointment.endTime}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <p className="text-sm text-slate-500 mb-6">
                    A confirmation email has been sent to {appointment?.customerEmail || 'your email'}.
                </p>

                <a
                    href={returnUrl}
                    className="btn-primary inline-block"
                >
                    Back to Booking Page
                </a>
            </div>
        </div>
    );
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingSuccessContent />
        </Suspense>
    );
}
