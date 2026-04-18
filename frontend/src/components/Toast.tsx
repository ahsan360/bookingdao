'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

const CONFIG = {
    success: { icon: CheckCircle, bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', bar: 'bg-emerald-500' },
    error: { icon: AlertCircle, bg: 'bg-red-50 border-red-200 text-red-800', bar: 'bg-red-500' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-50 border-amber-200 text-amber-800', bar: 'bg-amber-500' },
    info: { icon: Info, bg: 'bg-blue-50 border-blue-200 text-blue-800', bar: 'bg-blue-500' },
};

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
    const [exiting, setExiting] = useState(false);
    const { icon: Icon, bg, bar } = CONFIG[type];

    useEffect(() => {
        const exitTimer = setTimeout(() => setExiting(true), duration - 300);
        const closeTimer = setTimeout(onClose, duration);
        return () => {
            clearTimeout(exitTimer);
            clearTimeout(closeTimer);
        };
    }, [duration, onClose]);

    return (
        <div className={`fixed top-4 right-4 z-50 flex flex-col rounded-xl border shadow-lg max-w-sm overflow-hidden transition-all duration-300 ${bg} ${exiting ? 'opacity-0 translate-x-4' : 'animate-slide-down'}`}>
            <div className="flex items-center space-x-3 px-4 py-3">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <p className="flex-1 font-medium text-sm">{message}</p>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 hover:opacity-70 transition-opacity p-0.5"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="h-0.5 w-full bg-black/5">
                <div className={`h-full ${bar} animate-progress`} style={{ animationDuration: `${duration}ms` }} />
            </div>
        </div>
    );
}
