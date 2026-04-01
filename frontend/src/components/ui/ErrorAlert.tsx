import { XCircle } from 'lucide-react';

interface Props {
    message: string;
    className?: string;
    onDismiss?: () => void;
}

export default function ErrorAlert({ message, className = '', onDismiss }: Props) {
    return (
        <div className={`p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start justify-between ${className}`}>
            <span>{message}</span>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="ml-3 flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                >
                    <XCircle className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
