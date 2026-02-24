import React, { useState, useMemo } from "react";
import { X, Check, Search, Share2, Loader2, Image, Video } from "lucide-react";
import { Chat } from "../../types";
import { Avatar } from "../ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";

interface ShareStatusModalProps {
    status: any;
    chats: Chat[];
    onClose: () => void;
    onShare: (statusId: string, targetChatIds: string[]) => Promise<void>;
}

export const ShareStatusModal: React.FC<ShareStatusModalProps> = ({
    status,
    chats,
    onClose,
    onShare,
}) => {
    const { user } = useAuth();
    const [selectedChatIds, setSelectedChatIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [isSharing, setIsSharing] = useState(false);

    // Filter to subordinate chats only (hierarchy-based sharing)
    const subordinateChats = useMemo(() => {
        return chats.filter((chat) => {
            if (chat.isGroup) return true; // Include all group chats
            // For direct chats, only show if the other member is a direct subordinate
            const otherMember = chat.members.find((m) => m.user.id !== user?.id);
            return otherMember?.user.parentId === user?.id;
        });
    }, [chats, user?.id]);

    const filteredChats = useMemo(() => {
        return subordinateChats.filter((chat) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            if (chat.isGroup) {
                return chat.groupName?.toLowerCase().includes(q);
            }
            const otherMember = chat.members.find((m) => m.user.id !== user?.id);
            return otherMember?.user.name?.toLowerCase().includes(q);
        });
    }, [subordinateChats, searchQuery, user?.id]);

    const toggleSelection = (chatId: string) => {
        const newSet = new Set(selectedChatIds);
        if (newSet.has(chatId)) {
            newSet.delete(chatId);
        } else {
            newSet.add(chatId);
        }
        setSelectedChatIds(newSet);
    };

    const handleShare = async () => {
        if (selectedChatIds.size === 0) return;
        setIsSharing(true);
        try {
            await onShare(status.id, Array.from(selectedChatIds));
            onClose();
        } catch (error) {
            console.error("Error sharing status:", error);
            alert("Failed to share status. Please try again.");
        } finally {
            setIsSharing(false);
        }
    };

    const getChatDisplayName = (chat: Chat) => {
        if (chat.isGroup) return chat.groupName || "Group";
        const otherMember = chat.members.find((m) => m.user.id !== user?.id);
        return otherMember?.user.name || "Unknown";
    };

    const getChatUser = (chat: Chat) => {
        if (chat.isGroup) return null;
        return chat.members.find((m) => m.user.id !== user?.id)?.user;
    };

    // Build a preview summary for the status
    const getStatusPreview = () => {
        if (status.type === "TEXT") {
            return status.content?.substring(0, 60) || "Text status";
        }
        if (status.type === "IMAGE") return "📷 Photo status";
        return "🎥 Video status";
    };

    const getStatusPreviewIcon = () => {
        if (status.type === "IMAGE") return <Image size={16} className="text-primary" />;
        if (status.type === "VIDEO") return <Video size={16} className="text-primary" />;
        return null;
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="h-16 px-6 bg-surface border-b border-border flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Share2 size={20} className="text-primary" />
                        <h2 className="text-xl font-bold text-text-main">Share Status</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-secondary hover:text-text-main rounded-full hover:bg-surface-hover"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Status Preview */}
                <div className="px-6 py-3 bg-surface-hover/50 border-b border-border">
                    <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                        Sharing Status
                    </p>
                    <div className="flex items-center gap-2">
                        {getStatusPreviewIcon()}
                        <p className="text-sm text-text-main truncate">
                            {getStatusPreview()}
                        </p>
                    </div>
                    {status.type === "TEXT" && status.color && (
                        <div
                            className="w-full h-1 rounded-full mt-2"
                            style={{ backgroundColor: status.color }}
                        />
                    )}
                </div>

                {/* Search */}
                <div className="px-4 py-3">
                    <div className="bg-input rounded-lg flex items-center px-3 py-2 border border-transparent focus-within:border-primary/30 transition-colors">
                        <Search size={18} className="text-secondary mr-2" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            autoFocus
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent w-full focus:outline-none text-text-main placeholder-secondary"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    <div className="space-y-1">
                        {filteredChats.map((chat) => {
                            const isSelected = selectedChatIds.has(chat.id);
                            const displayName = getChatDisplayName(chat);
                            const chatUser = getChatUser(chat);

                            return (
                                <div
                                    key={chat.id}
                                    onClick={() => toggleSelection(chat.id)}
                                    className={`flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-surface-hover"
                                        }`}
                                >
                                    <div className="relative">
                                        {chatUser ? (
                                            <Avatar user={chatUser} size="md" showStatus />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                                {(chat.groupName || "G").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        {isSelected && (
                                            <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5 border-2 border-surface">
                                                <Check size={12} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`font-medium truncate ${isSelected ? "text-primary" : "text-text-main"
                                                }`}
                                        >
                                            {displayName}
                                        </p>
                                        {chat.isGroup && (
                                            <p className="text-xs text-secondary">
                                                {chat.members.length} members
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {filteredChats.length === 0 && (
                            <div className="text-center py-8 text-secondary text-sm">
                                No chats found
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-surface-hover/50 flex items-center justify-between">
                    <span className="text-sm text-secondary">
                        {selectedChatIds.size > 0
                            ? `${selectedChatIds.size} chat${selectedChatIds.size > 1 ? "s" : ""} selected`
                            : "Select chats to share"}
                    </span>
                    <button
                        onClick={handleShare}
                        disabled={selectedChatIds.size === 0 || isSharing}
                        className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg active:scale-95 flex items-center gap-2"
                    >
                        {isSharing ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Sharing...
                            </>
                        ) : (
                            <>
                                <Share2 size={18} />
                                Share
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
