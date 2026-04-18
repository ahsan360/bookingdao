import { CheckCircle, CheckCheck, Clock, XCircle, AlertCircle } from 'lucide-react';

interface Props {
    status: string;
}

const getStatusConfig = (status: string) => {
    switch (status) {
        case 'confirmed':
            return { color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle, label: 'Confirmed' };
        case 'completed':
            return { color: 'bg-blue-50 text-blue-700', icon: CheckCheck, label: 'Completed' };
        case 'pending':
            return { color: 'bg-amber-50 text-amber-700', icon: Clock, label: 'Pending' };
        case 'cancelled':
            return { color: 'bg-red-50 text-red-600', icon: XCircle, label: 'Cancelled' };
        case 'expired':
            return { color: 'bg-slate-100 text-slate-500', icon: AlertCircle, label: 'Expired' };
        default:
            return { color: 'bg-slate-100 text-slate-500', icon: AlertCircle, label: status };
    }
};

export default function StatusBadge({ status }: Props) {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${config.color}`}>
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{config.label}</span>
        </span>
    );
}
