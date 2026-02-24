import React from "react";
import { X, Eye, Clock } from "lucide-react";
import { Avatar } from "../../../components/ui/Avatar";

interface Viewer {
    id: string;
    viewedAt: string;
    user: {
        id: string;
        name: string;
        avatarUrl?: string;
        phone: string;
    };
}

interface StatusViewersProps {
    viewers: Viewer[];
    total: number;
    isLoading: boolean;
    onClose: () => void;
}

const formatRelativeTime = (dateString: string) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Just now";

        const now = new Date();
        const diffInSeconds = Math.floor(
            (now.getTime() - date.getTime()) / 1000,
        );

        if (diffInSeconds < 60) return "Just now";
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString();
    } catch {
        return "Just now";
    }
};

export const StatusViewers: React.FC<StatusViewersProps> = ({
    viewers,
    total,
    isLoading,
    onClose,
}) => {
    return (
        <>
            {/* Backdrop */}
            <div
                className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="absolute bottom-0 left-0 right-0 z-50 max-h-[55vh] bg-[#1a1a2e] rounded-t-3xl shadow-2xl border-t border-white/10 flex flex-col animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                            <Eye size={18} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base">Viewed by</h3>
                            <p className="text-white/50 text-xs">
                                {total} {total === 1 ? "person" : "people"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} className="text-white/70" />
                    </button>
                </div>

                {/* Viewer List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : viewers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                <Eye size={28} className="text-white/20" />
                            </div>
                            <p className="text-white/40 text-sm">No one has viewed this status yet</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {viewers.map((viewer) => (
                                <div
                                    key={viewer.id}
                                    className="flex items-center gap-3 px-6 py-3 hover:bg-white/5 transition-colors"
                                >
                                    <Avatar
                                        user={viewer.user}
                                        size="md"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-semibold text-sm truncate">
                                            {viewer.user.name}
                                        </h4>
                                        <p className="text-white/40 text-xs truncate">
                                            {viewer.user.phone}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-white/40 shrink-0">
                                        <Clock size={12} />
                                        <span className="text-xs">
                                            {formatRelativeTime(viewer.viewedAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
