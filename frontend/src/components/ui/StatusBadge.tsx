import { CheckCircle, CheckCheck, Clock, XCircle, AlertCircle } from 'lucide-react';

interface Props {
    status: string;
}

const getStatusConfig = (status: string) => {
    switch (status) {
        case 'confirmed':
            return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle, label: 'Confirmed' };
        case 'completed':
            return { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCheck, label: 'Completed' };
        case 'pending':
            return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Pending' };
        case 'cancelled':
            return { color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle, label: 'Cancelled' };
        case 'expired':
            return { color: 'bg-slate-50 text-slate-600 border-slate-200', icon: AlertCircle, label: 'Expired' };
        default:
            return { color: 'bg-slate-50 text-slate-600 border-slate-200', icon: AlertCircle, label: status };
    }
};

export default function StatusBadge({ status }: Props) {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{config.label}</span>
        </span>
    );
}
