'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Calendar, Clock, CheckCircle, Phone, User } from 'lucide-react';

interface Tenant {
    id: string;
    businessName: string;
}

export default function BookingPage() {
    const params = useParams();
    const tenantId = params.tenantId as string;
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [todaySlots, setTodaySlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [customerData, setCustomerData] = useState({
        name: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Save return URL so booking result pages can redirect back here
        sessionStorage.setItem('bookingReturnUrl', window.location.href);

        // Set default date to today
        const today = new Date();
        setSelectedDate(today.toISOString().split('T')[0]);

        // Fetch today's slots
        fetchTodaySlots();

        // In a real app, fetch tenant details
        setTenant({ id: tenantId, businessName: 'Business Name' });
    }, [tenantId]);

    useEffect(() => {
        if (selectedDate) {
            fetchAvailableSlots();
        }
    }, [selectedDate]);

    const fetchTodaySlots = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/appointments/slots/today/${tenantId}`
            );
            setTodaySlots(response.data.slots);
        } catch (error) {
            console.error('Failed to fetch today slots:', error);
        }
    };

    const fetchAvailableSlots = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/appointments/available-slots`,
                { params: { tenantId, date: selectedDate } }
            );
            setAvailableSlots(response.data.slots);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
        }
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/appointments`,
                {
                    tenantId,
                    customerName: customerData.name,
                    customerPhone: customerData.phone,
                    appointmentDate: selectedDate,
                    startTime: selectedSlot,
                }
            );
            setConfirmed(true);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to create appointment');
        } finally {
            setLoading(false);
        }
    };

    if (confirmed) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-12">
                <div className="text-center py-12 animate-fade-in max-w-md w-full">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">Booking Confirmed!</h2>
                    <p className="text-slate-600 mb-2">Your appointment has been successfully booked.</p>
                    <p className="text-slate-600">We'll contact you at {customerData.phone}</p>
                    <div className="mt-8 p-6 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-600 mb-2">Appointment Details:</p>
                        <p className="font-semibold text-lg">{new Date(selectedDate).toLocaleDateString()}</p>
                        <p className="text-primary-600 font-semibold text-xl">{selectedSlot}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-secondary mt-6"
                    >
                        Book Another Appointment
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="glass border-b border-white/20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
                        <span className="text-xl sm:text-2xl font-bold gradient-text">BookEase</span>
                    </div>
                    {tenant && <p className="text-sm sm:text-base text-slate-600">Book an appointment with {tenant.businessName}</p>}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Today's Available Slots */}

                {/* Booking Form */}
                <div className="card animate-slide-up">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">Book Your Appointment</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm sm:text-base">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleBooking} className="space-y-5">
                        {/* Date Selection */}
                        <div>
                            <label className="label text-sm sm:text-base">Select Date</label>
                            <input
                                type="date"
                                className="input-field text-sm sm:text-base"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        {/* Time Slots */}
                        {availableSlots.length > 0 ? (
                            <div>
                                <label className="label text-sm sm:text-base">Available Time Slots</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                                    {availableSlots.map((slot) => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`p-2 sm:p-3 rounded-lg border-2 font-semibold transition-all text-sm sm:text-base ${selectedSlot === slot
                                                ? 'bg-primary-600 text-white border-primary-600'
                                                : 'bg-white border-slate-200 hover:border-primary-300 text-slate-700'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 sm:py-8 bg-slate-50 rounded-xl">
                                <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-600 text-sm sm:text-base">No available slots for this date</p>
                            </div>
                        )}

                        {/* Customer Information */}
                        {selectedSlot && (
                            <div className="space-y-4 pt-4 border-t-2 border-slate-100">
                                <h3 className="font-semibold text-slate-800 text-base sm:text-lg">Your Information</h3>

                                <div>
                                    <label className="label text-sm sm:text-base flex items-center">
                                        <User className="w-4 h-4 mr-1" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field text-sm sm:text-base"
                                        value={customerData.name}
                                        onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="label text-sm sm:text-base flex items-center">
                                        <Phone className="w-4 h-4 mr-1" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        className="input-field text-sm sm:text-base"
                                        value={customerData.phone}
                                        onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !customerData.name || !customerData.phone}
                                    className="btn-primary w-full disabled:opacity-50 text-sm sm:text-base"
                                >
                                    {loading ? 'Booking...' : 'Confirm Booking'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
