'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning',
}: ConfirmDialogProps) {
    const getButtonStyles = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 text-white';
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700 text-white';
            case 'info':
                return 'bg-blue-600 hover:bg-blue-700 text-white';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full animate-slide-up">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-slate-600 mb-6">{message}</p>
                <div className="flex space-x-3">
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${getButtonStyles()}`}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-lg font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Hook for using confirm dialog
export function useConfirm() {
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'danger' | 'warning' | 'info';
    } | null>(null);

    const confirm = (
        title: string,
        message: string,
        type: 'danger' | 'warning' | 'info' = 'warning'
    ): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                title,
                message,
                type,
                onConfirm: () => {
                    setConfirmState(null);
                    resolve(true);
                },
            });
        });
    };

    const ConfirmDialogComponent = confirmState?.isOpen ? (
        <ConfirmDialog
            title={confirmState.title}
            message={confirmState.message}
            type={confirmState.type}
            onConfirm={confirmState.onConfirm}
            onCancel={() => setConfirmState(null)}
        />
    ) : null;

    return { confirm, ConfirmDialogComponent };
}
