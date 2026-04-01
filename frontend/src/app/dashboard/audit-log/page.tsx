'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText,
    Filter, XCircle, Trash2, Edit, PlusCircle
} from 'lucide-react';
import { useToast } from '@/components/useToast';
import api from '@/lib/api';
import type { AuditEntry, Pagination } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PaginationComponent from '@/components/ui/Pagination';

const ACTION_ICONS: Record<string, any> = {
    create: PlusCircle,
    cancel: XCircle,
    update: Edit,
    delete: Trash2,
};

const ACTION_COLORS: Record<string, string> = {
    create: 'bg-green-100 text-green-600',
    cancel: 'bg-red-100 text-red-600',
    update: 'bg-blue-100 text-blue-600',
    delete: 'bg-red-100 text-red-700',
};

export default function AuditLogPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<AuditEntry[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ action: '', resourceType: '', from: '', to: '' });
    const [showFilters, setShowFilters] = useState(false);

    const { addToast, ToastContainer } = useToast();

    useEffect(() => {
        const userData = localStorage.getItem('user');

        if (userData) {
            const user = JSON.parse(userData);
            if (user.role !== 'owner') {
                router.push('/dashboard');
                return;
            }
        }

        fetchLogs(1);
    }, []);

    const fetchLogs = async (page: number) => {
        try {
            setLoading(true);
            const params: any = { page, limit: 50 };
            if (filters.action) params.action = filters.action;
            if (filters.resourceType) params.resourceType = filters.resourceType;
            if (filters.from) params.from = filters.from;
            if (filters.to) params.to = filters.to;

            const res = await api.get('/admin/audit-log', { params });
            setLogs(res.data.data);
            setPagination(res.data.pagination);
        } catch (error: any) {
            if (error.response?.status === 403) {
                router.push('/dashboard');
            } else {
                addToast('Failed to load audit log', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        fetchLogs(1);
    };

    const clearFilters = () => {
        setFilters({ action: '', resourceType: '', from: '', to: '' });
        setTimeout(() => fetchLogs(1), 0);
    };

    const goToPage = (page: number) => {
        fetchLogs(page);
    };

    const formatDetails = (entry: AuditEntry) => {
        const d = entry.details;
        if (!d || Object.keys(d).length === 0) return null;

        const parts: string[] = [];

        if (d.customerName) parts.push(`Customer: ${d.customerName}`);
        if (d.reason) parts.push(`Reason: ${d.reason}`);
        if (d.price !== undefined) parts.push(`Price: ৳${d.price}`);
        if (d.hadPayment) parts.push(`Had payment: ৳${d.paymentAmount}`);
        if (d.adminName) parts.push(`Admin: ${d.adminName}`);
        if (d.adminEmail) parts.push(`Email: ${d.adminEmail}`);
        if (d.removedName) parts.push(`Removed: ${d.removedName}`);
        if (d.toggled) parts.push(`Status: ${d.toggled}`);
        if (d.startTime) parts.push(`Time: ${d.startTime}`);
        if (d.appointmentDate) {
            parts.push(`Date: ${new Date(d.appointmentDate).toLocaleDateString()}`);
        }

        return parts.length > 0 ? parts.join(' | ') : null;
    };

    return (
        <div>
            <ToastContainer />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                {/* Page Title */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <FileText className="w-6 h-6 text-primary-600" />
                        <h1 className="text-xl font-bold text-slate-800">Audit Log</h1>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all text-sm"
                    >
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                    </button>
                </div>
                {/* Filters */}
                {showFilters && (
                    <div className="card !p-4 mb-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            <select
                                value={filters.action}
                                onChange={e => setFilters({ ...filters, action: e.target.value })}
                                className="input-field text-sm"
                            >
                                <option value="">All Actions</option>
                                <option value="create">Create</option>
                                <option value="cancel">Cancel</option>
                                <option value="update">Update</option>
                                <option value="delete">Delete</option>
                            </select>
                            <select
                                value={filters.resourceType}
                                onChange={e => setFilters({ ...filters, resourceType: e.target.value })}
                                className="input-field text-sm"
                            >
                                <option value="">All Types</option>
                                <option value="appointment">Appointment</option>
                                <option value="schedule">Schedule</option>
                                <option value="admin">Admin</option>
                                <option value="settings">Settings</option>
                            </select>
                            <input
                                type="date"
                                value={filters.from}
                                onChange={e => setFilters({ ...filters, from: e.target.value })}
                                className="input-field text-sm"
                                placeholder="From"
                            />
                            <input
                                type="date"
                                value={filters.to}
                                onChange={e => setFilters({ ...filters, to: e.target.value })}
                                className="input-field text-sm"
                                placeholder="To"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={applyFilters} className="btn-primary text-sm">Apply</button>
                            <button onClick={clearFilters} className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Clear</button>
                        </div>
                    </div>
                )}

                {/* Log Entries */}
                {loading ? (
                    <LoadingSpinner size="md" className="py-12" />
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No audit entries found</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {logs.map(entry => {
                            const Icon = ACTION_ICONS[entry.action] || FileText;
                            const colorClass = ACTION_COLORS[entry.action] || 'bg-slate-100 text-slate-600';
                            const details = formatDetails(entry);

                            return (
                                <div key={entry.id} className="card !p-3 sm:!p-4">
                                    <div className="flex items-start space-x-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center flex-wrap gap-2 mb-1">
                                                <span className="font-medium text-sm text-slate-800">
                                                    {entry.userEmail}
                                                </span>
                                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                                    entry.userRole === 'owner'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {entry.userRole}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(entry.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                <span className="font-medium capitalize">{entry.action}</span>
                                                {' '}
                                                <span className="text-slate-400">{entry.resourceType}</span>
                                            </p>
                                            {details && (
                                                <p className="text-xs text-slate-400 mt-1 truncate">{details}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                <PaginationComponent
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={goToPage}
                />
            </div>
        </div>
    );
}
