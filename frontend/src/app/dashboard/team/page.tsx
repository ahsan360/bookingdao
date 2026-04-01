'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users, Shield, ShieldCheck, UserPlus,
    Trash2, ToggleLeft, ToggleRight, AlertTriangle, Phone, Mail
} from 'lucide-react';
import { useToast } from '@/components/useToast';
import { useConfirm } from '@/components/ConfirmDialog';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import type { TeamMember } from '@/types';

interface Limits {
    maxAdmins: number;
    currentCount: number;
    canAdd: boolean;
}

export default function TeamPage() {
    const router = useRouter();
    const { isOwner, isAuthenticated, loading: authLoading } = useAuth();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [limits, setLimits] = useState<Limits | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState({
        firstName: '', lastName: '', email: '', phone: '', password: '',
        contactMethod: 'phone' as 'phone' | 'email',
    });
    const [adding, setAdding] = useState(false);

    const { addToast, ToastContainer } = useToast();
    const { confirm, ConfirmDialogComponent } = useConfirm();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }
        if (!authLoading && !isOwner) {
            router.push('/dashboard');
            return;
        }
        if (!authLoading && isOwner) {
            fetchTeam();
        }
    }, [authLoading, isAuthenticated, isOwner]);

    const fetchTeam = async () => {
        try {
            const res = await api.get('/admin/team');
            setMembers(res.data.members);
            setLimits(res.data.limits);
        } catch (error: any) {
            if (error.response?.status === 403) {
                addToast('Only the business owner can access this page', 'error');
                router.push('/dashboard');
            } else {
                addToast('Failed to load team', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        try {
            const payload: any = {
                firstName: addForm.firstName,
                lastName: addForm.lastName,
                password: addForm.password,
            };
            if (addForm.contactMethod === 'phone') {
                payload.phone = addForm.phone;
            } else {
                payload.email = addForm.email;
            }

            await api.post('/admin/team', payload);
            addToast('Team member added successfully', 'success');
            setShowAddForm(false);
            setAddForm({ firstName: '', lastName: '', email: '', phone: '', password: '', contactMethod: 'phone' });
            fetchTeam();
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to add member', 'error');
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (member: TeamMember) => {
        const displayName = member.name || `${member.firstName} ${member.lastName}`.trim();
        const contact = member.email || member.phone || '';
        const ok = await confirm(
            'Remove Team Member',
            `Are you sure you want to remove ${displayName}${contact ? ` (${contact})` : ''}? They will lose access immediately.`
        );
        if (!ok) return;

        try {
            await api.delete(`/admin/team/${member.id}`);
            addToast('Team member removed', 'success');
            fetchTeam();
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to remove member', 'error');
        }
    };

    const handleToggle = async (member: TeamMember) => {
        try {
            await api.patch(`/admin/team/${member.id}/toggle`);
            const displayName = member.name || `${member.firstName} ${member.lastName}`.trim();
            addToast(`${displayName} ${member.isActive ? 'deactivated' : 'activated'}`, 'success');
            fetchTeam();
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to update member', 'error');
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <ToastContainer />
            {ConfirmDialogComponent}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Page Title */}
                <div className="flex items-center space-x-3 mb-6">
                    <Users className="w-6 h-6 text-primary-600" />
                    <h1 className="text-xl font-bold text-slate-800">Team Management</h1>
                </div>

                {/* Plan Info */}
                {limits && (
                    <div className="card !p-4 mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Team Size</p>
                            <p className="text-lg font-bold text-slate-800">
                                {limits.currentCount} / {limits.maxAdmins === -1 ? 'Unlimited' : limits.maxAdmins}
                            </p>
                        </div>
                        {limits.canAdd ? (
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="btn-primary flex items-center space-x-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Add Member</span>
                            </button>
                        ) : (
                            <div className="flex items-center space-x-2 text-amber-600 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Upgrade plan to add more</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Add Form */}
                {showAddForm && (
                    <div className="card !p-5 mb-6">
                        <h3 className="text-sm font-semibold text-slate-700 mb-4">Add New Admin</h3>
                        <form onSubmit={handleAdd} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={addForm.firstName}
                                    onChange={e => setAddForm({ ...addForm, firstName: e.target.value })}
                                    className="input-field"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={addForm.lastName}
                                    onChange={e => setAddForm({ ...addForm, lastName: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            {/* Contact method toggle */}
                            <div className="flex rounded-xl bg-slate-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => setAddForm({ ...addForm, contactMethod: 'phone' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                                        addForm.contactMethod === 'phone'
                                            ? 'bg-white text-primary-700 shadow-sm'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    <Phone className="w-3.5 h-3.5" />
                                    Phone
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAddForm({ ...addForm, contactMethod: 'email' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                                        addForm.contactMethod === 'email'
                                            ? 'bg-white text-primary-700 shadow-sm'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                    Email
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {addForm.contactMethod === 'phone' ? (
                                    <input
                                        type="tel"
                                        placeholder="01XXXXXXXXX"
                                        value={addForm.phone}
                                        onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
                                        className="input-field"
                                        inputMode="numeric"
                                        required
                                    />
                                ) : (
                                    <input
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={addForm.email}
                                        onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                )}
                                <input
                                    type="password"
                                    placeholder="Password (min 6 chars)"
                                    value={addForm.password}
                                    onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                                    className="input-field"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <button type="submit" disabled={adding} className="btn-primary text-sm">
                                    {adding ? 'Adding...' : 'Add Admin'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setAddForm({ firstName: '', lastName: '', email: '', phone: '', password: '', contactMethod: 'phone' });
                                    }}
                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Members List */}
                <div className="space-y-3">
                    {members.map(member => {
                        const displayName = member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim();
                        const contact = member.email || member.phone || '';
                        return (
                            <div
                                key={member.id}
                                className={`card !p-4 flex items-center justify-between ${!member.isActive ? 'opacity-60' : ''}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        member.role === 'owner'
                                            ? 'bg-amber-100 text-amber-600'
                                            : 'bg-blue-100 text-blue-600'
                                    }`}>
                                        {member.role === 'owner'
                                            ? <ShieldCheck className="w-5 h-5" />
                                            : <Shield className="w-5 h-5" />
                                        }
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <p className="font-semibold text-slate-800">{displayName}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                member.role === 'owner'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {member.role}
                                            </span>
                                            {!member.isActive && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500">{contact}</p>
                                        <p className="text-xs text-slate-400">
                                            Joined {new Date(member.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {member.role !== 'owner' && (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleToggle(member)}
                                            className={`p-2 rounded-lg transition-all ${
                                                member.isActive
                                                    ? 'hover:bg-amber-50 text-amber-500'
                                                    : 'hover:bg-green-50 text-green-500'
                                            }`}
                                            title={member.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            {member.isActive
                                                ? <ToggleRight className="w-5 h-5" />
                                                : <ToggleLeft className="w-5 h-5" />
                                            }
                                        </button>
                                        <button
                                            onClick={() => handleRemove(member)}
                                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-all"
                                            title="Remove"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {members.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No team members yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
