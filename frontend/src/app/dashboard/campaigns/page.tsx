'use client';

import { useState, useEffect } from 'react';
import {
    Megaphone, Send, Phone, Mail, Users, CheckCircle,
    AlertCircle, Clock, MessageSquare
} from 'lucide-react';
import { useToast } from '@/components/useToast';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import type { Campaign } from '@/types';
import ProGate from '@/components/ProGate';

interface CustomerStats {
    total: number;
    withPhone: number;
    withEmail: number;
}

export default function CampaignsPage() {
    return (
        <ProGate
            feature="campaigns"
            title="Marketing campaigns"
            description="Bring customers back with targeted SMS and email blasts. Send promotional messages to your entire customer base in one click — track delivery, opens, and conversions."
            bullets={[
                'Bulk SMS and Email campaigns',
                'Customer reach preview before sending',
                'Delivery and failure tracking',
                'Filter by customer segments',
            ]}
        >
            <CampaignsPageInner />
        </ProGate>
    );
}

function CampaignsPageInner() {
    const { isOwner } = useAuth();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [sending, setSending] = useState(false);
    const [form, setForm] = useState({
        title: '',
        message: '',
        channel: 'sms' as 'sms' | 'email' | 'both',
    });

    const { addToast, ToastContainer } = useToast();

    useEffect(() => {
        fetchCampaigns();
        fetchCustomerStats();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await api.get('/admin/campaigns');
            setCampaigns(res.data.data);
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerStats = async () => {
        try {
            const res = await api.get('/admin/campaigns/customers');
            setCustomerStats(res.data);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await api.post('/admin/campaigns', form);
            addToast(`Campaign sent to ${res.data.sentCount} customer(s)!`, 'success');
            setShowForm(false);
            setForm({ title: '', message: '', channel: 'sms' });
            fetchCampaigns();
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to send campaign', 'error');
        } finally {
            setSending(false);
        }
    };

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case 'sms': return Phone;
            case 'email': return Mail;
            case 'both': return MessageSquare;
            default: return MessageSquare;
        }
    };

    const getReachCount = () => {
        if (!customerStats) return 0;
        if (form.channel === 'sms') return customerStats.withPhone;
        if (form.channel === 'email') return customerStats.withEmail;
        return customerStats.total;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <ToastContainer />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Megaphone className="w-6 h-6 text-primary-600" />
                        <h1 className="text-xl font-bold text-slate-800">Campaigns</h1>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <Send className="w-4 h-4" />
                        <span>New Campaign</span>
                    </button>
                </div>

                {/* Customer Stats */}
                {customerStats && (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="card !p-4 text-center">
                            <Users className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-slate-800">{customerStats.total}</p>
                            <p className="text-xs text-slate-500">Total Customers</p>
                        </div>
                        <div className="card !p-4 text-center">
                            <Phone className="w-5 h-5 text-green-500 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-slate-800">{customerStats.withPhone}</p>
                            <p className="text-xs text-slate-500">With Phone</p>
                        </div>
                        <div className="card !p-4 text-center">
                            <Mail className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-slate-800">{customerStats.withEmail}</p>
                            <p className="text-xs text-slate-500">With Email</p>
                        </div>
                    </div>
                )}

                {/* New Campaign Form */}
                {showForm && (
                    <div className="card !p-5 mb-6">
                        <h3 className="text-sm font-semibold text-slate-700 mb-4">Create Campaign</h3>
                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="label">Campaign Title</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="Weekend Special Offer"
                                />
                            </div>

                            <div>
                                <label className="label">Message</label>
                                <textarea
                                    required
                                    className="input-field h-28 resize-none"
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                    placeholder="20% off all bookings this weekend! Book now at your-link.bookdao.com"
                                    maxLength={160}
                                />
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-slate-400">
                                        {form.channel === 'sms' ? 'SMS limit: 160 characters' : 'No character limit for email'}
                                    </p>
                                    <p className="text-xs text-slate-400">{form.message.length}/160</p>
                                </div>
                            </div>

                            <div>
                                <label className="label mb-2">Send Via</label>
                                <div className="flex rounded-xl bg-slate-100 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, channel: 'sms' })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                            form.channel === 'sms' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'
                                        }`}
                                    >
                                        <Phone className="w-3.5 h-3.5" />
                                        SMS
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, channel: 'email' })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                            form.channel === 'email' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'
                                        }`}
                                    >
                                        <Mail className="w-3.5 h-3.5" />
                                        Email
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, channel: 'both' })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                            form.channel === 'both' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'
                                        }`}
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        Both
                                    </button>
                                </div>
                            </div>

                            {/* Preview reach */}
                            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                                <p className="text-sm text-primary-700">
                                    This campaign will reach <strong>{getReachCount()}</strong> customer{getReachCount() !== 1 ? 's' : ''} via{' '}
                                    <strong>{form.channel === 'both' ? 'SMS + Email' : form.channel.toUpperCase()}</strong>
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    type="submit"
                                    disabled={sending || getReachCount() === 0}
                                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>{sending ? 'Sending...' : 'Send Campaign'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setForm({ title: '', message: '', channel: 'sms' }); }}
                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Campaign History */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-700">Campaign History</h3>
                    {campaigns.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No campaigns sent yet</p>
                            <p className="text-sm mt-1">Create your first campaign to reach your customers</p>
                        </div>
                    ) : (
                        campaigns.map(campaign => {
                            const ChannelIcon = getChannelIcon(campaign.channel);
                            return (
                                <div key={campaign.id} className="card !p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-bold text-slate-800">{campaign.title}</h4>
                                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    campaign.status === 'sent'
                                                        ? 'bg-green-50 text-green-700'
                                                        : campaign.status === 'failed'
                                                            ? 'bg-red-50 text-red-600'
                                                            : 'bg-slate-50 text-slate-600'
                                                }`}>
                                                    {campaign.status === 'sent' ? (
                                                        <CheckCircle className="w-3 h-3" />
                                                    ) : campaign.status === 'failed' ? (
                                                        <AlertCircle className="w-3 h-3" />
                                                    ) : (
                                                        <Clock className="w-3 h-3" />
                                                    )}
                                                    {campaign.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2 line-clamp-2">{campaign.message}</p>
                                            <div className="flex items-center gap-4 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <ChannelIcon className="w-3 h-3" />
                                                    {campaign.channel.toUpperCase()}
                                                </span>
                                                <span>Sent to {campaign.sentCount}</span>
                                                {campaign.failCount > 0 && (
                                                    <span className="text-red-400">{campaign.failCount} failed</span>
                                                )}
                                                <span>
                                                    {campaign.sentAt
                                                        ? new Date(campaign.sentAt).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                        : new Date(campaign.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
