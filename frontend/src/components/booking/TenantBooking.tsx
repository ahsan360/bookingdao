'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Calendar, Clock, CheckCircle, Phone, User,
    MapPin, Facebook, Instagram, MessageCircle, ArrowRight, Shield
} from 'lucide-react';
import type { PageConfig } from '@/types';
import { useTranslation, LanguageSwitcher } from '@/lib/i18n';

export default function TenantBooking() {
    const { t } = useTranslation();
    const [tenant, setTenant] = useState<any>(null);
    const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState<{ time: string, price: number }[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<{ time: string, price: number } | null>(null);
    const [customerData, setCustomerData] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState('');
    const [tenantLoading, setTenantLoading] = useState(true);
    const [galleryOpen, setGalleryOpen] = useState<string | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const bookingRef = useRef<HTMLDivElement>(null);

    // Step tracking for guided flow
    const currentStep = !selectedDate ? 1 : !selectedSlot ? 2 : 3;

    useEffect(() => {
        // Save return URL so booking result pages can redirect back here
        sessionStorage.setItem('bookingReturnUrl', window.location.href);

        const today = new Date();
        setSelectedDate(today.toISOString().split('T')[0]);
        fetchTenantInfo();
    }, []);

    useEffect(() => {
        if (selectedDate && tenant) {
            fetchAvailableSlots();
        }
    }, [selectedDate, tenant]);

    const fetchTenantInfo = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/appointments/tenant-info`
            );
            setTenant(response.data);
            if (response.data.pageConfig) {
                setPageConfig(response.data.pageConfig);
            }
        } catch (error) {
            console.error('Failed to fetch tenant:', error);
            setError('Business not found. Please check the URL.');
        } finally {
            setTenantLoading(false);
        }
    };

    const fetchAvailableSlots = async () => {
        setSlotsLoading(true);
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/appointments/available-slots`,
                { params: { date: selectedDate } }
            );
            setAvailableSlots(response.data.slots);
            setSelectedSlot(null);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
        } finally {
            setSlotsLoading(false);
        }
    };

    const scrollToBooking = () => {
        bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleBooking = async (e: React.FormEvent, manualPayment = false) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const appointmentResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/appointments`,
                {
                    customerName: customerData.name,
                    customerPhone: customerData.phone,
                    appointmentDate: selectedDate,
                    startTime: selectedSlot?.time,
                    price: selectedSlot?.price || 0,
                }
            );

            const appointment = appointmentResponse.data;
            const amount = selectedSlot?.price || 0;

            // For manual_only mode or user chose manual booking, pass manualPayment flag
            const shouldSkipPayment =
                tenant?.bookingMode === 'manual_only' ||
                (tenant?.bookingMode === 'both' && manualPayment);

            const paymentResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/payments/init`,
                {
                    appointmentId: appointment.id,
                    amount: amount,
                    ...(shouldSkipPayment && { manualPayment: true }),
                }
            );

            // Free/manual booking - confirmed instantly
            if (paymentResponse.data.free) {
                setConfirmed(true);
                setLoading(false);
                return;
            }

            if (paymentResponse.data.gatewayPageURL) {
                window.location.href = paymentResponse.data.gatewayPageURL;
            } else {
                setError('Failed to get payment gateway URL');
                setLoading(false);
            }
        } catch (error: any) {
            console.error('Booking/Payment Error:', error);
            setError(error.response?.data?.error || error.message || 'Failed to process booking');
            setLoading(false);
        }
    };

    // Generate next 7 days for quick date selection
    const getNextDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            days.push({
                value: date.toISOString().split('T')[0],
                dayName: i === 0 ? t.common.today : i === 1 ? t.common.tomorrow : date.toLocaleDateString('en', { weekday: 'short' }),
                dayNum: date.getDate(),
                month: date.toLocaleDateString('en', { month: 'short' }),
            });
        }
        return days;
    };

    if (tenantLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse-slow text-primary-600">
                    <Calendar className="w-16 h-16" />
                </div>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">{t.booking.businessNotFound}</h2>
                    <p className="text-slate-600">{t.booking.checkUrl}</p>
                </div>
            </div>
        );
    }

    if (confirmed) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-12">
                <div className="text-center py-12 animate-fade-in max-w-md w-full">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">{t.booking.bookingConfirmed}</h2>
                    <p className="text-slate-600 mb-2">{t.booking.bookingConfirmedMessage}</p>
                    <p className="text-slate-600">{t.booking.wellContactYou} {customerData.phone}</p>
                    <div className="mt-8 p-6 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-600 mb-2">{t.booking.appointmentDetails}</p>
                        <p className="font-semibold text-lg">{new Date(selectedDate).toLocaleDateString()}</p>
                        <p className="text-primary-600 font-semibold text-xl">{selectedSlot?.time} - ৳{selectedSlot?.price}</p>
                    </div>
                    <button onClick={() => window.location.reload()} className="btn-secondary mt-6">
                        {t.booking.bookAnother}
                    </button>
                </div>
            </div>
        );
    }

    const nextDays = getNextDays();
    const hasPageContent = pageConfig?.aboutText || (pageConfig?.galleryUrls && pageConfig.galleryUrls.length > 0);

    return (
        <div className="min-h-screen">
            {/* Gallery Lightbox */}
            {galleryOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setGalleryOpen(null)}>
                    <img src={galleryOpen} alt="Gallery" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
                </div>
            )}

            {/* Hero Section */}
            {pageConfig?.bannerUrl ? (
                <div className="relative h-56 sm:h-72 md:h-96 overflow-hidden">
                    <img src={pageConfig.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-end space-x-4">
                                {pageConfig.logoUrl && (
                                    <img src={pageConfig.logoUrl} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain bg-white p-1.5 shadow-xl" />
                                )}
                                <div className="flex-1">
                                    <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
                                        {pageConfig.headline || tenant.businessName}
                                    </h1>
                                    {pageConfig.description && (
                                        <p className="text-white/80 text-sm sm:text-lg mt-1">{pageConfig.description}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={scrollToBooking}
                                className="mt-6 bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center space-x-2 text-sm sm:text-base"
                            >
                                <Calendar className="w-5 h-5" />
                                <span>{t.booking.bookNow}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
                        <div className="flex items-center space-x-4 mb-4">
                            {pageConfig?.logoUrl ? (
                                <img src={pageConfig.logoUrl} alt="Logo" className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-contain bg-white p-1.5" />
                            ) : (
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl sm:text-4xl font-bold leading-tight">
                                    {pageConfig?.headline || tenant.businessName}
                                </h1>
                                <p className="text-white/80 text-sm sm:text-lg mt-1">
                                    {pageConfig?.description || t.booking.bookAppointment}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={scrollToBooking}
                            className="mt-4 bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center space-x-2 text-sm sm:text-base"
                        >
                            <Calendar className="w-5 h-5" />
                            <span>{t.booking.bookNow}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Info Strip */}
            {(pageConfig?.phone || pageConfig?.address) && (
                <div className="bg-white border-b border-slate-100">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-slate-600">
                        {pageConfig.phone && (
                            <a href={`tel:${pageConfig.phone}`} className="flex items-center space-x-1.5 hover:text-primary-600 transition-colors">
                                <Phone className="w-4 h-4" />
                                <span>{pageConfig.phone}</span>
                            </a>
                        )}
                        {pageConfig.address && (
                            <span className="flex items-center space-x-1.5">
                                <MapPin className="w-4 h-4" />
                                <span>{pageConfig.address}</span>
                            </span>
                        )}
                        {pageConfig?.socialFacebook && (
                            <a href={pageConfig.socialFacebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700"><Facebook className="w-4 h-4" /></a>
                        )}
                        {pageConfig?.socialInstagram && (
                            <a href={pageConfig.socialInstagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700"><Instagram className="w-4 h-4" /></a>
                        )}
                        {pageConfig?.socialWhatsapp && (
                            <a href={`https://wa.me/${pageConfig.socialWhatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700"><MessageCircle className="w-4 h-4" /></a>
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Two-column layout: content + booking */}
                <div className={`grid ${hasPageContent ? 'lg:grid-cols-5' : 'lg:grid-cols-1 max-w-2xl mx-auto'} gap-8`}>

                    {/* Left: About + Gallery */}
                    {hasPageContent && (
                        <div className="lg:col-span-2 space-y-6">
                            {pageConfig?.aboutText && (
                                <div className="animate-slide-up">
                                    <h2 className="text-lg font-bold text-slate-800 mb-3">{t.booking.aboutUs}</h2>
                                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                        {pageConfig.aboutText}
                                    </p>
                                </div>
                            )}

                            {pageConfig?.galleryUrls && pageConfig.galleryUrls.length > 0 && (
                                <div className="animate-slide-up">
                                    <h2 className="text-lg font-bold text-slate-800 mb-3">{t.booking.gallery}</h2>
                                    <div className="grid grid-cols-2 gap-2">
                                        {pageConfig.galleryUrls.map((url, i) => (
                                            <button
                                                key={url}
                                                onClick={() => setGalleryOpen(url)}
                                                className="overflow-hidden rounded-xl border border-slate-100 hover:shadow-lg transition-all"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Gallery ${i + 1}`}
                                                    className="w-full h-28 sm:h-32 object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Right: Booking Form */}
                    <div className={`${hasPageContent ? 'lg:col-span-3' : ''}`} ref={bookingRef}>
                        <div className="card animate-slide-up sticky top-6">
                            {/* Step Indicators */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{t.booking.bookAppointment}</h2>
                                <div className="flex items-center space-x-1">
                                    {[1, 2, 3].map((step) => (
                                        <div
                                            key={step}
                                            className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                                step <= currentStep ? 'bg-primary-600' : 'bg-slate-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleBooking} className="space-y-6">
                                {/* Step 1: Quick Date Selection */}
                                <div>
                                    <label className="label text-sm flex items-center space-x-1">
                                        <Calendar className="w-4 h-4 text-primary-600" />
                                        <span>{t.booking.selectDate}</span>
                                    </label>
                                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                                        {nextDays.map((day) => (
                                            <button
                                                key={day.value}
                                                type="button"
                                                onClick={() => setSelectedDate(day.value)}
                                                className={`flex-shrink-0 w-16 sm:w-20 py-2.5 rounded-xl text-center transition-all border-2 ${
                                                    selectedDate === day.value
                                                        ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-200'
                                                        : 'bg-white border-slate-200 hover:border-primary-300 text-slate-700'
                                                }`}
                                            >
                                                <span className="block text-xs font-medium opacity-70">{day.dayName}</span>
                                                <span className="block text-lg font-bold">{day.dayNum}</span>
                                                <span className="block text-xs opacity-70">{day.month}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {/* Fallback full date picker */}
                                    <input
                                        type="date"
                                        className="input-field text-sm mt-2"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                {/* Step 2: Time Slots */}
                                <div>
                                    <label className="label text-sm flex items-center space-x-1">
                                        <Clock className="w-4 h-4 text-primary-600" />
                                        <span>{t.booking.pickTime}</span>
                                    </label>
                                    {slotsLoading ? (
                                        <div className="text-center py-8">
                                            <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
                                            <p className="text-sm text-slate-500 mt-2">{t.booking.loadingSlots}</p>
                                        </div>
                                    ) : availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {availableSlots.map((slot) => (
                                                <button
                                                    key={slot.time}
                                                    type="button"
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`py-2.5 px-2 rounded-xl border-2 font-semibold transition-all text-sm ${
                                                        selectedSlot?.time === slot.time
                                                            ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-200'
                                                            : 'bg-white border-slate-200 hover:border-primary-300 text-slate-700'
                                                    }`}
                                                >
                                                    <span className="block">{slot.time}</span>
                                                    {slot.price > 0 && (
                                                        <span className={`block text-xs mt-0.5 ${selectedSlot?.time === slot.time ? 'text-white/80' : 'text-primary-600 font-bold'}`}>
                                                            ৳{slot.price}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-slate-50 rounded-xl">
                                            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                            <p className="text-slate-500 text-sm">{t.booking.noSlots}</p>
                                            <p className="text-slate-400 text-xs mt-1">{t.booking.tryAnotherDate}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Step 3: Customer Info + Submit */}
                                {selectedSlot && (
                                    <div className="space-y-4 pt-4 border-t border-slate-100 animate-slide-up">
                                        {/* Selected Summary */}
                                        <div className="bg-primary-50 rounded-xl p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-primary-600 font-semibold">{t.booking.yourSelection}</p>
                                                <p className="font-bold text-slate-800">
                                                    {new Date(selectedDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                                                </p>
                                                <p className="text-primary-700 font-semibold">{selectedSlot.time}</p>
                                            </div>
                                            {selectedSlot.price > 0 && (
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500">{t.common.price}</p>
                                                    <p className="text-2xl font-bold text-primary-700">৳{selectedSlot.price}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="label text-sm flex items-center space-x-1">
                                                <User className="w-4 h-4 text-primary-600" />
                                                <span>{t.booking.fullName}</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="input-field text-sm"
                                                value={customerData.name}
                                                onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                                                placeholder={t.booking.enterName}
                                            />
                                        </div>

                                        <div>
                                            <label className="label text-sm flex items-center space-x-1">
                                                <Phone className="w-4 h-4 text-primary-600" />
                                                <span>{t.booking.phoneNumber}</span>
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                className="input-field text-sm"
                                                value={customerData.phone}
                                                onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                                                placeholder="+880 1XXX-XXXXXX"
                                            />
                                        </div>

                                        {/* Booking buttons based on bookingMode */}
                                        {tenant?.bookingMode === 'both' && selectedSlot.price > 0 ? (
                                            <div className="space-y-3">
                                                <button
                                                    type="submit"
                                                    disabled={loading || !customerData.name || !customerData.phone}
                                                    className="btn-primary w-full disabled:opacity-50 flex items-center justify-center space-x-2"
                                                >
                                                    {loading ? (
                                                        <span>{t.common.processing}</span>
                                                    ) : (
                                                        <>
                                                            <Shield className="w-5 h-5" />
                                                            <span>{t.booking.payOnline} ৳{selectedSlot.price}</span>
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={loading || !customerData.name || !customerData.phone}
                                                    onClick={(e) => handleBooking(e as any, true)}
                                                    className="w-full py-3 px-4 rounded-xl border-2 border-primary-200 text-primary-700 font-semibold hover:bg-primary-50 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                                                >
                                                    <Calendar className="w-5 h-5" />
                                                    <span>{t.booking.bookWithoutPayment}</span>
                                                </button>
                                                <p className="text-xs text-center text-slate-400">
                                                    {t.booking.payOnlineHint}
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    type="submit"
                                                    disabled={loading || !customerData.name || !customerData.phone}
                                                    className="btn-primary w-full disabled:opacity-50 flex items-center justify-center space-x-2"
                                                >
                                                    {loading ? (
                                                        <span>{t.common.processing}</span>
                                                    ) : (
                                                        <>
                                                            <Shield className="w-5 h-5" />
                                                            <span>
                                                                {tenant?.bookingMode === 'manual_only'
                                                                    ? t.booking.confirmBooking
                                                                    : selectedSlot.price > 0
                                                                        ? `${t.booking.confirmAndPay} ৳${selectedSlot.price}`
                                                                        : t.booking.confirmBooking}
                                                            </span>
                                                        </>
                                                    )}
                                                </button>
                                                {tenant?.bookingMode === 'payment_required' && selectedSlot.price > 0 && (
                                                    <p className="text-xs text-center text-slate-400">
                                                        {t.booking.paymentRequiredHint}
                                                    </p>
                                                )}
                                                {tenant?.bookingMode === 'manual_only' && (
                                                    <p className="text-xs text-center text-slate-400">
                                                        {t.booking.manualHint}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 mt-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-slate-400">
                    <div className="flex items-center justify-center gap-4">
                        <LanguageSwitcher />
                        <span>{t.common.poweredBy}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
