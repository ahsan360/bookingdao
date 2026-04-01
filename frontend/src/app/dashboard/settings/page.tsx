'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Settings, Save, Loader2, CreditCard, Store, Building2, ChevronRight, Globe,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import PaymentConfigForm from '@/components/admin/PaymentConfigForm';
import { useToast } from '@/components/useToast';
import api from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────

type BookingMode = 'payment_required' | 'manual_only' | 'both';

interface SettingsTab {
    key: string;
    label: string;
    icon: any;
    color: string;
}

interface TenantSettings {
    id: string;
    businessName: string;
    subdomain: string;
    email: string | null;
    bookingMode: BookingMode;
}

// ─── Constants ──────────────────────────────────────────────────────

const TABS: SettingsTab[] = [
    { key: 'general', label: 'General', icon: Building2, color: 'text-slate-600' },
    { key: 'booking', label: 'Booking', icon: Store, color: 'text-indigo-600' },
    { key: 'payment', label: 'Payment', icon: CreditCard, color: 'text-emerald-600' },
    { key: 'language', label: 'Language', icon: Globe, color: 'text-blue-600' },
];

const BOOKING_MODE_OPTIONS: { value: BookingMode; label: string; description: string }[] = [
    {
        value: 'payment_required',
        label: 'Payment Required',
        description: 'Customers must pay online via SSLCommerz to confirm their booking.',
    },
    {
        value: 'manual_only',
        label: 'Manual Only',
        description: 'Bookings are confirmed instantly without online payment. Collect payment in person.',
    },
    {
        value: 'both',
        label: 'Both Options',
        description: 'Customers can choose to pay online or book without payment.',
    },
];

// ─── Sub-Setting Components ─────────────────────────────────────────

function GeneralSettings({
    settings,
    onUpdate,
}: {
    settings: TenantSettings;
    onUpdate: (data: TenantSettings) => void;
}) {
    const [businessName, setBusinessName] = useState(settings.businessName);
    const [email, setEmail] = useState(settings.email || '');
    const [saving, setSaving] = useState(false);
    const { addToast, ToastContainer } = useToast();

    const hasChanges = businessName !== settings.businessName || (email || null) !== settings.email;

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await api.patch('/admin/settings', {
                businessName, email: email || null,
            });
            onUpdate(response.data);
            addToast('General settings saved', 'success');
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <ToastContainer />
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">General</h3>
                <p className="text-sm text-slate-500">Basic information about your business</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="label">Business Name</label>
                    <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="input-field"
                        placeholder="Your business name"
                    />
                </div>

                <div>
                    <label className="label">Business Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                        placeholder="contact@business.com"
                    />
                    <p className="text-xs text-slate-500 mt-1">Used for business communications</p>
                </div>

                <div>
                    <label className="label">Subdomain</label>
                    <div className="input-field bg-slate-50 text-slate-500 cursor-not-allowed">
                        {settings.subdomain}.bookease.com
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Subdomain cannot be changed after creation</p>
                </div>
            </div>

            {hasChanges && (
                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSave}
                        disabled={saving || !businessName.trim()}
                        className="btn-primary flex items-center space-x-2"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>Save Changes</span>
                    </button>
                </div>
            )}
        </div>
    );
}

function BookingSettings({
    settings,
    onUpdate,
}: {
    settings: TenantSettings;
    onUpdate: (data: TenantSettings) => void;
}) {
    const [bookingMode, setBookingMode] = useState<BookingMode>(settings.bookingMode);
    const [saving, setSaving] = useState(false);
    const { addToast, ToastContainer } = useToast();

    const hasChanges = bookingMode !== settings.bookingMode;

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await api.patch('/admin/settings', { bookingMode });
            onUpdate(response.data);
            addToast('Booking mode updated', 'success');
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to update', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <ToastContainer />
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Booking</h3>
                <p className="text-sm text-slate-500">Control how customers book appointments</p>
            </div>

            <div className="space-y-3">
                {BOOKING_MODE_OPTIONS.map((option) => (
                    <label
                        key={option.value}
                        className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            bookingMode === option.value
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                    >
                        <input
                            type="radio"
                            name="bookingMode"
                            value={option.value}
                            checked={bookingMode === option.value}
                            onChange={() => setBookingMode(option.value)}
                            className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                            <span className="font-semibold text-slate-800">{option.label}</span>
                            <p className="text-sm text-slate-500 mt-0.5">{option.description}</p>
                        </div>
                    </label>
                ))}
            </div>

            {hasChanges && (
                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary flex items-center space-x-2"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>Save Booking Mode</span>
                    </button>
                </div>
            )}
        </div>
    );
}

