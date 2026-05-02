import { Sparkles } from 'lucide-react';

export default function ProBadge({ size = 'sm' }: { size?: 'xs' | 'sm' }) {
    const isXs = size === 'xs';
    return (
        <span
            className={`inline-flex items-center gap-1 font-bold text-white rounded-md ${
                isXs ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
            }`}
            style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}
        >
            <Sparkles className={isXs ? 'w-2.5 h-2.5' : 'w-3 h-3'} strokeWidth={2.5} />
            PRO
        </span>
    );
}
