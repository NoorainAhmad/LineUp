import React, { useState, useMemo, useCallback, memo } from "react";
import type { PresenceInfo } from "@/utils/usePresence";
import {
  Search,
  Archive,
  Pin,
  PinOff,
  Users,
  UserPlus,
  ArchiveRestore,
  ArrowLeft,
  MessageSquare,
  Loader2,
  ArrowDownIcon,
  EllipsisIcon,
  EllipsisVertical,
} from "lucide-react";
import { Chat, User, UserRole, UserStatus } from "../../../types";
import { Avatar } from "../../../components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { FormattedText } from "@/components/ui/FormattedText";
import { formatLastMessageTime } from "@/utils/time_formatter.utils";
import { extractReplyMessage } from "../../../components/ui/TextMessage";

interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  currentUserId: string;
  getUserPresence: (userId: string, fallbackStatus?: UserStatus, fallbackLastSeen?: string) => PresenceInfo;
  onAddContact: () => void;
  onCreateGroup: () => void;
  onChatSelect: (chat: Chat) => void;
  onTogglePin: (chatId: string) => void;
  onArchive: (chatId: string) => void;
  isLoading?: boolean;
}

interface ProcessedChat {
  chat: Chat;
  displayUser: User;
  isPinned: boolean;
  isArchived: boolean;
  unreadCount: number;
  otherMember?: User;
  lastMessageTime: string;
  isMeSender: boolean;
  displayContent: string;
}