function PaymentSettings() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Payment Gateway</h3>
                <p className="text-sm text-slate-500">Configure SSLCommerz for receiving online payments</p>
            </div>
            <PaymentConfigForm />
        </div>
    );
}

function LanguageSettings() {
    const { locale, setLocale, t } = useTranslation();
    const [selected, setSelected] = useState(locale);
    const { addToast, ToastContainer } = useToast();

    const hasChanges = selected !== locale;

    const handleSave = () => {
        setLocale(selected as any);
        addToast(t.common.success, 'success');
    };

    const LANGUAGE_OPTIONS = [
        { value: 'en', label: 'English', nativeLabel: 'English' },
        { value: 'bn', label: 'বাংলা', nativeLabel: 'Bangla' },
    ];

    return (
        <div className="space-y-6">
            <ToastContainer />
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{t.settings.languageTitle}</h3>
                <p className="text-sm text-slate-500">{t.settings.languageDescription}</p>
            </div>

            <div className="space-y-3">
                {LANGUAGE_OPTIONS.map((option) => (
                    <label
                        key={option.value}
                        className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selected === option.value
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                    >
                        <input
                            type="radio"
                            name="language"
                            value={option.value}
                            checked={selected === option.value}
                            onChange={() => setSelected(option.value as any)}
                            className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                            <span className="font-semibold text-slate-800">{option.label}</span>
                            <p className="text-sm text-slate-500 mt-0.5">{option.nativeLabel}</p>
                        </div>
                    </label>
                ))}
            </div>

            {hasChanges && (
                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSave}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <Save className="w-5 h-5" />
                        <span>{t.settings.saveLanguage}</span>
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Main Settings Page ─────────────────────────────────────────────

export default function SettingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'general');
    const [settings, setSettings] = useState<TenantSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToast, ToastContainer } = useToast();

    useEffect(() => {
        fetchSettings();
    }, [router]);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/admin/settings');
            setSettings(response.data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            addToast('Failed to load settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (key: string) => {
        setActiveTab(key);
        router.replace(`/dashboard/settings?tab=${key}`, { scroll: false });
    };

    const handleSettingsUpdate = (data: TenantSettings) => {
        setSettings(data);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <ToastContainer />

            {/* Page Title */}
            <div className="flex items-center space-x-3 mb-8">
                <Settings className="w-6 h-6 text-primary-600" />
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Settings</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Tabs (desktop) / Horizontal Tabs (mobile) */}
                <nav className="lg:w-56 flex-shrink-0">
                    {/* Mobile: horizontal scroll tabs */}
                    <div className="flex lg:hidden gap-2 overflow-x-auto pb-2">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                        isActive
                                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : tab.color}`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Desktop: vertical sidebar */}
                    <div className="hidden lg:flex flex-col gap-1">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                        isActive
                                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-primary-600' : tab.color}`} />
                                        <span>{tab.label}</span>
                                    </div>
                                    {isActive && <ChevronRight className="w-4 h-4 text-primary-400" />}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Content Area */}
                <div className="flex-1 card min-h-[400px]">
                    {settings && activeTab === 'general' && (
                        <GeneralSettings settings={settings} onUpdate={handleSettingsUpdate} />
                    )}
                    {settings && activeTab === 'booking' && (
                        <BookingSettings settings={settings} onUpdate={handleSettingsUpdate} />
                    )}
                    {activeTab === 'payment' && (
                        <PaymentSettings />
                    )}
                    {activeTab === 'language' && (
                        <LanguageSettings />
                    )}
                </div>
            </div>
        </div>
    );
}
