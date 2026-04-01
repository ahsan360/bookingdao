'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp, DollarSign, CalendarDays, ChevronDown,
    ChevronUp, BarChart3, Users
} from 'lucide-react';
import { useToast } from '@/components/useToast';
import api from '@/lib/api';
import type { SalesReport } from '@/types';

type GroupType = 'daily' | 'weekly' | 'monthly';

export default function SalesPage() {
    const [report, setReport] = useState<SalesReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState<GroupType>('daily');
    const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);

    // Default date range: current month
    const now = new Date();
    const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const defaultTo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`;

    const [fromDate, setFromDate] = useState(defaultFrom);
    const [toDate, setToDate] = useState(defaultTo);

    const { addToast, ToastContainer } = useToast();

    useEffect(() => {
        fetchReport();
    }, []);

    useEffect(() => {
        fetchReport();
    }, [group, fromDate, toDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await api.get('/appointments/sales-report', {
                params: { from: fromDate, to: toDate, group },
            });
            setReport(response.data);
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to load sales report', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Quick date range presets
    const setPreset = (preset: string) => {
        const today = new Date();
        let from: Date;
        let to: Date;

        switch (preset) {
            case 'today':
                from = today;
                to = today;
                setGroup('daily');
                break;
            case 'this-week': {
                const day = today.getDay();
                from = new Date(today);
                from.setDate(today.getDate() - (day === 0 ? 6 : day - 1)); // Monday
                to = new Date(from);
                to.setDate(from.getDate() + 6); // Sunday
                setGroup('daily');
                break;
            }
            case 'this-month':
                from = new Date(today.getFullYear(), today.getMonth(), 1);
                to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                setGroup('daily');
                break;
            case 'last-month':
                from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                to = new Date(today.getFullYear(), today.getMonth(), 0);
                setGroup('daily');
                break;
            case 'this-year':
                from = new Date(today.getFullYear(), 0, 1);
                to = new Date(today.getFullYear(), 11, 31);
                setGroup('monthly');
                break;
            case 'last-year':
                from = new Date(today.getFullYear() - 1, 0, 1);
                to = new Date(today.getFullYear() - 1, 11, 31);
                setGroup('monthly');
                break;
            default:
                return;
        }

        setFromDate(from.toISOString().split('T')[0]);
        setToDate(to.toISOString().split('T')[0]);
    };

    // Find the max total for bar chart scaling
    const maxTotal = useMemo(() => {
        if (!report?.periods.length) return 1;
        return Math.max(...report.periods.map(p => p.total), 1);
    }, [report]);

    // Average per period
    const avgPerPeriod = useMemo(() => {
        if (!report?.periods.length) return 0;
        return Math.round(report.grandTotal / report.periods.length);
    }, [report]);

    const dayCount = useMemo(() => {
        if (!fromDate || !toDate) return 0;
        const diff = new Date(toDate).getTime() - new Date(fromDate).getTime();
        return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
    }, [fromDate, toDate]);

    return (
        <div>
            <ToastContainer />

            <div className="flex items-center space-x-3 mb-6 px-4 sm:px-6 pt-6"><TrendingUp className="w-6 h-6 text-emerald-600" /><h1 className="text-xl font-bold text-slate-800">Sales Report</h1></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-1">Sales Report</h1>
                    <p className="text-slate-500 text-sm">Track your revenue and bookings over any date range</p>
                </div>

                {/* Filters */}
                <div className="card !p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Date Range */}
                        <div className="flex items-center gap-2 flex-1">
                            <div className="flex-1">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">From</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={e => setFromDate(e.target.value)}
                                    className="input-field !py-2 text-sm w-full"
                                />
                            </div>
                            <span className="text-slate-400 mt-5">-</span>
                            <div className="flex-1">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">To</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={e => setToDate(e.target.value)}
                                    className="input-field !py-2 text-sm w-full"
                                />
                            </div>
                        </div>

                        {/* Group By */}
                        <div>
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Group By</label>
                            <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                                {(['daily', 'weekly', 'monthly'] as GroupType[]).map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setGroup(g)}
                                        className={`px-4 py-2 text-sm font-medium transition-all ${
                                            group === g
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                        {[
                            { key: 'today', label: 'Today' },
                            { key: 'this-week', label: 'This Week' },
                            { key: 'this-month', label: 'This Month' },
                            { key: 'last-month', label: 'Last Month' },
                            { key: 'this-year', label: 'This Year' },
                            { key: 'last-year', label: 'Last Year' },
                        ].map(p => (
                            <button
                                key={p.key}
                                onClick={() => setPreset(p.key)}
                                className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-all"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    </div>
                ) : report ? (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                            <div className="card !p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Total Revenue</p>
                                    <DollarSign className="w-4 h-4 text-emerald-500" />
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold text-slate-800">৳{report.grandTotal.toLocaleString()}</p>
                                <p className="text-xs text-slate-400 mt-1">{dayCount} days</p>
                            </div>

                            <div className="card !p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Total Bookings</p>
                                    <Users className="w-4 h-4 text-blue-500" />
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold text-slate-800">{report.grandCount}</p>
                                <p className="text-xs text-slate-400 mt-1">confirmed</p>
                            </div>

                            <div className="card !p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Avg / {group === 'daily' ? 'Day' : group === 'weekly' ? 'Week' : 'Month'}</p>
                                    <TrendingUp className="w-4 h-4 text-purple-500" />
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold text-slate-800">৳{avgPerPeriod.toLocaleString()}</p>
                                <p className="text-xs text-slate-400 mt-1">{report.periods.length} period{report.periods.length !== 1 ? 's' : ''}</p>
                            </div>

                            <div className="card !p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Avg / Booking</p>
                                    <CalendarDays className="w-4 h-4 text-amber-500" />
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold text-slate-800">
                                    ৳{report.grandCount > 0 ? Math.round(report.grandTotal / report.grandCount).toLocaleString() : '0'}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">per appointment</p>
                            </div>
                        </div>

                        {/* Revenue Chart (simple bar chart) */}
                        {report.periods.length > 0 && (
                            <div className="card mb-6">
                                <h3 className="text-sm font-bold text-slate-700 mb-4">Revenue Overview</h3>
                                <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                                    {[...report.periods].reverse().map(period => {
                                        const barWidth = maxTotal > 0 ? (period.total / maxTotal) * 100 : 0;
                                        return (
                                            <div key={period.key} className="flex items-center gap-3 group">
                                                <div className="w-28 sm:w-40 text-xs text-slate-500 font-medium truncate flex-shrink-0 text-right">
                                                    {group === 'daily'
                                                        ? new Date(period.key + 'T00:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
                                                        : period.label
                                                    }
                                                </div>
                                                <div className="flex-1 h-7 bg-slate-50 rounded-md overflow-hidden relative">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-md transition-all duration-500 flex items-center"
                                                        style={{ width: `${Math.max(barWidth, 2)}%` }}
                                                    >
                                                        {barWidth > 25 && (
                                                            <span className="text-[10px] text-white font-semibold pl-2">
                                                                ৳{period.total.toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {barWidth <= 25 && period.total > 0 && (
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-semibold"
                                                            style={{ left: `calc(${Math.max(barWidth, 2)}% + 8px)` }}>
                                                            ৳{period.total.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-400 w-8 text-right flex-shrink-0">
                                                    {period.count}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Detailed Period Breakdown */}
                        <div className="card">
                            <h3 className="text-sm font-bold text-slate-700 mb-4">Detailed Breakdown</h3>
                            {report.periods.length === 0 ? (
                                <div className="text-center py-12">
                                    <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500 text-sm">No sales in this date range</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {report.periods.map(period => {
                                        const isExpanded = expandedPeriod === period.key;
                                        return (
                                            <div key={period.key} className="border border-slate-100 rounded-xl overflow-hidden">
                                                {/* Period header */}
                                                <button
                                                    onClick={() => setExpandedPeriod(isExpanded ? null : period.key)}
                                                    className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-slate-50 transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <CalendarDays className="w-4 h-4 text-primary-600" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-semibold text-slate-800">{period.label}</p>
                                                            <p className="text-xs text-slate-400">{period.count} booking{period.count !== 1 ? 's' : ''}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm sm:text-base font-bold text-emerald-600">৳{period.total.toLocaleString()}</span>
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-4 h-4 text-slate-400" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                                        )}
                                                    </div>
                                                </button>

                                                {/* Expanded: individual appointments */}
                                                {isExpanded && (
                                                    <div className="border-t border-slate-100 bg-slate-50/50">
                                                        <div className="divide-y divide-slate-100">
                                                            {period.appointments.map(apt => (
                                                                <div key={apt.id} className="flex items-center gap-3 px-4 py-2.5">
                                                                    <div className="text-center min-w-[50px]">
                                                                        <p className="text-xs font-bold text-slate-700">{apt.startTime}</p>
                                                                        <p className="text-[10px] text-slate-400">{apt.endTime}</p>
                                                                    </div>
                                                                    <div className="w-px h-6 bg-slate-200" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-slate-700 truncate">{apt.customerName}</p>
                                                                        <p className="text-xs text-slate-400">{apt.customerPhone}</p>
                                                                    </div>
                                                                    <div className="text-xs text-slate-400 hidden sm:block">
                                                                        {new Date(apt.appointmentDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-slate-700">৳{apt.price}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {/* Period total footer */}
                                                        <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 border-t border-emerald-100">
                                                            <span className="text-xs font-semibold text-emerald-700">Period Total</span>
                                                            <span className="text-sm font-bold text-emerald-700">৳{period.total.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Grand Total Footer */}
                            {report.periods.length > 0 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Grand Total</p>
                                        <p className="text-xs text-slate-400">{report.grandCount} bookings in {report.periods.length} {group === 'daily' ? 'day' : group === 'weekly' ? 'week' : 'month'}{report.periods.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <p className="text-xl sm:text-2xl font-bold text-emerald-600">৳{report.grandTotal.toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