// Memoized chat item component to prevent unnecessary re-renders
const ChatListItem = memo(
  ({
    processedChat,
    isSelected,
    currentUser,
    getUserPresence,
    onChatSelect,
    onTogglePin,
    onArchive,
  }: {
    processedChat: ProcessedChat;
    isSelected: boolean;
    currentUser?: User | null;
    getUserPresence: (userId: string, fallbackStatus?: UserStatus, fallbackLastSeen?: string) => PresenceInfo;
    onChatSelect: (chat: Chat) => void;
    onTogglePin: (chatId: string) => void;
    onArchive: (chatId: string) => void;
  }) => {
    const [floatingMenu, setFloatingMenu] = useState(false);

    const {
      chat,
      displayUser,
      isPinned,
      isArchived,
      unreadCount,
      otherMember,
      lastMessageTime,
      isMeSender,
    } = processedChat;
    const lastMessage = chat.lastMessage;
    const { displayContent } = processedChat;

    const handleClick = useCallback(() => {
      onChatSelect(chat);
    }, [chat, onChatSelect]);

    const handleTogglePin = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (floatingMenu) setFloatingMenu(false);
        onTogglePin(chat.id);
      },
      [chat.id, onTogglePin, floatingMenu],
    );

    const handleArchive = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (floatingMenu) setFloatingMenu(false);
        onArchive(chat.id);
      },
      [chat.id, onArchive, floatingMenu],
    );

    const toggleFloatingMenu = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setFloatingMenu((prev) => !prev);
    }, []);

    return (
      <div
        onClick={handleClick}
        className={`group relative p-3 flex items-center gap-3.5 cursor-pointer transition-all rounded-2xl border border-transparent ${isSelected
          ? "bg-primary/5 border-primary/10 shadow-sm"
          : "hover:bg-surface-hover hover:border-border/20"
          }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={`Chat with ${displayUser.name}, ${unreadCount > 0 ? `${unreadCount} unread messages` : "no unread messages"}`}
        aria-selected={isSelected}
      >
        {/* Active Indicator Strip */}
        {isSelected && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
            aria-hidden="true"
          />
        )}

        <div className="relative">
          <Avatar 
            user={{ 
              ...displayUser, 
              status: !chat.isGroup && otherMember 
                ? getUserPresence(otherMember.id, otherMember.status, otherMember.lastSeen).status 
                : displayUser.status 
            }} 
            showStatus={!chat.isGroup} 
            size="lg" 
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-0.5">
            <span
              className={`font-bold truncate text-sm md:text-base tracking-tight ${isSelected ? "text-primary" : "text-text-main"}`}
            >
              {displayUser.name}
              {chat.isGroup && (
                <span className="text-[10px] font-normal text-secondary ml-2">
                  {chat.members.length} members
                </span>
              )}
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary/60">
                {lastMessageTime}
              </span>
              <span
                onClick={toggleFloatingMenu}
                className="inline-block md:hidden font-extrabold uppercase tracking-widest text-secondary"
              >
                <EllipsisIcon size={18} className="inline-block ml-2" />
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p
              className={`text-[13px] truncate pr-8 ${unreadCount > 0 ? "text-text-main font-semibold" : "text-secondary"}`}
            >
              {isMeSender && (
                <span className="text-primary/70 font-bold mr-1 italic">
                  You:
                </span>
              )}
              <FormattedText
                text={
                  ((displayContent || "").length < 28
                    ? displayContent
                    : displayContent?.slice(0, 28) + "...") ||
                  "Start a conversation"
                }
              />
            </p>

            <div className="flex items-center gap-2 shrink-0">
              {isPinned && (
                <Pin
                  size={12}
                  className="text-primary/60 rotate-45"
                  aria-label="Pinned"
                />
              )}
              {unreadCount > 0 && (
                <span
                  className="h-4.5 min-w-4.5 px-1 flex items-center justify-center bg-primary text-white text-[9px] font-black rounded-full shadow-lg shadow-primary/20"
                  aria-label={`${unreadCount} unread messages`}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hover Actions - Clean Floating Menu */}
        {currentUser?.role === UserRole.BRANCH && (
          <div
            className="hidden md:group-hover:flex absolute right-3 top-1/2 -translate-y-1/2 bg-surface shadow-xl border border-border/50 rounded-xl p-1 gap-0.5 z-30 animate-in fade-in slide-in-from-right-2 duration-150"
            onClick={(e) => e.stopPropagation()}
            role="toolbar"
            aria-label="Chat actions"
          >
            <button
              onClick={handleTogglePin}
              className={`p-1.5 rounded-lg transition-colors ${isPinned ? "bg-primary/10 text-primary" : "text-secondary hover:bg-surface-hover hover:text-text-main"}`}
              aria-label={isPinned ? "Unpin chat" : "Pin chat"}
            >
              {isPinned ? <PinOff size={15} /> : <Pin size={15} />}
            </button>
            <button
              onClick={handleArchive}
              className="p-1.5 rounded-lg text-secondary hover:bg-surface-hover hover:text-text-main transition-colors"
              aria-label={isArchived ? "Unarchive chat" : "Archive chat"}
            >
              {isArchived ? (
                <ArchiveRestore size={15} />
              ) : (
                <Archive size={15} />
              )}
            </button>
          </div>
        )}

        {/* Three dots Actions (Mobile) - Clean Floating Menu */}
        {currentUser?.role === UserRole.BRANCH && floatingMenu && (
          <div
            className="flex md:hidden absolute right-3 top-1/2 -translate-y-1/2 bg-surface shadow-xl border border-border/50 rounded-xl p-1 gap-0.5 z-30 animate-in fade-in slide-in-from-right-2 duration-150"
            onClick={(e) => e.stopPropagation()}
            role="toolbar"
            aria-label="Chat actions"
          >
            <button
              onClick={handleTogglePin}
              className={`p-1.5 rounded-lg transition-colors ${isPinned ? "bg-primary/10 text-primary" : "text-secondary hover:bg-surface-hover hover:text-text-main"}`}
              aria-label={isPinned ? "Unpin chat" : "Pin chat"}
            >
              {isPinned ? <PinOff size={15} /> : <Pin size={15} />}
            </button>
            <button
              onClick={handleArchive}
              className="p-1.5 rounded-lg text-secondary hover:bg-surface-hover hover:text-text-main transition-colors"
              aria-label={isArchived ? "Unarchive chat" : "Archive chat"}
            >
              {isArchived ? (
                <ArchiveRestore size={15} />
              ) : (
                <Archive size={15} />
              )}
            </button>
          </div>
        )}
      </div>
    );
  },
);

ChatListItem.displayName = "ChatListItem";

// Empty state component
const EmptyState = memo(
  ({
    showArchived,
    searchQuery,
  }: {
    showArchived: boolean;
    searchQuery: string;
  }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-surface-hover rounded-3xl flex items-center justify-center mb-4 border border-border/10 shadow-sm">
        {searchQuery ? (
          <Search size={24} className="text-secondary/30" />
        ) : showArchived ? (
          <Archive size={24} className="text-secondary/30" />
        ) : (
          <MessageSquare size={24} className="text-secondary/30" />
        )}
      </div>
      <p className="text-sm font-bold text-text-main tracking-tight">
        {searchQuery
          ? "No conversations found"
          : showArchived
            ? "No archived conversations"
            : "No conversations yet"}
      </p>
      <p className="text-xs text-secondary mt-1 max-w-45">
        {searchQuery
          ? "Try searching for a name or message content."
          : showArchived
            ? "Archive chats you want to hide from the main list."
            : "Start a new conversation by adding a contact."}
      </p>
    </div>
  ),
);

EmptyState.displayName = "EmptyState";

// Loading state component
const LoadingState = memo(() => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
    <p className="text-sm font-bold text-text-main tracking-tight">
      Loading conversations...
    </p>
  </div>
));

LoadingState.displayName = "LoadingState";

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChatId,
  currentUserId,
  getUserPresence,
  onAddContact,
  onCreateGroup,
  onChatSelect,
  onTogglePin,
  onArchive,
  isLoading = false,
}) => {
  const { user: currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // High-performance memoized processing of the relational data
  const processedChats = useMemo(() => {
    return chats
      .map((chat) => {
        // find MY member data using currentUserId first
        let myMemberData = chat.members?.find((m) => m.user.id === currentUserId);
        let otherMembers;

        if (myMemberData) {
          // Current user is a member of this chat — standard self/other logic
          otherMembers = chat.members.filter(
            (m) => m.user.id !== currentUserId,
          );
        } else {
          // Admin/Master/Developer monitoring a chat they're not a member of
          // Show it from the branch's perspective: branch = "self", others = display
          myMemberData = chat.members?.find(
            (m) => m.user.role === UserRole.BRANCH,
          );
          otherMembers = chat.members.filter(
            (m) => m.user.id !== myMemberData?.user?.id,
          );
        }

        // For direct messages, get the other user
        const otherMember =
          otherMembers.length > 0 ? otherMembers[0] : undefined;

        // Determine identity: Use group info or the "other" person in DM
        let displayUser: User;
        if (chat.isGroup) {
          displayUser = {
            id: chat.id,
            guid: `group-${chat.id}`,
            name: chat.groupName || "New Group",
            phone: "",
            status: UserStatus.OFFLINE,
            lastSeen: new Date().toISOString(),
            ipAddress: "0.0.0.0",
            isActive: true,
            role: "USER" as any,
            permission: [],
            children: [],
            avatarUrl: chat.groupImage,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
          };
        } else {
          displayUser = otherMember?.user || {
            id: "unknown",
            guid: "unknown",
            name: "Unknown User",
            phone: "",
            status: UserStatus.OFFLINE,
            lastSeen: new Date().toISOString(),
            ipAddress: "0.0.0.0",
            isActive: false,
            role: "USER" as any,
            permission: [],
            children: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        const lastMessageTime = chat.lastMessage?.createdAt
          ? formatLastMessageTime(chat.lastMessage.createdAt)
          : "";

        // Check if the last message was sent by me
        const isMeSender = chat.lastMessage?.senderId === currentUserId;

        // Extract the actual reply message from status reply format
        const displayContent = chat.lastMessage ? extractReplyMessage(chat.lastMessage.content || "") : "";

        return {
          chat,
          displayUser,
          isPinned: myMemberData?.user?.id === currentUserId ? (myMemberData?.isPinned ?? false) : false,
          isArchived: myMemberData?.user?.id === currentUserId ? (myMemberData?.isArchived ?? false) : false,
          unreadCount: myMemberData?.user?.id === currentUserId ? (myMemberData?.unreadCount ?? 0) : 0,
          otherMember: otherMember?.user,
          lastMessageTime,
          isMeSender,
          displayContent,
        };
      })
      .filter((processedChat) => {
        const matchesArchiveStatus = showArchived
          ? processedChat.isArchived
          : !processedChat.isArchived;

        if (searchQuery === "") {
          return matchesArchiveStatus;
        }

        const matchesSearch =
          processedChat.displayUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          processedChat.displayUser?.guid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          processedChat.displayUser?.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (processedChat.chat.lastMessage?.content || "").toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch && matchesArchiveStatus;
      })
      .sort((a, b) => {
        // Pinned chats first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // Then by unread count (more unread first)
        if (a.unreadCount !== b.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }

        // Then by last activity
        const aTime = a.chat.lastMessage?.createdAt || a.chat.updatedAt;
        const bTime = b.chat.lastMessage?.createdAt || b.chat.updatedAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
  }, [chats, searchQuery, showArchived, currentUserId]);

  // Memoized event handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  const toggleArchiveView = useCallback(() => {
    setShowArchived(!showArchived);
    setSearchQuery(""); // Clear search when switching views
  }, [showArchived]);

  const handleAddContact = useCallback(() => {
    onAddContact();
  }, [onAddContact]);

  const handleCreateGroup = useCallback(() => {
    onCreateGroup();
  }, [onCreateGroup]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-surface border-r border-border w-full md:w-95 lg:w-105 relative z-20 overflow-hidden">
        <div className="h-20 px-6 flex items-center justify-between shrink-0 border-b border-border/40 bg-surface/80 backdrop-blur-md">
          <h1 className="text-2xl font-black text-text-main tracking-tighter">
            Messages
          </h1>
        </div>
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border w-full md:w-95 lg:w-105 relative z-20 overflow-hidden pb-16 md:pb-0">
      {/* Header - High-end font-extrabold styling */}
      <div className="h-20 px-6 flex items-center justify-between shrink-0 border-b border-border/40 bg-surface/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {showArchived && (
            <button
              onClick={toggleArchiveView}
              className="p-2 -ml-2 hover:bg-surface-hover rounded-full text-secondary transition-all active:scale-90"
              aria-label="Back to active chats"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
          )}
          <h1 className="text-2xl font-black text-text-main tracking-tighter">
            {showArchived ? "Archived" : "Messages"}
            <span className="ml-2 text-sm font-normal text-secondary">
              ({processedChats.length})
            </span>
          </h1>
        </div>

        <div className="flex gap-1.5">
          {!showArchived && (
            <>
              {" "}
              {currentUser?.role !== UserRole.USER && (
                <button
                  onClick={toggleArchiveView}
                  className="p-2.5 hover:bg-primary/10 hover:text-primary rounded-xl text-secondary transition-all"
                  title="View archived chats"
                  aria-label="View archived chats"
                >
                  <Archive size={20} aria-hidden="true" />
                </button>
              )}
              {currentUser?.role === UserRole.BRANCH && (
                <button
                  onClick={handleAddContact}
                  className="p-2.5 hover:bg-primary/10 hover:text-primary rounded-xl text-secondary transition-all"
                  title="Add new contact"
                  aria-label="Add new contact"
                >
                  <UserPlus size={20} aria-hidden="true" />
                </button>
              )}
              {currentUser?.role !== UserRole.USER &&
                currentUser?.role !== UserRole.BRANCH && (
                  <button
                    onClick={handleCreateGroup}
                    className="p-2.5 hover:bg-primary/10 hover:text-primary rounded-xl text-secondary transition-all"
                    title="Create new group"
                    aria-label="Create new group"
                  >
                    <Users size={20} aria-hidden="true" />
                  </button>
                )}
            </>
          )}
        </div>
      </div>

      {/* Search Bar - Etched border focus */}
      <div className="px-6 py-4 bg-surface">
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/60 group-focus-within:text-primary transition-colors"
            size={16}
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={
              showArchived ? "Search archived..." : "Search direct messages..."
            }
            className="w-full bg-surface-hover/50 text-text-main placeholder-secondary/50 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 border border-border/10 focus:border-primary/40 transition-all shadow-inner"
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search conversations"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-secondary hover:text-text-main rounded-full hover:bg-surface-hover"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Chat List - Scannable Layout */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-0.5">
        {processedChats.map((processedChat) => (
          <ChatListItem
            key={processedChat.chat.id}
            processedChat={processedChat}
            isSelected={selectedChatId === processedChat.chat.id}
            currentUser={currentUser}
            getUserPresence={getUserPresence}
            onChatSelect={onChatSelect}
            onTogglePin={onTogglePin}
            onArchive={onArchive}
          />
        ))}

        {processedChats.length === 0 && !isLoading && (
          <EmptyState showArchived={showArchived} searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
};

ChatList.displayName = "ChatList";
