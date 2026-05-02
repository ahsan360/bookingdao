'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Calendar, ChevronLeft, ChevronRight, Clock,
    User, Phone, X, Loader2, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import type { Appointment } from '@/types';

interface DaySlot {
    time: string;
    endTime: string;
    price: number;
    duration: number;
    status: string;
    customerName: string | null;
    customerPhone: string | null;
    appointmentId: string | null;
}

interface DaySlotsData {
    date: string;
    slots: DaySlot[];
    summary: {
        total: number;
        available: number;
        confirmed: number;
        pending: number;
        cancelled: number;
    };
}

const STATUS_COLORS: Record<string, { bg: string; dot: string; text: string; border: string }> = {
    available: { bg: 'bg-white', dot: 'bg-emerald-400', text: 'text-emerald-600', border: 'border-emerald-200' },
    confirmed: { bg: 'bg-green-50', dot: 'bg-green-500', text: 'text-green-700', border: 'border-green-200' },
    pending: { bg: 'bg-yellow-50', dot: 'bg-yellow-500', text: 'text-yellow-700', border: 'border-yellow-200' },
    cancelled: { bg: 'bg-red-50', dot: 'bg-red-400', text: 'text-red-600', border: 'border-red-200' },
    expired: { bg: 'bg-slate-50', dot: 'bg-slate-400', text: 'text-slate-500', border: 'border-slate-200' },
    failed: { bg: 'bg-red-50', dot: 'bg-red-300', text: 'text-red-500', border: 'border-red-200' },
};

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [view, setView] = useState<'month' | 'week'>('month');

    // Day slots panel
    const [daySlots, setDaySlots] = useState<DaySlotsData | null>(null);
    const [daySlotsLoading, setDaySlotsLoading] = useState(false);

    useEffect(() => {
        fetchMonthAppointments();
    }, [currentDate]);

    // Fetch day slots when a date is selected
    useEffect(() => {
        if (selectedDate) {
            fetchDaySlots(selectedDate);
        } else {
            setDaySlots(null);
        }
    }, [selectedDate]);

    const fetchMonthAppointments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/appointments', {
                params: { page: 1, limit: 100 },
            });
            if (response.data.data) {
                setAppointments(response.data.data);
            } else if (Array.isArray(response.data)) {
                setAppointments(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDaySlots = async (date: string) => {
        setDaySlotsLoading(true);
        try {
            const response = await api.get('/appointments/day-slots', {
                params: { date },
            });
            setDaySlots(response.data);
        } catch (error) {
            console.error('Failed to fetch day slots:', error);
            setDaySlots(null);
        } finally {
            setDaySlotsLoading(false);
        }
    };

    // Build calendar grid
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startDay = firstDayOfMonth.getDay();
        const totalDays = lastDayOfMonth.getDate();

        const days: { date: Date; isCurrentMonth: boolean }[] = [];

        for (let i = startDay - 1; i >= 0; i--) {
            days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
        }
        for (let i = 1; i <= totalDays; i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }
        const remaining = 7 - (days.length % 7);
        if (remaining < 7) {
            for (let i = 1; i <= remaining; i++) {
                days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
            }
        }
        return days;
    }, [currentDate]);

    // Build week view days
    const weekDays = useMemo(() => {
        const start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay());
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [currentDate]);

    // Group appointments by date
    const appointmentsByDate = useMemo(() => {
        const map: Record<string, Appointment[]> = {};
        appointments.forEach((apt) => {
            const dateKey = new Date(apt.appointmentDate).toISOString().split('T')[0];
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(apt);
        });
        Object.values(map).forEach((arr) => arr.sort((a, b) => a.startTime.localeCompare(b.startTime)));
        return map;
    }, [appointments]);

    const today = new Date().toISOString().split('T')[0];

    const navigate = (dir: number) => {
        const d = new Date(currentDate);
        if (view === 'month') d.setMonth(d.getMonth() + dir);
        else d.setDate(d.getDate() + dir * 7);
        setCurrentDate(d);
    };

    const getDateKey = (date: Date) => date.toISOString().split('T')[0];
    const getDayAppointments = (date: Date) => appointmentsByDate[getDateKey(date)] || [];
    const getStatusStyle = (status: string) => STATUS_COLORS[status] || STATUS_COLORS.pending;

    const timeSlots = Array.from({ length: 17 }, (_, i) => `${(i + 6).toString().padStart(2, '0')}:00`);

    const handleDateSelect = (dateKey: string) => {
        setSelectedAppointment(null);
        setSelectedDate(selectedDate === dateKey ? null : dateKey);
    };

    return (
        <div>
            <div className="flex items-center space-x-3 mb-6 px-4 sm:px-6 pt-6"><Calendar className="w-6 h-6 text-primary-600" /><h1 className="text-xl font-bold text-slate-800">Calendar</h1></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Calendar Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 min-w-[200px] text-center">
                            {view === 'month'
                                ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                                : `Week of ${weekDays[0].toLocaleDateString('en', { month: 'short', day: 'numeric' })}`
                            }
                        </h2>
                        <button onClick={() => navigate(1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => { setCurrentDate(new Date()); }}
                            className="px-4 py-2 text-sm font-semibold text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                        >
                            Today
                        </button>
                        <div className="flex bg-slate-100 rounded-lg p-0.5">
                            <button
                                onClick={() => setView('month')}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${view === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setView('week')}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${view === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                            >
                                Week
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Calendar Grid */}
                        <div className="flex-1">
                            {view === 'month' ? (
                                <div className="card !p-0 overflow-hidden">
                                    <div className="grid grid-cols-7 border-b border-slate-100">
                                        {DAYS_SHORT.map((day) => (
                                            <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7">
                                        {calendarDays.map(({ date, isCurrentMonth }, i) => {
                                            const dateKey = getDateKey(date);
                                            const dayApts = getDayAppointments(date);
                                            const isToday = dateKey === today;
                                            const isSelected = dateKey === selectedDate;

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleDateSelect(dateKey)}
                                                    className={`min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 border-b border-r border-slate-50 text-left transition-colors
                                                        ${!isCurrentMonth ? 'bg-slate-50/50' : 'bg-white hover:bg-primary-50/30'}
                                                        ${isSelected ? '!bg-primary-50 ring-2 ring-primary-400 ring-inset' : ''}
                                                    `}
                                                >
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold
                                                        ${isToday ? 'bg-primary-600 text-white' : !isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                                                    `}>
                                                        {date.getDate()}
                                                    </span>
                                                    {dayApts.length > 0 && (
                                                        <div className="mt-1 space-y-0.5">
                                                            {dayApts.slice(0, 3).map((apt) => {
                                                                const style = getStatusStyle(apt.status);
                                                                return (
                                                                    <div key={apt.id} className={`${style.bg} rounded px-1.5 py-0.5 truncate hidden sm:block`}>
                                                                        <span className="text-[10px] font-semibold text-slate-600">{apt.startTime}</span>
                                                                        <span className={`text-[10px] ml-1 ${style.text}`}>{apt.customerName.split(' ')[0]}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                            {dayApts.length > 3 && <span className="text-[10px] text-slate-400 font-medium hidden sm:block">+{dayApts.length - 3} more</span>}
                                                            <div className="flex gap-0.5 sm:hidden">
                                                                {dayApts.slice(0, 4).map((apt) => (
                                                                    <div key={apt.id} className={`w-1.5 h-1.5 rounded-full ${getStatusStyle(apt.status).dot}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="card !p-0 overflow-hidden overflow-x-auto">
                                    <div className="grid grid-cols-8 border-b border-slate-100 sticky top-0 bg-white z-10">
                                        <div className="py-3 px-2 text-center text-xs font-bold text-slate-400 border-r border-slate-50">Time</div>
                                        {weekDays.map((date) => {
                                            const dateKey = getDateKey(date);
                                            const isToday = dateKey === today;
                                            return (
                                                <button key={dateKey} onClick={() => handleDateSelect(dateKey)} className={`py-3 text-center border-r border-slate-50 hover:bg-primary-50/50 transition-colors ${isToday ? 'bg-primary-50' : ''} ${dateKey === selectedDate ? 'ring-2 ring-primary-400 ring-inset' : ''}`}>
                                                    <span className="text-xs font-bold text-slate-500 uppercase">{DAYS_SHORT[date.getDay()]}</span>
                                                    <span className={`block text-lg font-bold mt-0.5 ${isToday ? 'text-primary-600' : 'text-slate-800'}`}>{date.getDate()}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="max-h-[600px] overflow-y-auto">
                                        {timeSlots.map((time) => (
                                            <div key={time} className="grid grid-cols-8 border-b border-slate-50 min-h-[50px]">
                                                <div className="py-2 px-2 text-xs text-slate-400 font-medium border-r border-slate-50 text-right pr-3">{time}</div>
                                                {weekDays.map((date) => {
                                                    const dateKey = getDateKey(date);
                                                    const dayApts = getDayAppointments(date);
                                                    const hourApts = dayApts.filter((apt) => apt.startTime.startsWith(time.split(':')[0]));
                                                    return (
                                                        <div key={dateKey} className={`py-1 px-0.5 border-r border-slate-50 ${dateKey === today ? 'bg-primary-50/30' : ''}`}>
                                                            {hourApts.map((apt) => {
                                                                const style = getStatusStyle(apt.status);
                                                                return (
                                                                    <button key={apt.id} onClick={() => setSelectedAppointment(apt)} className={`w-full ${style.bg} border-l-2 ${style.border} rounded-r px-1 py-1 text-left mb-0.5 hover:shadow-md transition-shadow`}>
                                                                        <p className="text-[10px] font-bold text-slate-700 truncate">{apt.customerName.split(' ')[0]}</p>
                                                                        <p className="text-[9px] text-slate-500">{apt.startTime}</p>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Legend */}
                            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-500">
                                {Object.entries(STATUS_COLORS).map(([status, style]) => (
                                    <div key={status} className="flex items-center space-x-1.5">
                                        <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                                        <span className="capitalize font-medium">{status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ========== SIDE PANEL ========== */}
                        <div className="lg:w-96 flex-shrink-0">
                            {selectedAppointment ? (
                                /* Appointment Detail */
                                <div className="card animate-slide-up">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-800">Appointment Detail</h3>
                                        <button onClick={() => setSelectedAppointment(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-400" /></button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-primary-600" /></div>
                                            <div>
                                                <p className="font-bold text-slate-800">{selectedAppointment.customerName}</p>
                                                <p className="text-sm text-slate-500">{selectedAppointment.customerEmail}</p>
                                            </div>
                                        </div>
                                        {selectedAppointment.customerPhone && (
                                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                                                <Phone className="w-4 h-4 text-slate-400" /><span>{selectedAppointment.customerPhone}</span>
                                            </div>
                                        )}
                                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                            <div className="flex items-center space-x-2 text-sm">
                                                <Calendar className="w-4 h-4 text-primary-600" />
                                                <span className="font-semibold text-slate-800">
                                                    {new Date(selectedAppointment.appointmentDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm">
                                                <Clock className="w-4 h-4 text-primary-600" />
                                                <span className="font-semibold text-slate-800">{selectedAppointment.startTime} - {selectedAppointment.endTime}</span>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusStyle(selectedAppointment.status).bg} ${getStatusStyle(selectedAppointment.status).text}`}>
                                            <span className={`w-2 h-2 rounded-full ${getStatusStyle(selectedAppointment.status).dot}`} />
                                            <span className="capitalize">{selectedAppointment.status}</span>
                                        </span>
                                    </div>
                                </div>
                            ) : selectedDate ? (
                                /* ========== DAY SLOTS VIEW ========== */
                                <div className="card animate-slide-up">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-800">
                                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">All slots for this day</p>
                                        </div>
                                        <button onClick={() => setSelectedDate(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-400" /></button>
                                    </div>

                                    {daySlotsLoading ? (
                                        <div className="flex items-center justify-center py-10">
                                            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                                        </div>
                                    ) : !daySlots || daySlots.slots.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                            <p className="text-sm text-slate-400">No schedule configured for this day</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Summary Bar */}
                                            <div className="grid grid-cols-4 gap-2 mb-4">
                                                <div className="text-center p-2 bg-slate-50 rounded-lg">
                                                    <p className="text-lg font-bold text-slate-800">{daySlots.summary.total}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">Total</p>
                                                </div>
                                                <div className="text-center p-2 bg-emerald-50 rounded-lg">
                                                    <p className="text-lg font-bold text-emerald-600">{daySlots.summary.available}</p>
                                                    <p className="text-[10px] text-emerald-600 font-medium">Open</p>
                                                </div>
                                                <div className="text-center p-2 bg-green-50 rounded-lg">
                                                    <p className="text-lg font-bold text-green-600">{daySlots.summary.confirmed}</p>
                                                    <p className="text-[10px] text-green-600 font-medium">Booked</p>
                                                </div>
                                                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                                                    <p className="text-lg font-bold text-yellow-600">{daySlots.summary.pending}</p>
                                                    <p className="text-[10px] text-yellow-600 font-medium">Pending</p>
                                                </div>
                                            </div>

                                            {/* Utilization bar */}
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                                    <span>Utilization</span>
                                                    <span className="font-semibold">{Math.round(((daySlots.summary.total - daySlots.summary.available) / daySlots.summary.total) * 100)}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                                                    {daySlots.summary.confirmed > 0 && (
                                                        <div className="bg-green-500 h-full" style={{ width: `${(daySlots.summary.confirmed / daySlots.summary.total) * 100}%` }} />
                                                    )}
                                                    {daySlots.summary.pending > 0 && (
                                                        <div className="bg-yellow-400 h-full" style={{ width: `${(daySlots.summary.pending / daySlots.summary.total) * 100}%` }} />
                                                    )}
                                                    {daySlots.summary.cancelled > 0 && (
                                                        <div className="bg-red-300 h-full" style={{ width: `${(daySlots.summary.cancelled / daySlots.summary.total) * 100}%` }} />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Slot List */}
                                            <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
                                                {daySlots.slots.map((slot) => {
                                                    const style = getStatusStyle(slot.status);
                                                    const isBooked = slot.status !== 'available';

                                                    return (
                                                        <div
                                                            key={slot.time}
                                                            className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${style.border} ${style.bg} ${isBooked ? 'hover:shadow-md' : ''}`}
                                                        >
                                                            {/* Time */}
                                                            <div className="flex-shrink-0 w-[72px] text-center">
                                                                <p className="text-sm font-bold text-slate-800">{slot.time}</p>
                                                                <p className="text-[10px] text-slate-400">{slot.endTime}</p>
                                                            </div>

                                                            {/* Divider */}
                                                            <div className={`w-0.5 h-8 rounded-full ${style.dot}`} />

                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                {isBooked ? (
                                                                    <>
                                                                        <p className="text-sm font-semibold text-slate-800 truncate">{slot.customerName}</p>
                                                                        <div className="flex items-center gap-2">
                                                                            {slot.customerPhone && (
                                                                                <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                                                                                    <Phone className="w-2.5 h-2.5" />{slot.customerPhone}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <p className="text-sm text-emerald-600 font-medium">Available</p>
                                                                )}
                                                            </div>

                                                            {/* Status + Price */}
                                                            <div className="flex-shrink-0 text-right">
                                                                {isBooked ? (
                                                                    <span className={`inline-flex items-center space-x-1 text-[10px] font-bold ${style.text}`}>
                                                                        {slot.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                                                                        {slot.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                                                                        {slot.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                                                                        <span className="capitalize">{slot.status}</span>
                                                                    </span>
                                                                ) : slot.price > 0 ? (
                                                                    <span className="text-xs font-bold text-slate-600">${slot.price}</span>
                                                                ) : (
                                                                    <span className="text-xs text-slate-400">Free</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                /* Default Summary */
                                <div className="card">
                                    <h3 className="font-bold text-slate-800 mb-4">Quick Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                            <span className="text-sm text-slate-600">Total Appointments</span>
                                            <span className="font-bold text-slate-800">{appointments.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                            <span className="text-sm text-green-700">Confirmed</span>
                                            <span className="font-bold text-green-700">{appointments.filter(a => a.status === 'confirmed').length}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                                            <span className="text-sm text-yellow-700">Pending</span>
                                            <span className="font-bold text-yellow-700">{appointments.filter(a => a.status === 'pending').length}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                            <span className="text-sm text-red-600">Cancelled</span>
                                            <span className="font-bold text-red-600">{appointments.filter(a => a.status === 'cancelled').length}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-4 text-center">Click a date to see all slots</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
