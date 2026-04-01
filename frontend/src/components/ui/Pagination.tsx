import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center space-x-2 mt-6">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-lg hover:bg-white/50 disabled:opacity-30"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-2 rounded-lg hover:bg-white/50 disabled:opacity-30"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}
