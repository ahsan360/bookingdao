'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Copy, Trash2, Plus, X, ChevronRight, Zap } from 'lucide-react';
import { useToast } from '@/components/useToast';
import { useConfirm } from '@/components/ConfirmDialog';
import api from '@/lib/api';

interface Schedule {
    id: string;
    name: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDuration: number;
    price: number;
    isActive: boolean;
    breaks: ScheduleBreak[];
}

interface ScheduleBreak {
    id: string;
    startTime: string;
    endTime: string;
}

interface DayConfig {
    enabled: boolean;
    startTime: string;
    endTime: string;
    slotDuration: number;
    price: number;
    breaks: { startTime: string; endTime: string }[];
    schedule?: Schedule;
}

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAYS_FULL = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_MAP = [6, 0, 1, 2, 3, 4, 5]; // Maps grid index to dayOfWeek (Sat=6, Sun=0, Mon=1...)
const SLOT_DURATIONS = [15, 30, 45, 60, 90, 120];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const TEMPLATES = [
    { name: '9-5 Weekdays', icon: '💼', days: [false, true, true, true, true, true, false], start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' },
    { name: '10-6 All Week', icon: '🏪', days: [true, true, true, true, true, true, true], start: '10:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    { name: '8-8 Sat-Thu', icon: '🏥', days: [true, true, true, true, true, true, false], start: '08:00', end: '20:00', breakStart: '13:00', breakEnd: '14:00' },
    { name: 'Evening Only', icon: '🌙', days: [true, true, true, true, true, true, false], start: '17:00', end: '23:00', breakStart: '', breakEnd: '' },
];

function timeToMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}

function formatTime12(t: string): string {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

function countSlots(config: DayConfig): number {
    if (!config.enabled) return 0;
    const start = timeToMinutes(config.startTime);
    const end = timeToMinutes(config.endTime);
    if (end <= start) return 0;
    const totalMinutes = end - start;
    let slots = Math.floor(totalMinutes / config.slotDuration);
    // Subtract break slots
    for (const brk of config.breaks) {
        const bStart = timeToMinutes(brk.startTime);
        const bEnd = timeToMinutes(brk.endTime);
        if (bEnd > bStart) {
            const breakMinutes = Math.min(bEnd, end) - Math.max(bStart, start);
            if (breakMinutes > 0) {
                slots -= Math.floor(breakMinutes / config.slotDuration);
            }
        }
    }
    return Math.max(0, slots);
}

function getDefaultDayConfig(): DayConfig {
    return { enabled: false, startTime: '09:00', endTime: '17:00', slotDuration: 30, price: 0, breaks: [] };
}

export default function SchedulesPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [weekConfig, setWeekConfig] = useState<DayConfig[]>(
        Array.from({ length: 7 }, () => getDefaultDayConfig())
    );
    const [copyDays, setCopyDays] = useState<boolean[]>(Array(7).fill(false));
    const [showCopy, setShowCopy] = useState(false);
    const [newBreak, setNewBreak] = useState({ startTime: '12:00', endTime: '13:00' });

    const { addToast, ToastContainer } = useToast();
    const { confirm, ConfirmDialogComponent } = useConfirm();

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const response = await api.get('/schedules');
            const data: Schedule[] = response.data;
            buildWeekFromSchedules(data);
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to fetch schedules', 'error');
        } finally {
            setLoading(false);
        }
    };

    const buildWeekFromSchedules = (data: Schedule[]) => {
        const newWeek: DayConfig[] = Array.from({ length: 7 }, () => getDefaultDayConfig());
        for (const schedule of data) {
            // Map dayOfWeek to grid index: Sat(6)->0, Sun(0)->1, Mon(1)->2, ...
            const gridIndex = DAY_MAP.indexOf(schedule.dayOfWeek);
            if (gridIndex === -1) continue;
            const existing = newWeek[gridIndex];
            // If day already has a schedule, use the first one (primary)
            if (existing.schedule) continue;
            newWeek[gridIndex] = {
                enabled: schedule.isActive,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                slotDuration: schedule.slotDuration,
                price: schedule.price,
                breaks: schedule.breaks.map(b => ({ startTime: b.startTime, endTime: b.endTime })),
                schedule,
            };
        }
        setWeekConfig(newWeek);
    };

    const updateDayConfig = (dayIndex: number, updates: Partial<DayConfig>) => {
        setWeekConfig(prev => {
            const next = [...prev];
            next[dayIndex] = { ...next[dayIndex], ...updates };
            return next;
        });
    };

    const handleSaveDay = async (dayIndex: number) => {
        setSaving(true);
        const config = weekConfig[dayIndex];
        const dayOfWeek = DAY_MAP[dayIndex];

        try {
            if (config.schedule) {
                // Update existing
                await api.put(`/schedules/${config.schedule.id}`, {
                    name: DAYS_FULL[dayIndex],
                    startTime: config.startTime,
                    endTime: config.endTime,
                    slotDuration: config.slotDuration,
                    price: config.price,
                    isActive: config.enabled,
                });

                // Sync breaks: delete old, add new
                for (const oldBreak of config.schedule.breaks) {
                    await api.delete(`/schedules/breaks/${oldBreak.id}`);
                }
                for (const brk of config.breaks) {
                    await api.post(`/schedules/${config.schedule.id}/breaks`, brk);
                }
            } else if (config.enabled) {
                // Create new
                const res = await api.post('/schedules', {
                    name: DAYS_FULL[dayIndex],
                    dayOfWeek,
                    startTime: config.startTime,
                    endTime: config.endTime,
                    slotDuration: config.slotDuration,
                    price: config.price,
                });
                // Add breaks
                for (const brk of config.breaks) {
                    await api.post(`/schedules/${res.data.id}/breaks`, brk);
                }
            }
            addToast(`${DAYS_FULL[dayIndex]} saved!`, 'success');
            await fetchSchedules();
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteDay = async (dayIndex: number) => {
        const config = weekConfig[dayIndex];
        if (!config.schedule) return;

        const confirmed = await confirm(
            'Clear Day',
            `Remove all schedule settings for ${DAYS_FULL[dayIndex]}?`,
            'danger'
        );
        if (!confirmed) return;

        try {
            await api.delete(`/schedules/${config.schedule.id}`);
            addToast(`${DAYS_FULL[dayIndex]} cleared`, 'success');
            await fetchSchedules();
            if (selectedDay === dayIndex) setSelectedDay(null);
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to delete', 'error');
        }
    };

    const handleCopyToSelected = async () => {
        if (selectedDay === null) return;
        const source = weekConfig[selectedDay];
        const targetDays = copyDays.map((checked, i) => checked && i !== selectedDay ? i : -1).filter(i => i >= 0);
        if (targetDays.length === 0) {
            addToast('Select at least one day to copy to', 'error');
            return;
        }

        setSaving(true);
        try {
            for (const dayIndex of targetDays) {
                const dayOfWeek = DAY_MAP[dayIndex];
                const existing = weekConfig[dayIndex];

                if (existing.schedule) {
                    // Update
                    await api.put(`/schedules/${existing.schedule.id}`, {
                        name: DAYS_FULL[dayIndex],
                        startTime: source.startTime,
                        endTime: source.endTime,
                        slotDuration: source.slotDuration,
                        price: source.price,
                        isActive: source.enabled,
                    });
                    // Sync breaks
                    for (const oldBreak of existing.schedule.breaks) {
                        await api.delete(`/schedules/breaks/${oldBreak.id}`);
                    }
                    for (const brk of source.breaks) {
                        await api.post(`/schedules/${existing.schedule.id}/breaks`, brk);
                    }
                } else {
                    // Create new
                    const res = await api.post('/schedules', {
                        name: DAYS_FULL[dayIndex],
                        dayOfWeek,
                        startTime: source.startTime,
                        endTime: source.endTime,
                        slotDuration: source.slotDuration,
                        price: source.price,
                    });
                    for (const brk of source.breaks) {
                        await api.post(`/schedules/${res.data.id}/breaks`, brk);
                    }
                }
            }
            addToast(`Copied to ${targetDays.length} day(s)!`, 'success');
            setShowCopy(false);
            setCopyDays(Array(7).fill(false));
            await fetchSchedules();
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to copy', 'error');
        } finally {
            setSaving(false);
        }
    };

    const applyTemplate = async (templateIndex: number) => {
        const template = TEMPLATES[templateIndex];
        const confirmed = await confirm(
            'Apply Template',
            `Apply "${template.name}" template? This will overwrite all existing schedules.`,
            'danger'
        );
        if (!confirmed) return;

        const newWeek: DayConfig[] = Array.from({ length: 7 }, (_, i) => ({
            enabled: template.days[i],
            startTime: template.start,
            endTime: template.end,
            slotDuration: 30,
            price: weekConfig[0]?.price || 0,
            breaks: template.breakStart && template.breakEnd
                ? [{ startTime: template.breakStart, endTime: template.breakEnd }]
                : [],
            schedule: weekConfig[i]?.schedule,
        }));

        setWeekConfig(newWeek);

        // Save all days
        setSaving(true);
        try {
            for (let i = 0; i < 7; i++) {
                const config = newWeek[i];
                const dayOfWeek = DAY_MAP[i];
                const existing = weekConfig[i];

                if (existing.schedule) {
                    if (!config.enabled) {
                        await api.delete(`/schedules/${existing.schedule.id}`);
                    } else {
                        await api.put(`/schedules/${existing.schedule.id}`, {
                            name: DAYS_FULL[i],
                            startTime: config.startTime,
                            endTime: config.endTime,
                            slotDuration: config.slotDuration,
                            price: config.price,
                            isActive: true,
                        });
                        for (const oldBreak of existing.schedule.breaks) {
                            await api.delete(`/schedules/breaks/${oldBreak.id}`);
                        }
                        for (const brk of config.breaks) {
                            await api.post(`/schedules/${existing.schedule.id}/breaks`, brk);
                        }
                    }
                } else if (config.enabled) {
                    const res = await api.post('/schedules', {
                        name: DAYS_FULL[i],
                        dayOfWeek,
                        startTime: config.startTime,
                        endTime: config.endTime,
                        slotDuration: config.slotDuration,
                        price: config.price,
                    });
                    for (const brk of config.breaks) {
                        await api.post(`/schedules/${res.data.id}/breaks`, brk);
                    }
                }
            }
            addToast(`Template "${template.name}" applied!`, 'success');
            await fetchSchedules();
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to apply template', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Compute visual time blocks for the grid
    const timeBlocks = useMemo(() => {
        return weekConfig.map(config => {
            if (!config.enabled) return [];
            const startH = parseInt(config.startTime.split(':')[0]);
            const endH = Math.ceil(timeToMinutes(config.endTime) / 60);
            const breakRanges = config.breaks.map(b => ({
                startH: parseInt(b.startTime.split(':')[0]),
                endH: Math.ceil(timeToMinutes(b.endTime) / 60),
            }));
            return HOURS.filter(h => h >= startH && h < endH).map(h => {
                const isBreak = breakRanges.some(br => h >= br.startH && h < br.endH);
                return { hour: h, isBreak };
            });
        });
    }, [weekConfig]);

    const totalSlots = useMemo(() => weekConfig.reduce((sum, c) => sum + countSlots(c), 0), [weekConfig]);
    const activeDays = useMemo(() => weekConfig.filter(c => c.enabled).length, [weekConfig]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse-slow text-primary-600">
                    <Calendar className="w-16 h-16" />
                </div>
            </div>
        );
    }

    const selected = selectedDay !== null ? weekConfig[selectedDay] : null;

    return (
        <div>
            <ToastContainer />
            {ConfirmDialogComponent}

            <div className="flex items-center gap-3 mb-6">
                <Clock className="w-7 h-7 text-primary-600" />
                <h1 className="text-2xl font-bold text-slate-800">Weekly Schedule</h1>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Quick Templates */}
                <div className="mb-6">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Setup</p>
                    <div className="flex flex-wrap gap-2">
                        {TEMPLATES.map((t, i) => (
                            <button
                                key={i}
                                onClick={() => applyTemplate(i)}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-primary-300 hover:bg-primary-50 transition-all disabled:opacity-50"
                            >
                                <span>{t.icon}</span>
                                <span>{t.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Weekly Grid */}
                    <div className="flex-1">
                        <div className="card p-0 overflow-hidden">
                            {/* Grid Header */}
                            <div className="grid grid-cols-8 border-b border-slate-100">
                                <div className="p-3 text-xs font-semibold text-slate-400 uppercase">Time</div>
                                {DAYS.map((day, i) => {
                                    const config = weekConfig[i];
                                    const isSelected = selectedDay === i;
                                    const slots = countSlots(config);
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedDay(isSelected ? null : i)}
                                            className={`p-3 text-center transition-all border-l border-slate-100 ${
                                                isSelected
                                                    ? 'bg-primary-50 border-b-2 border-b-primary-500'
                                                    : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className={`text-sm font-bold ${config.enabled ? 'text-slate-800' : 'text-slate-400'}`}>
                                                {day}
                                            </div>
                                            {config.enabled ? (
                                                <div className="text-[10px] text-primary-600 font-medium mt-0.5">
                                                    {slots} slots
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-slate-400 mt-0.5">OFF</div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Time Grid */}
                            <div className="max-h-[480px] overflow-y-auto">
                                {HOURS.map(hour => {
                                    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                                    return (
                                        <div key={hour} className="grid grid-cols-8 border-b border-slate-50 hover:bg-slate-50/50">
                                            <div className="px-3 py-1.5 text-xs text-slate-400 font-mono">
                                                {formatTime12(timeStr).replace(':00 ', ' ')}
                                            </div>
                                            {weekConfig.map((_, dayIdx) => {
                                                const block = timeBlocks[dayIdx].find(b => b.hour === hour);
                                                const isSelected = selectedDay === dayIdx;
                                                return (
                                                    <div
                                                        key={dayIdx}
                                                        onClick={() => setSelectedDay(isSelected && selectedDay === dayIdx ? null : dayIdx)}
                                                        className={`border-l border-slate-50 px-1 py-1.5 cursor-pointer transition-all ${
                                                            isSelected ? 'bg-primary-50/50' : ''
                                                        }`}
                                                    >
                                                        {block && (
                                                            <div className={`h-full min-h-[20px] rounded-sm ${
                                                                block.isBreak
                                                                    ? 'bg-amber-100 border border-dashed border-amber-300'
                                                                    : 'bg-primary-100 border border-primary-200'
                                                            }`}>
                                                                <div className={`text-[9px] px-1 font-medium ${
                                                                    block.isBreak ? 'text-amber-600' : 'text-primary-700'
                                                                }`}>
                                                                    {block.isBreak ? 'Break' : ''}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Grid Footer - Price Row */}
                            <div className="grid grid-cols-8 border-t border-slate-200 bg-slate-50/50">
                                <div className="p-3 text-xs font-semibold text-slate-500">Price</div>
                                {weekConfig.map((config, i) => (
                                    <div key={i} className="p-3 text-center border-l border-slate-100">
                                        {config.enabled ? (
                                            <span className="text-xs font-bold text-green-600">${config.price}</span>
                                        ) : (
                                            <span className="text-xs text-slate-400">-</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Side Panel */}
                    <div className="lg:w-80 xl:w-96">
                        {selected !== null && selectedDay !== null ? (
                            <div className="card animate-slide-up sticky top-4">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-800">{DAYS_FULL[selectedDay]}</h2>
                                    <div className="flex items-center gap-2">
                                        {selected.schedule && (
                                            <button
                                                onClick={() => handleDeleteDay(selectedDay)}
                                                className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-all"
                                                title="Clear day"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setSelectedDay(null)}
                                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Active Toggle */}
                                <div className="flex items-center justify-between mb-6 p-3 rounded-xl bg-slate-50">
                                    <span className="text-sm font-semibold text-slate-700">Working Day</span>
                                    <button
                                        onClick={() => updateDayConfig(selectedDay, { enabled: !selected.enabled })}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            selected.enabled ? 'bg-primary-500' : 'bg-slate-300'
                                        }`}
                                    >
                                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                                            selected.enabled ? 'translate-x-6' : 'translate-x-0.5'
                                        }`} />
                                    </button>
                                </div>

                                {selected.enabled && (
                                    <div className="space-y-5">
                                        {/* Time Range */}
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Working Hours</label>
                                            <div className="grid grid-cols-2 gap-3 mt-2">
                                                <div>
                                                    <label className="text-xs text-slate-500 mb-1 block">From</label>
                                                    <input
                                                        type="time"
                                                        value={selected.startTime}
                                                        onChange={e => updateDayConfig(selectedDay, { startTime: e.target.value })}
                                                        className="input-field text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500 mb-1 block">To</label>
                                                    <input
                                                        type="time"
                                                        value={selected.endTime}
                                                        onChange={e => updateDayConfig(selectedDay, { endTime: e.target.value })}
                                                        className="input-field text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Slot Duration */}
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slot Duration</label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {SLOT_DURATIONS.map(d => (
                                                    <button
                                                        key={d}
                                                        onClick={() => updateDayConfig(selectedDay, { slotDuration: d })}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                            selected.slotDuration === d
                                                                ? 'bg-primary-500 text-white shadow-sm'
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        {d}m
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Price per Slot (BDT)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={selected.price}
                                                onChange={e => updateDayConfig(selectedDay, { price: parseInt(e.target.value) || 0 })}
                                                className="input-field text-sm mt-2"
                                                placeholder="0"
                                            />
                                        </div>

                                        {/* Breaks */}
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Breaks</label>
                                            {selected.breaks.length > 0 && (
                                                <div className="space-y-2 mb-3">
                                                    {selected.breaks.map((brk, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                                                            <span className="text-sm text-amber-800">
                                                                {formatTime12(brk.startTime)} - {formatTime12(brk.endTime)}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    const newBreaks = selected.breaks.filter((_, i) => i !== idx);
                                                                    updateDayConfig(selectedDay, { breaks: newBreaks });
                                                                }}
                                                                className="text-amber-600 hover:text-red-600 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex gap-2 items-end">
                                                <div className="flex-1">
                                                    <input
                                                        type="time"
                                                        value={newBreak.startTime}
                                                        onChange={e => setNewBreak({ ...newBreak, startTime: e.target.value })}
                                                        className="input-field text-sm"
                                                    />
                                                </div>
                                                <span className="text-slate-400 pb-2">-</span>
                                                <div className="flex-1">
                                                    <input
                                                        type="time"
                                                        value={newBreak.endTime}
                                                        onChange={e => setNewBreak({ ...newBreak, endTime: e.target.value })}
                                                        className="input-field text-sm"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        updateDayConfig(selectedDay, {
                                                            breaks: [...selected.breaks, { ...newBreak }]
                                                        });
                                                    }}
                                                    className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Summary */}
                                        <div className="p-3 bg-primary-50 rounded-xl border border-primary-100">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-primary-700">Total Slots</span>
                                                <span className="font-bold text-primary-800">{countSlots(selected)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm mt-1">
                                                <span className="text-primary-700">Revenue Potential</span>
                                                <span className="font-bold text-green-600">${countSlots(selected) * selected.price}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => handleSaveDay(selectedDay)}
                                                disabled={saving}
                                                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {saving ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Zap className="w-4 h-4" />
                                                )}
                                                Save {DAYS_FULL[selectedDay]}
                                            </button>

                                            <button
                                                onClick={() => { setShowCopy(!showCopy); setCopyDays(Array(7).fill(false)); }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
                                            >
                                                <Copy className="w-4 h-4" />
                                                Copy to Other Days
                                            </button>
                                        </div>

                                        {/* Copy Panel */}
                                        {showCopy && (
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 animate-slide-up">
                                                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Copy to:</p>
                                                <div className="grid grid-cols-4 gap-2 mb-3">
                                                    {DAYS.map((day, i) => (
                                                        <button
                                                            key={i}
                                                            disabled={i === selectedDay}
                                                            onClick={() => {
                                                                const next = [...copyDays];
                                                                next[i] = !next[i];
                                                                setCopyDays(next);
                                                            }}
                                                            className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                                                                i === selectedDay
                                                                    ? 'bg-primary-100 text-primary-500 cursor-not-allowed'
                                                                    : copyDays[i]
                                                                        ? 'bg-primary-500 text-white'
                                                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-300'
                                                            }`}
                                                        >
                                                            {day}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={handleCopyToSelected}
                                                    disabled={saving || !copyDays.some((c, i) => c && i !== selectedDay)}
                                                    className="btn-primary w-full text-sm disabled:opacity-50"
                                                >
                                                    {saving ? 'Copying...' : `Copy to ${copyDays.filter((c, i) => c && i !== selectedDay).length} day(s)`}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!selected.enabled && (
                                    <p className="text-sm text-slate-500 text-center py-4">
                                        Enable this day to configure slots
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="card text-center py-12">
                                <ChevronRight className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">Select a day to edit</p>
                                <p className="text-slate-400 text-sm mt-1">Click any column in the grid</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
