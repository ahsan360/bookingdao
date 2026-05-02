'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import PaymentConfigForm from '@/components/admin/PaymentConfigForm';
import ProGate from '@/components/ProGate';

export default function PaymentConfigPage() {
    return (
        <ProGate
            feature="paymentGateway"
            title="Online payments"
            description="Collect payments upfront when customers book. Pluggable payment gateway with encrypted credentials, slot locking, and automatic confirmation on successful capture."
            bullets={[
                'Collect payments at booking time',
                'Encrypted gateway credentials',
                'Slot locking prevents double-bookings',
                'Auto-confirm on successful payment',
                'Refund handling for cancellations',
            ]}
        >
            <PaymentConfigInner />
        </ProGate>
    );
}

function PaymentConfigInner() {
    const router = useRouter();
    const [tenant, setTenant] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const tenantData = localStorage.getItem('tenant');

        if (!token) {
            router.push('/login');
            return;
        }

        if (tenantData) {
            setTenant(JSON.parse(tenantData));
        }
    }, [router]);

    return (
        <div>
            {/* Page Title */}
            <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-6 h-6 text-primary-600" />
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Payment Settings</h1>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <p className="text-slate-600 mb-8">Manage your payment gateway credentials and preferences</p>

                <PaymentConfigForm />
            </div>
        </div>
    );
}
