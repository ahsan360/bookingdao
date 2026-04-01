'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, ArrowUpDown } from 'lucide-react';
import api from '@/lib/api';
import type { Customer, Pagination } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PaginationComponent from '@/components/ui/Pagination';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('bookings');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchCustomers();
    }, [search, sort, order, page]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: String(page),
                limit: '50',
                sort,
                order,
            });
            if (search) params.set('search', search);

            const res = await api.get(`/admin/customers?${params}`);
            setCustomers(res.data.data);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSort = (field: string) => {
        if (sort === field) {
            setOrder(order === 'desc' ? 'asc' : 'desc');
        } else {
            setSort(field);
            setOrder('desc');
        }
        setPage(1);
    };

    const SortHeader = ({ field, label }: { field: string; label: string }) => (
        <button
            onClick={() => toggleSort(field)}
            className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider ${
                sort === field ? 'text-primary-600' : 'text-slate-400'
            }`}
        >
            {label}
            <ArrowUpDown className="w-3 h-3" />
        </button>
    );

    if (loading && customers.length === 0) {
        return <LoadingSpinner size="md" className="py-20" />;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-cyan-600" />
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Customers</h1>
                        {pagination && (
                            <p className="text-sm text-slate-400">{pagination.total} total</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by name, phone, or email..."
                    className="input-field !pl-10"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
            </div>

            {/* Table */}
            {customers.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{search ? 'No customers match your search' : 'No customers yet'}</p>
                    <p className="text-sm mt-1">Customers appear here after they make bookings</p>
                </div>
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="hidden sm:block card !p-0 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="text-left px-4 py-3">
                                        <SortHeader field="name" label="Name" />
                                    </th>
                                    <th className="text-left px-4 py-3">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contact</span>
                                    </th>
                                    <th className="text-center px-4 py-3">
                                        <SortHeader field="bookings" label="Bookings" />
                                    </th>
                                    <th className="text-right px-4 py-3">
                                        <SortHeader field="spent" label="Spent" />
                                    </th>
                                    <th className="text-right px-4 py-3">
                                        <SortHeader field="recent" label="Last Visit" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer, i) => (
                                    <tr key={customer.phone} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${i === customers.length - 1 ? 'border-0' : ''}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-slate-800">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    {customer.phone}
                                                </div>
                                                {customer.email && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                        <Mail className="w-3 h-3" />
                                                        {customer.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-sm font-semibold text-slate-800">{customer.bookingCount}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-sm font-medium text-slate-700">
                                                {customer.totalSpent > 0 ? `৳${customer.totalSpent.toLocaleString()}` : '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-xs text-slate-400">
                                                {new Date(customer.lastBooking).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="sm:hidden space-y-2">
                        {customers.map(customer => (
                            <div key={customer.phone} className="card !p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                        {customer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 truncate">{customer.name}</h4>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                            <Phone className="w-3 h-3" />
                                            {customer.phone}
                                        </div>
                                        {customer.email && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                                <Mail className="w-3 h-3" />
                                                <span className="truncate">{customer.email}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                            <span><strong className="text-slate-700">{customer.bookingCount}</strong> bookings</span>
                                            {customer.totalSpent > 0 && (
                                                <span>৳{customer.totalSpent.toLocaleString()}</span>
                                            )}
                                            <span>
                                                {new Date(customer.lastBooking).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && (
                        <PaginationComponent
                            page={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}
        </div>
    );
}
