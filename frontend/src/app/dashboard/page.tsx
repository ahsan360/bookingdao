'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Calendar, Users, ChevronLeft, ChevronRight, DollarSign, TrendingUp, CalendarDays,
    ExternalLink, Copy, CheckCircle, XCircle, Filter, UserPlus, CheckCheck
} from 'lucide-react';
import { useToast } from '@/components/useToast';
import { useConfirm } from '@/components/ConfirmDialog';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import type { Appointment, Pagination, Stats } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';

export default function DashboardPage() {
    const { user, tenant, isOwner } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [runningAppointments, setRunningAppointments] = useState<Appointment[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [stats, setStats] = useState<Stats | null>(null);
    const [linkCopied, setLinkCopied] = useState(false);

    const { addToast, ToastContainer } = useToast();
    const { confirm, ConfirmDialogComponent } = useConfirm();

    useEffect(() => {
        fetchStats();
        fetchAppointments(1);
        fetchRunningAppointments();
    }, []);

    useEffect(() => {
        fetchAppointments(1);
    }, [statusFilter, dateFilter]);

    const fetchStats = async () => {
        try {
            const response = await api.get('/appointments/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchRunningAppointments = async () => {
        try {
            const response = await api.get('/appointments/running');
            setRunningAppointments(response.data);
        } catch (error) {
            console.error('Failed to fetch running appointments:', error);
        }
    };

    const fetchAppointments = async (page: number) => {
        try {
            const params: any = { page, limit: 20 };
            if (statusFilter) params.status = statusFilter;
            if (dateFilter) params.date = dateFilter;

            const response = await api.get('/appointments', { params });

            if (response.data.data && response.data.pagination) {
                setAppointments(response.data.data);
                setPagination(response.data.pagination);
            } else if (Array.isArray(response.data)) {
                setAppointments(response.data);
                setPagination({ page: 1, limit: response.data.length, total: response.data.length, totalPages: 1 });
            }
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const goToPage = (page: number) => {
        fetchAppointments(page);
    };

    // Cancel modal
    const [cancelModal, setCancelModal] = useState<{ id: string; name: string } | null>(null);
    const [cancelReason, setCancelReason] = useState('');

    const handleCancelAppointment = async (id: string, customerName: string) => {
        setCancelModal({ id, name: customerName });
        setCancelReason('');
    };

    const submitCancel = async () => {
        if (!cancelModal) return;
        try {
            await api.delete(`/appointments/${cancelModal.id}`, {
                data: { reason: cancelReason || undefined },
            });
            addToast('Appointment cancelled', 'success');
            setCancelModal(null);
            fetchAppointments(pagination.page);
            fetchRunningAppointments();
            fetchStats();
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to cancel', 'error');
        }
    };

    // Mark completed
    const handleMarkCompleted = async (id: string) => {
        try {
            await api.patch(`/appointments/${id}/complete`);
            addToast('Appointment marked as completed', 'success');
            fetchAppointments(pagination.page);
            fetchRunningAppointments();
            fetchStats();
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to complete', 'error');
        }
    };

    // Manual booking state
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        customerName: '', customerPhone: '', customerEmail: '',
        appointmentDate: '', startTime: '', notes: '',
    });
    const [availableSlots, setAvailableSlots] = useState<{ time: string; price: number }[]>([]);
    const [bookingLoading, setBookingLoading] = useState(false);

    const fetchSlotsForDate = async (date: string) => {
        if (!date || !tenant?.id) return;
        try {
            const res = await api.get('/appointments/available-slots', {
                params: { date, tenantId: tenant.id },
            });
            setAvailableSlots(res.data.slots || []);
        } catch { setAvailableSlots([]); }
    };

    const handleBookingDateChange = (date: string) => {
        setBookingForm(f => ({ ...f, appointmentDate: date, startTime: '' }));
        fetchSlotsForDate(date);
    };

    const submitBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setBookingLoading(true);
        try {
            await api.post('/appointments/admin-book', bookingForm);
            addToast('Appointment booked successfully', 'success');
            setShowBookingForm(false);
            setBookingForm({ customerName: '', customerPhone: '', customerEmail: '', appointmentDate: '', startTime: '', notes: '' });
            setAvailableSlots([]);
            fetchAppointments(pagination.page);
            fetchRunningAppointments();
            fetchStats();
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to book', 'error');
        } finally {
            setBookingLoading(false);
        }
    };

    const getBookingUrl = () => {
        if (!tenant?.subdomain) return '';
        const frontendUrl = window.location.origin;
        const url = new URL(frontendUrl);
        url.hostname = `${tenant.subdomain}.${url.hostname}`;
        return url.origin;
    };

    const handleCopyLink = () => {
        const url = getBookingUrl();
        if (url) {
            navigator.clipboard.writeText(url);
            setLinkCopied(true);
            addToast('Booking link copied!', 'success');
            setTimeout(() => setLinkCopied(false), 2000);
        }
    };

    // Group appointments by date
    const groupedAppointments = useMemo(() => {
        const groups: Record<string, Appointment[]> = {};
        for (const apt of appointments) {
            const dateKey = new Date(apt.appointmentDate).toISOString().split('T')[0];
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(apt);
        }
        return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
    }, [appointments]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.getTime() === today.getTime()) return 'Today';
        if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
        if (date.getTime() === yesterday.getTime()) return 'Yesterday';
        return date.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getDayRevenue = (apts: Appointment[]) => {
        return apts.filter(a => a.status === 'confirmed' || a.status === 'completed').reduce((sum, a) => sum + (a.price || 0), 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen">
                <LoadingSpinner size="lg" className="min-h-screen" />
            </div>
        );
    }

    return (
        <div>
            <ToastContainer />
            {ConfirmDialogComponent}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Revenue Cards */}
                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        <div className="card !p-4 sm:!p-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs sm:text-sm font-semibold text-slate-500">Today</p>
                                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                                </div>
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-slate-800">৳{stats.revenue.daily.toLocaleString()}</p>
                            <p className="text-xs text-slate-400 mt-1">{stats.appointments.today} booking{stats.appointments.today !== 1 ? 's' : ''}</p>
                        </div>

                        <div className="card !p-4 sm:!p-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs sm:text-sm font-semibold text-slate-500">This Month</p>
                                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-slate-800">৳{stats.revenue.monthly.toLocaleString()}</p>
                            <p className="text-xs text-slate-400 mt-1">{stats.appointments.confirmed} confirmed</p>
                        </div>

                        <div className="card !p-4 sm:!p-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs sm:text-sm font-semibold text-slate-500">This Year</p>
                                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                </div>
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-slate-800">৳{stats.revenue.yearly.toLocaleString()}</p>
                            <p className="text-xs text-slate-400 mt-1">{stats.appointments.total} total</p>
                        </div>

                        <div className="card !p-4 sm:!p-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs sm:text-sm font-semibold text-slate-500">Status</p>
                                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm mt-1 flex-wrap">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="font-semibold text-slate-700">{stats.appointments.confirmed}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="font-semibold text-slate-700">{stats.appointments.completed || 0}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="font-semibold text-slate-700">{stats.appointments.pending}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="font-semibold text-slate-700">{stats.appointments.cancelled}</span>
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1.5 flex gap-1.5 flex-wrap">
                                <span>Confirmed</span><span>Done</span><span>Pending</span><span>Cancelled</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Running Appointments - Today's Active */}
                {runningAppointments.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <h2 className="text-sm font-bold text-slate-700">Today&apos;s Active Appointments</h2>
                            <span className="text-xs text-slate-400">({runningAppointments.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {runningAppointments.map(apt => (
                                <div key={apt.id} className="card !p-4 border-l-4 border-l-green-500">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{apt.customerName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                                    {apt.startTime} - {apt.endTime}
                                                </span>
                                                {apt.price > 0 && (
                                                    <span className="text-xs font-semibold text-slate-600">৳{apt.price}</span>
                                                )}
                                            </div>
                                            {apt.customerPhone && (
                                                <p className="text-xs text-slate-400 mt-1">{apt.customerPhone}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleMarkCompleted(apt.id)}
                                                className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Mark as completed"
                                            >
                                                <CheckCheck className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleCancelAppointment(apt.id, apt.customerName)}
                                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Cancel"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Booking Link */}
                {tenant?.subdomain && (
                    <div className="card !p-4 mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-white/80">Your Booking Page</p>
                                <p className="text-sm text-white/60 font-mono mt-0.5">{getBookingUrl()}</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={handleCopyLink}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all"
                                >
                                    {linkCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {linkCopied ? 'Copied!' : 'Copy'}
                                </button>
                                <a
                                    href={getBookingUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-primary-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    <span className="hidden sm:inline">Visit</span>
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Appointments Section */}
                <div className="card">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Appointments</h2>
                            <button
                                onClick={() => setShowBookingForm(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-all"
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                Book Slot
                            </button>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="input-field !py-2 !pl-8 !pr-3 text-sm w-full sm:w-36"
                                >
                                    <option value="">All Status</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="input-field !py-2 !px-3 text-sm w-36 sm:w-40"
                                title="Filter by date"
                            />
                            {dateFilter && (
                                <button
                                    onClick={() => setDateFilter('')}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Clear date filter"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {appointments.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No appointments found</p>
                            <p className="text-slate-400 text-sm mt-1">
                                {statusFilter || dateFilter ? 'Try changing your filters' : 'Set up schedules to start accepting bookings'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-6">
                                {groupedAppointments.map(([dateKey, dayAppointments]) => {
                                    const dayRev = getDayRevenue(dayAppointments);
                                    return (
                                        <div key={dateKey}>
                                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="w-4 h-4 text-primary-500" />
                                                    <h3 className="text-sm font-bold text-slate-700">{formatDate(dateKey)}</h3>
                                                    <span className="text-xs text-slate-400">
                                                        {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                {dayRev > 0 && (
                                                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                                        ৳{dayRev.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                {dayAppointments
                                                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                                    .map((apt) => {
                                                        const canCancel = apt.status !== 'cancelled' && apt.status !== 'expired' && apt.status !== 'completed';
                                                        const canComplete = apt.status === 'confirmed';
                                                        const canCancelPaid = !(apt.price > 0 && !isOwner);

                                                        return (
                                                            <div
                                                                key={apt.id}
                                                                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary-200 bg-white transition-all group"
                                                            >
                                                                <div className="text-center min-w-[60px]">
                                                                    <p className="text-sm font-bold text-slate-800">{apt.startTime}</p>
                                                                    <p className="text-[10px] text-slate-400">{apt.endTime}</p>
                                                                </div>

                                                                <div className="w-px h-10 bg-slate-200" />

                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-slate-800 truncate">{apt.customerName}</p>
                                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                                        {apt.customerPhone && <span>{apt.customerPhone}</span>}
                                                                        {apt.customerEmail && <span className="hidden sm:inline truncate">{apt.customerEmail}</span>}
                                                                    </div>
                                                                </div>

                                                                {apt.price > 0 && (
                                                                    <span className="text-sm font-bold text-slate-700 hidden sm:block">৳{apt.price}</span>
                                                                )}

                                                                <StatusBadge status={apt.status} />

                                                                {/* Actions */}
                                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {canComplete && (
                                                                        <button
                                                                            onClick={() => handleMarkCompleted(apt.id)}
                                                                            className="p-1.5 text-slate-300 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                            title="Mark as completed"
                                                                        >
                                                                            <CheckCheck className="w-4 h-4" />
                                                                        </button>
                                                                    )}

                                                                    {canCancel && (
                                                                        canCancelPaid ? (
                                                                            <button
                                                                                onClick={() => handleCancelAppointment(apt.id, apt.customerName)}
                                                                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                                title="Cancel appointment"
                                                                            >
                                                                                <XCircle className="w-4 h-4" />
                                                                            </button>
                                                                        ) : (
                                                                            <span
                                                                                className="p-1.5 text-slate-200 cursor-not-allowed"
                                                                                title="Only owner can cancel paid appointments"
                                                                            >
                                                                                <XCircle className="w-4 h-4" />
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                                    <p className="text-xs text-slate-500">
                                        {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => goToPage(pagination.page - 1)}
                                            disabled={pagination.page <= 1}
                                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="text-xs font-semibold text-slate-600 px-3">
                                            {pagination.page} / {pagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() => goToPage(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.totalPages}
                                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Manual Booking Modal */}
            {showBookingForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Book a Slot</h3>
                            <button onClick={() => { setShowBookingForm(false); setAvailableSlots([]); }} className="p-1 hover:bg-slate-100 rounded-lg">
                                <XCircle className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={submitBooking} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" placeholder="Customer Name *" value={bookingForm.customerName} onChange={e => setBookingForm(f => ({ ...f, customerName: e.target.value }))} className="input-field col-span-2" required />
                                <input type="tel" placeholder="Phone *" value={bookingForm.customerPhone} onChange={e => setBookingForm(f => ({ ...f, customerPhone: e.target.value }))} className="input-field" required />
                                <input type="email" placeholder="Email (optional)" value={bookingForm.customerEmail} onChange={e => setBookingForm(f => ({ ...f, customerEmail: e.target.value }))} className="input-field" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Date</label>
                                <input type="date" value={bookingForm.appointmentDate} onChange={e => handleBookingDateChange(e.target.value)} className="input-field w-full" required />
                            </div>
                            {bookingForm.appointmentDate && (
                                <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                                        Available Slots {availableSlots.length > 0 && `(${availableSlots.length})`}
                                    </label>
                                    {availableSlots.length === 0 ? (
                                        <p className="text-sm text-slate-400 py-2">No slots available for this date</p>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                                            {availableSlots.map(slot => (
                                                <button key={slot.time} type="button" onClick={() => setBookingForm(f => ({ ...f, startTime: slot.time }))} className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${bookingForm.startTime === slot.time ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-200 hover:border-primary-300'}`}>
                                                    {slot.time}
                                                    {slot.price > 0 && <span className="block text-[10px] opacity-70">৳{slot.price}</span>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <textarea placeholder="Notes (optional)" value={bookingForm.notes} onChange={e => setBookingForm(f => ({ ...f, notes: e.target.value }))} className="input-field w-full h-16 resize-none" />
                            <div className="flex items-center justify-end space-x-2 pt-2">
                                <button type="button" onClick={() => { setShowBookingForm(false); setAvailableSlots([]); }} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-all">Cancel</button>
                                <button type="submit" disabled={bookingLoading || !bookingForm.startTime} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50">{bookingLoading ? 'Booking...' : 'Confirm Booking'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cancel Reason Modal */}
            {cancelModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Cancel Appointment</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Cancelling appointment for <strong>{cancelModal.name}</strong>
                        </p>
                        <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Reason for cancellation (optional but recommended)" className="input-field w-full h-24 resize-none mb-4" />
                        <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => setCancelModal(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-all">Keep Appointment</button>
                            <button onClick={submitCancel} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">Cancel Appointment</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
