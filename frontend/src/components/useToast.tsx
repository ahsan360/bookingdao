'use client';

import { useState } from 'react';
import Toast, { ToastType } from './Toast';

interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

let toastCounter = 0;
let addToastCallback: ((message: string, type: ToastType) => void) | null = null;

export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (message: string, type: ToastType = 'info') => {
        const id = toastCounter++;
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    // Register the callback
    if (addToastCallback === null) {
        addToastCallback = addToast;
    }

    return {
        toasts,
        addToast,
        removeToast,
        ToastContainer: () => (
            <>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </>
        ),
    };
}

// Global toast function that can be called from anywhere
export const toast = {
    success: (message: string) => {
        if (addToastCallback) addToastCallback(message, 'success');
    },
    error: (message: string) => {
        if (addToastCallback) addToastCallback(message, 'error');
    },
    warning: (message: string) => {
        if (addToastCallback) addToastCallback(message, 'warning');
    },
    info: (message: string) => {
        if (addToastCallback) addToastCallback(message, 'info');
    },
};
