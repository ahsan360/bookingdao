import { Calendar } from 'lucide-react';

interface Props {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
};

export default function LoadingSpinner({ size = 'md', className = '' }: Props) {
    if (size === 'lg') {
        return (
            <div className={`flex items-center justify-center ${className}`}>
                <div className="animate-pulse-slow text-primary-600">
                    <Calendar className={sizeMap[size]} />
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`animate-spin rounded-full ${sizeMap[size]} border-b-2 border-primary-600`}></div>
        </div>
    );
}
