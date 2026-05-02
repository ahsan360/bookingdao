'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileEdit } from 'lucide-react';
import PageConfigForm from '@/components/admin/PageConfigForm';
import ProGate from '@/components/ProGate';

export default function PageEditorPage() {
    return (
        <ProGate
            feature="pageEditor"
            title="Custom branding & page editor"
            description="Make your booking page unmistakably yours. Upload a banner image, build a portfolio gallery, set custom brand colors, and craft your business story."
            bullets={[
                'Banner image and 6-photo gallery',
                'Custom primary color',
                'Custom headline and About section',
                'Social links (Facebook, Instagram, WhatsApp)',
                'Remove "Powered by BookingDeo" badge',
            ]}
        >
            <PageEditorInner />
        </ProGate>
    );
}

function PageEditorInner() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    return (
        <div>
            {/* Page Title */}
            <div className="flex items-center space-x-3 mb-6">
                <FileEdit className="w-7 h-7 text-primary-600" />
                <h1 className="text-2xl font-bold text-slate-800">Page Editor</h1>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center space-x-3">
                        <FileEdit className="w-8 h-8 text-primary-600" />
                        <span>Customize Your Booking Page</span>
                    </h1>
                    <p className="text-slate-600 mt-2">Add your logo, banner, description, and contact details. Your customers will see this on your booking page.</p>
                </div>

                <PageConfigForm />
            </div>
        </div>
    );
}
