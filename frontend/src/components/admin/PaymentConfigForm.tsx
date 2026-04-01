'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/components/useToast';
import api from '@/lib/api';

export default function PaymentConfigForm() {
    const [storeId, setStoreId] = useState('');
    const [storePassword, setStorePassword] = useState('');
    const [sandboxMode, setSandboxMode] = useState(true);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const { addToast, ToastContainer } = useToast();

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await api.get('/admin/payment-config');

            const { storeId, sandboxMode, isActive } = response.data;
            setStoreId(storeId); // This will be masked (e.g. ****1234)
            setSandboxMode(sandboxMode);
            setIsActive(isActive);
        } catch (error: any) {
            // If 404, it means not configured yet, which is fine
            if (error.response?.status !== 404) {
                console.error('Failed to fetch payment config:', error);
                addToast('Failed to load payment configuration', 'error');
            }
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/admin/payment-config', {
                storeId,
                storePassword,
                sandboxMode,
            });

            addToast('Payment configuration saved successfully', 'success');
            // Re-fetch to get masked ID and ensure state is synced
            fetchConfig();
        } catch (error: any) {
            console.error('Failed to save payment config:', error);
            addToast(error.response?.data?.message || 'Failed to save configuration', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async () => {
        try {
            const newStatus = !isActive;
            await api.patch('/admin/payment-config/status', { isActive: newStatus });
            setIsActive(newStatus);
            addToast(`Payment gateway ${newStatus ? 'activated' : 'deactivated'}`, 'success');
        } catch (error) {
            console.error('Failed to update status:', error);
            addToast('Failed to update status', 'error');
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="card max-w-2xl mx-auto">
            <ToastContainer />
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Payment Gateway</h2>
                    <p className="text-slate-600 text-sm">Configure SSLCommerz for receiving payments</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="label">Store ID</label>
                        <input
                            type="text"
                            value={storeId}
                            onChange={(e) => setStoreId(e.target.value)}
                            placeholder="your-store-id"
                            className="input-field"
                            required
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Your SSLCommerz Store ID (Public Key)
                        </p>
                    </div>

                    <div>
                        <label className="label">Store Password</label>
                        <input
                            type="password"
                            value={storePassword}
                            onChange={(e) => setStorePassword(e.target.value)}
                            placeholder={storeId.includes('****') ? 'Unchanged' : 'your-store-password'}
                            className="input-field"
                            required={!storeId.includes('****')}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Your SSLCommerz Store Password (Secret Key)
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <input
                            type="checkbox"
                            checked={sandboxMode}
                            onChange={(e) => setSandboxMode(e.target.checked)}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <div>
                            <span className="font-semibold text-slate-700">Sandbox Mode</span>
                            <p className="text-xs text-slate-500">Enable for testing with dummy credentials</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                        <span className={`text-sm font-semibold ${isActive ? 'text-green-600' : 'text-slate-500'}`}>
                            {isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                            type="button"
                            onClick={toggleStatus}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${isActive ? 'bg-green-500' : 'bg-slate-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center space-x-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        <span>Save Configuration</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
