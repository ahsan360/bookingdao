interface Props {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeMap = {
    sm: 'h-5 w-5 border-[1.5px]',
    md: 'h-8 w-8 border-2',
    lg: 'h-10 w-10 border-2',
};

export default function LoadingSpinner({ size = 'md', className = '' }: Props) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`animate-spin rounded-full border-primary-200 border-t-primary-600 ${sizeMap[size]}`} />
        </div>
    );
}
