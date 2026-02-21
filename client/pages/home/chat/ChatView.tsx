import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MoreHorizontal,
  Smile,
  Send,
  Mic,
  ArrowLeft,
  Check,
  CheckCheck,
  FileText,
  Download,
  X,
  Reply,
  Plus,
  Camera,
  Image,
  Pencil,
  Trash2,
  Ban,
  ChevronUp,
  ChevronDown,
  Command,
  Sparkles,
  ArrowDown,
  Search,
  RefreshCw,
  MessageCircleCodeIcon,
  Share2,
  Bold,
  Italic,
  Strikethrough,
  Code,
  HelpCircle,
  Copy,
} from "lucide-react";
import {
  Chat,
  Message,
  UserStatus,
  CannedResponse,
  MessageType,
  User,
  UserRole,
} from "../../../types";
import { Avatar } from "../../../components/ui/Avatar";
import { EmojiPicker } from "../../../components/ui/EmojiPicker";
import { CameraModal } from "../../../components/modals/CameraModal";
import { ForwardMessageModal } from "../../../components/modals/ForwardMessageModal";
import { MediaComposerModal } from "../../../components/modals/MediaComposerModal";
import { useAuth } from "@/contexts/AuthContext";
import { ChatService } from "@/services/chat.service";
import AudioMessage from "@/components/ui/AudioMessage";
import { CurrentUser } from "@/constants";
import TextMessage from "@/components/ui/TextMessage";
import { MediaUtils } from "@/utils/media.utils";
import { formatLastMessageTime, formatMessageTime } from "@/utils/time_formatter.utils";

interface ChatViewProps {
  chat: Chat | null;
  onBack: () => void;
  onToggleProfile: () => void;
  cannedResponses: CannedResponse[];
  onTogglePin: (chatId: string) => void;
  onStatusClick?: (statusId: string) => void;
}

// Helper for highlighting search results
const HighlightedText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim()) {
    return <>{text}</>;
  }
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedHighlight})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span
            key={i}
            className="bg-yellow-300 text-black px-0.5 rounded-xs shadow-sm"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
};

// Helper to render message content
const renderMessageContent = (
  msg: Message,
  isMe: boolean,
  chat: Chat,
  playingAudioId: string | null,
  toggleAudio: (messageId: string, url: string) => void,
  searchQuery: string,
  audioRefs: React.MutableRefObject<{ [key: string]: HTMLAudioElement }>,
  onStatusClick?: (statusId: string) => void,
) => {
  // Determine if this is a group chat
  const isGroupChat = chat?.isGroup || false;

  // Get sender name
  const senderName = msg.sender?.name || "Unknown";

  return (
    <div>
      {/* Sender Name - Only show in group chats and not for own messages */}
      {isGroupChat && !isMe && (
        <div className="px-4 pt-2 pb-0.5">
          <span className="text-xs font-semibold text-primary">
            {senderName}
          </span>
        </div>
      )}

      {/* Sender Name for own messages in group chats (optional) */}
      {isGroupChat && isMe && (
        <div className="px-4 pt-2 pb-0.5 text-right">
          <span className="text-xs font-semibold text-secondary">You</span>
        </div>
      )}

      {msg.type === MessageType.IMAGE && (
        <div className="p-1">
          <img
            src={msg.fileUrl}
            alt={msg.fileName}
            className="rounded-xl w-full max-w-sm max-h-80 object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              window.open(msg.fileUrl, "_blank");
            }}
          />
          {msg.content && msg.content !== "Photo" && (
            <p className="px-3 pt-2 pb-1 text-sm">
              <HighlightedText text={msg.content} highlight={searchQuery} />
            </p>
          )}

          {/* Show sender name at bottom for images in group chats (alternative position) */}
          {isGroupChat && !isMe && (
            <p className="px-3 pb-1 text-[10px] text-secondary font-medium">
              {senderName}
            </p>
          )}
        </div>
      )}

      {msg.type === MessageType.FILE && (
        <div className="p-3 flex items-center gap-3 bg-black/5 dark:bg-black/20 rounded-xl m-1 border border-border/50">
          <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-primary shadow-sm">
            <FileText size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">
                <HighlightedText
                  text={msg.fileName || "Document"}
                  highlight={searchQuery}
                />
              </p>
              {/* Sender name inline for files in group chats */}
              {isGroupChat && !isMe && (
                <span className="text-[10px] text-secondary whitespace-nowrap">
                  • {senderName}
                </span>
              )}
            </div>
            <p className="text-xs opacity-70">
              {msg.fileSize} • {msg.fileName?.split(".").pop()?.toUpperCase()}
            </p>
          </div>
          <a
            href={msg.fileUrl}
            download={msg.fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-surface-hover rounded-full transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={18} />
          </a>
        </div>
      )}

      {msg.type === MessageType.AUDIO && (
        <AudioMessage
          msg={msg}
          isGroupChat={chat.isGroup} // or however you determine if it's a group chat
          isMe={msg.sender?.id === CurrentUser.id}
          senderName={msg.sender?.name}
          playingAudioId={playingAudioId}
          toggleAudio={toggleAudio}
          chat={chat} // Pass the full chat object
        />
      )}

      {msg.type === MessageType.TEXT && (
        <TextMessage
          msg={msg}
          searchQuery={searchQuery}
          onStatusClick={onStatusClick}
        />
      )}
    </div>
  );
};

const FormattingHint = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showFullGuide, setShowFullGuide] = useState(false);

  return (
    <div className="relative flex items-center">
      {/* Formatting icons hint */}
      <div className="flex items-center gap-1 mr-2 text-secondary/50">
        <button
          onClick={() => {
            const textarea = document.querySelector("textarea");
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const selectedText = text.substring(start, end);

            // Insert bold syntax
            const newText =
              text.substring(0, start) +
              (selectedText ? `*${selectedText}*` : "**bold**") +
              text.substring(end);

            // Trigger change event
            const event = new Event("input", { bubbles: true });
            Object.getOwnPropertyDescriptor(
              HTMLTextAreaElement.prototype,
              "value",
            )?.set?.call(textarea, newText);
            textarea.dispatchEvent(event);

            // Set cursor position
            setTimeout(() => {
              if (!selectedText) {
                textarea.setSelectionRange(start + 2, start + 6);
              }
              textarea.focus();
            }, 0);
          }}
          className="p-1 hover:bg-surface-hover rounded-md transition-colors hover:text-primary"
          title="Bold (⌘B)"
        >
          <Bold size={14} />
        </button>

        <button
          onClick={() => {
            const textarea = document.querySelector("textarea");
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const selectedText = text.substring(start, end);

            const newText =
              text.substring(0, start) +
              (selectedText ? `_${selectedText}_` : "_italic_") +
              text.substring(end);

            const event = new Event("input", { bubbles: true });
            Object.getOwnPropertyDescriptor(
              HTMLTextAreaElement.prototype,
              "value",
            )?.set?.call(textarea, newText);
            textarea.dispatchEvent(event);

            setTimeout(() => {
              if (!selectedText) {
                textarea.setSelectionRange(start + 1, start + 7);
              }
              textarea.focus();
            }, 0);
          }}
          className="p-1 hover:bg-surface-hover rounded-md transition-colors hover:text-primary"
          title="Italic (⌘I)"
        >
          <Italic size={14} />
        </button>

        <button
          onClick={() => {
            const textarea = document.querySelector("textarea");
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const selectedText = text.substring(start, end);

            const newText =
              text.substring(0, start) +
              (selectedText ? `~${selectedText}~` : "~strikethrough~") +
              text.substring(end);

            const event = new Event("input", { bubbles: true });
            Object.getOwnPropertyDescriptor(
              HTMLTextAreaElement.prototype,
              "value",
            )?.set?.call(textarea, newText);
            textarea.dispatchEvent(event);

            setTimeout(() => {
              if (!selectedText) {
                textarea.setSelectionRange(start + 1, start + 14);
              }
              textarea.focus();
            }, 0);
          }}
          className="p-1 hover:bg-surface-hover rounded-md transition-colors hover:text-primary"
          title="Strikethrough (⌘Shift+X)"
        >
          <Strikethrough size={14} />
        </button>

        <button
          onClick={() => {
            const textarea = document.querySelector("textarea");
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const selectedText = text.substring(start, end);

            const newText =
              text.substring(0, start) +
              (selectedText ? `\`${selectedText}\`` : "`code`") +
              text.substring(end);

            const event = new Event("input", { bubbles: true });
            Object.getOwnPropertyDescriptor(
              HTMLTextAreaElement.prototype,
              "value",
            )?.set?.call(textarea, newText);
            textarea.dispatchEvent(event);

            setTimeout(() => {
              if (!selectedText) {
                textarea.setSelectionRange(start + 1, start + 5);
              }
              textarea.focus();
            }, 0);
          }}
          className="p-1 hover:bg-surface-hover rounded-md transition-colors hover:text-primary"
          title="Code (⌘E)"
        >
          <Code size={14} />
        </button>
      </div>

      {/* Help icon with tooltip */}
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          onClick={() => setShowFullGuide(!showFullGuide)}
          className="p-1 hover:bg-surface-hover rounded-full transition-colors text-secondary hover:text-primary"
        >
          <HelpCircle size={16} />
        </button>

        {/* Quick tooltip on hover */}
        {showTooltip && !showFullGuide && (
          <div className="absolute bottom-full right-0 mb-2 p-2 bg-surface border border-border rounded-lg shadow-xl text-xs whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-1">
            <div className="font-medium mb-1">Formatting:</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-secondary">
              <span>*bold*</span>
              <span>_italic_</span>
              <span>~strike~</span>
              <span>`code`</span>
            </div>
            <div className="border-t border-border mt-1 pt-1 text-[10px] text-secondary/70">
              Click for more options
            </div>
          </div>
        )}
      </div>

      {/* Full formatting guide modal */}
      {showFullGuide && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowFullGuide(false)}
          />
          <div className="absolute bottom-full right-0 mb-2 w-72 bg-surface border border-border rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                Text Formatting
              </h3>
              <button
                onClick={() => setShowFullGuide(false)}
                className="p-1 hover:bg-surface-hover rounded-full"
              >
                <HelpCircle size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <FormattingRow
                  syntax="*text*"
                  example="bold"
                  preview={<span className="font-bold">bold</span>}
                />
                <FormattingRow
                  syntax="_text_"
                  example="italic"
                  preview={<span className="italic">italic</span>}
                />
                <FormattingRow
                  syntax="~text~"
                  example="strikethrough"
                  preview={<span className="line-through">strikethrough</span>}
                />
                <FormattingRow
                  syntax="`text`"
                  example="code"
                  preview={
                    <code className="font-mono bg-black/10 dark:bg-white/10 px-1 rounded">
                      code
                    </code>
                  }
                />
                <FormattingRow
                  syntax="*_text_*"
                  example="bold italic"
                  preview={
                    <span className="font-bold italic">bold italic</span>
                  }
                />
              </div>

              <div className="border-t border-border pt-2 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-secondary">
                    Select text + click icon
                  </span>
                  <span className="font-mono bg-surface-hover px-1.5 py-0.5 rounded">
                    ⌘B
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-secondary">Shift+Enter</span>
                  <span className="font-mono bg-surface-hover px-1.5 py-0.5 rounded">
                    new line
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-secondary">Enter</span>
                  <span className="font-mono bg-surface-hover px-1.5 py-0.5 rounded">
                    send
                  </span>
                </div>
              </div>

              <div className="bg-surface-hover/50 rounded-lg p-2 text-[10px] text-secondary">
                <p className="flex items-center gap-1">
                  <Sparkles size={10} />
                  Tip: Select text and click format, or type syntax manually
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const FormattingRow = ({
  syntax,
  example,
  preview,
}: {
  syntax: string;
  example: string;
  preview: React.ReactNode;
}) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs bg-surface-hover px-2 py-1 rounded">
        {syntax}
      </span>
      <span className="text-secondary">→</span>
    </div>
    <div className="text-text-main">{preview}</div>
  </div>
);

// Helper to format bytes
const formatBytes = (bytes: number, decimals = 1) => {
  if (!+bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Helper to format time
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const ChatView: React.FC<ChatViewProps> = ({
  chat,
  onBack,
  onToggleProfile,
  cannedResponses,
  onTogglePin,
  onStatusClick,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<
    string | null
  >(null);
  const [showCannedMenu, setShowCannedMenu] = useState(false);
  const [cannedSearchTerm, setCannedSearchTerm] = useState("");
  const [selectedCannedIndex, setSelectedCannedIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
  const [showMuteDialog, setShowMuteDialog] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(
    null,
  );

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cannedListRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const isScrolledToBottomRef = useRef(true);
  const prevMessagesLengthRef = useRef(0);

  // Polling query for messages
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["chat-messages", chat?.id],
    queryFn: async () => {
      if (!chat?.id) return [];
      try {
        const response = await ChatService.getMessages(chat.id);
        return Array.isArray(response.data) ? response.data : response;
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
    },
    enabled: !!chat?.id,
    refetchInterval: 3000, // Poll every 3 seconds
    refetchOnWindowFocus: false,
    staleTime: 2000,
    select: (data) => {
      // Merge with pending messages
      const pendingMessages =
        queryClient.getQueryData<Message[]>(["pending-messages", chat?.id]) ||
        [];
      return [...data, ...pendingMessages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    },
  });

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: ({
      content,
      type,
      fileData,
      replyToId,
    }: {
      content: string;
      type: MessageType;
      fileData?: any;
      replyToId?: string;
    }) => {
      // Create pending message
      const pendingMessage: Message = {
        id: `pending-${Date.now()}`,
        senderId: user?.id || "",
        content,
        type,
        sender: user,
        chatId: chat?.id || "",
        isEdited: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPending: true,
        ...fileData,
        replyToId,
      };

      // Add to pending cache
      queryClient.setQueryData(
        ["pending-messages", chat?.id],
        (old: Message[] = []) => [...old, pendingMessage],
      );

      // Send to server
      return ChatService.sendMessage(
        {
          chatId: chat?.id || "",
          content,
          type,
          ...fileData,
          replyToId,
        },
        fileData?.file,
      );
    },
    onSuccess: (newMessage) => {
      // Remove pending message
      queryClient.setQueryData(
        ["pending-messages", chat?.id],
        (old: Message[] = []) =>
          old.filter((msg) => msg.content !== newMessage.content),
      );

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chat-messages", chat?.id] });

      // Scroll to bottom
      setTimeout(() => scrollToBottom("smooth"), 100);
    },
    onError: (error, variables) => {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");

      // Remove failed pending message
      queryClient.setQueryData(
        ["pending-messages", chat?.id],
        (old: Message[] = []) =>
          old.filter((msg) => msg.content !== variables.content),
      );
    },
  });

  const updateMessageMutation = useMutation({
    mutationFn: ({
      messageId,
      content,
    }: {
      messageId: string;
      content: string;
    }) => ChatService.editMessage(messageId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", chat?.id] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) => ChatService.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", chat?.id] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const toggleReactionMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      ChatService.toggleReaction(messageId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", chat?.id] });
    },
  });

  const forwardMessageHandler = async (
    originalMessageId: string,
    targetChatIds: string[],
  ) => {
    try {
      await ChatService.forwardMessage(originalMessageId, targetChatIds);
      // Invalidate all affected chat message queries
      targetChatIds.forEach((chatId) => {
        queryClient.invalidateQueries({ queryKey: ["chat-messages", chatId] });
      });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    } catch (error) {
      console.error("Failed to forward message:", error);
      throw error;
    }
  };

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [copiedReplyId, setCopiedReplyId] = useState<string | null>(null);

  const handleCopyMessage = async (
    messageId: string,
    content: string,
    type: "message" | "reply" = "message",
  ) => {
    try {
      await navigator.clipboard.writeText(content);
      if (type === "message") {
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
      } else {
        setCopiedReplyId(messageId);
        setTimeout(() => setCopiedReplyId(null), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Scroll utilities
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setShowNewMessageIndicator(false);
  };

  const scrollToMessage = (messageId: string) => {
    const el = messageRefs.current[messageId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Brief highlight flash
      el.classList.add("ring-2", "ring-primary/60", "rounded-2xl");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-primary/60", "rounded-2xl");
      }, 1000);
    }
  };

  const handleNewMessageClick = () => {
    scrollToBottom();
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      isScrolledToBottomRef.current = isNearBottom;
      setShowScrollButton(!isNearBottom);

      if (isNearBottom) {
        setShowNewMessageIndicator(false);
      }
    }
  };

  const markAsRead = async () => {
    if (chat) {
      await ChatService.markAsRead(chat.id);
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    }
  };

  // Effects
  useEffect(() => {
    if (chat) {
      // Reset all states
      setInputValue("");
      setShowEmojiPicker(false);
      setShowAttachMenu(false);
      setIsRecording(false);
      setReplyingTo(null);
      setEditingMessage(null);
      setActiveReactionMessageId(null);
      setSelectedMessageId(null);
      setShowCannedMenu(false);
      setShowNewMessageIndicator(false);
      setIsSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);

      // Stop recording if active
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }

      // Clear pending messages
      queryClient.setQueryData(["pending-messages", chat.id], []);

      // Mark as read
      if (user?.role === UserRole.USER || user?.role === UserRole.BRANCH)
        markAsRead();

      // Scroll to bottom
      setTimeout(() => {
        scrollToBottom("auto");
        isScrolledToBottomRef.current = true;
      }, 100);
    }
  }, [chat, queryClient]);

  // Track new messages
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      const newCount = messages.length - prevMessagesLengthRef.current;

      if (!isScrolledToBottomRef.current) {
        setShowNewMessageIndicator(true);
      }

      if (isScrolledToBottomRef.current) {
        setTimeout(() => scrollToBottom("smooth"), 100);
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  // Setup scroll listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      return;
    }

    const results = messages
      .filter(
        (m) =>
          !m.isDeleted &&
          m.type === "TEXT" &&
          m.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .map((m) => m.id);

    setSearchResults(results);
    setCurrentResultIndex(results.length > 0 ? results.length - 1 : -1);
  }, [searchQuery, messages.length]);

  // Scroll to search result
  useEffect(() => {
    if (currentResultIndex >= 0 && searchResults[currentResultIndex]) {
      const msgId = searchResults[currentResultIndex];
      const el = messageRefs.current[msgId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentResultIndex, searchResults]);

  // Focus search input
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".message-bubble")) return;
      if (target.closest(".attach-menu-trigger")) return;

      setSelectedMessageId(null);
      if (!target.closest(".attach-menu")) {
        setShowAttachMenu(false);
      }
      if (!target.closest(".canned-menu")) {
        setShowCannedMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Canned responses scrolling
  useEffect(() => {
    if (
      showCannedMenu &&
      cannedListRef.current &&
      filteredCannedResponses.length > 0
    ) {
      const selectedEl = cannedListRef.current.children[
        selectedCannedIndex
      ] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedCannedIndex, showCannedMenu]);

  // Event handlers
  const handleSendMessage = useCallback(
    (type: MessageType, content: string = "", fileData: any = {}) => {
      if (
        !chat ||
        (!content.trim() && type === MessageType.TEXT && !fileData.file)
      )
        return;

      if (editingMessage && type === MessageType.TEXT) {
        updateMessageMutation.mutate({
          messageId: editingMessage.id,
          content,
        });
        setEditingMessage(null);
        setInputValue("");
        return;
      }

      sendMessageMutation.mutate({
        content,
        type,
        fileData,
        replyToId: replyingTo?.id,
      });

      setInputValue("");
      setReplyingTo(null);
      setShowCannedMenu(false);
    },
    [
      chat,
      editingMessage,
      replyingTo,
      sendMessageMutation,
      updateMessageMutation,
    ],
  );

  const handleTextSend = useCallback(() => {
    if (!chat) return;

    // ⭐ CASE 1: Media is selected (image/file)
    if (pendingFile) {
      const isImage = pendingFile.type.startsWith("image/");
      handleSendMessage(
        isImage ? MessageType.IMAGE : MessageType.FILE,
        inputValue || (isImage ? "Photo" : pendingFile.name),
        {
         file: pendingFile,
          fileName: pendingFile.name,
          fileSize: formatBytes(pendingFile.size),
          mimeType: pendingFile.type,
        }
      );
      // Clear after send
      setPendingFile(null); return;
    }
    if (!inputValue.trim()) return;
    handleSendMessage(MessageType.TEXT, inputValue);
  }, [chat, pendingFile, inputValue, handleSendMessage]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setInputValue(val);

      if (val.startsWith("/")) {
        const query = val.slice(1).toLowerCase();
        if (query.includes(" ")) {
          setShowCannedMenu(false);
        } else {
          setCannedSearchTerm(query);
          setShowCannedMenu(true);
          setSelectedCannedIndex(0);
        }
      } else {
        setShowCannedMenu(false);
      }
    },
    [],
  );

  const filteredCannedResponses = cannedResponses.filter(
    (item) =>
      item.command.toLowerCase().includes(cannedSearchTerm) ||
      item.description?.toLowerCase().includes(cannedSearchTerm) ||
      false,
  );

  const selectCannedResponse = useCallback((response: { text: string }) => {
    setInputValue(response.text);
    setShowCannedMenu(false);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Detect if it's a mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // Canned responses logic (same as before)
      if (showCannedMenu && filteredCannedResponses.length > 0) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedCannedIndex(
            (prev) =>
              (prev - 1 + filteredCannedResponses.length) %
              filteredCannedResponses.length,
          );
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedCannedIndex(
            (prev) => (prev + 1) % filteredCannedResponses.length,
          );
        } else if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          selectCannedResponse(filteredCannedResponses[selectedCannedIndex]);
        } else if (e.key === "Escape") {
          e.preventDefault();
          setShowCannedMenu(false);
        }
        return;
      }

      // Handle Enter key
      if (e.key === "Enter") {
        // MOBILE: Return key should create new line (keyboard's Send button handles sending)
        if (isMobile) {
          // On mobile, let Return key create new lines naturally
          // Don't call preventDefault()
          return;
        }

        // DESKTOP: Regular Enter without Shift - send message
        if (!e.shiftKey) {
          e.preventDefault();
          handleTextSend();
          return;
        }

        // DESKTOP: Shift+Enter = new line (let browser handle it)
        // Do nothing - let textarea handle Shift+Enter naturally
      }
    },
    [
      showCannedMenu,
      filteredCannedResponses,
      selectedCannedIndex,
      selectCannedResponse,
      handleTextSend,
    ],
  );

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      if (activeReactionMessageId) {
        toggleReactionMutation.mutate({
          messageId: activeReactionMessageId,
          emoji,
        });
        setShowEmojiPicker(false);
        setActiveReactionMessageId(null);
      } else {
        setInputValue((prev) => prev + emoji);
      }
    },
    [activeReactionMessageId, toggleReactionMutation],
  );

  const toggleReaction = useCallback(
    (messageId: string, emoji: string) => {
      toggleReactionMutation.mutate({ messageId, emoji });
      setSelectedMessageId(null);
    },
    [toggleReactionMutation],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && chat) {
        let file = e.target.files[0];
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const isAudio = file.type.startsWith("audio/");

        // Check if video/audio has audio track
        if (isVideo || isAudio) {
          const hasAudioTrack = await MediaUtils.hasAudio(file);
          if (hasAudioTrack) {
            const result = window.confirm(
              "Do you want to mute the audio? It has an audio track.",
            );
            if (result) {
              if (isVideo) {
                file = await MediaUtils.muteVideo(file);
              } else if (isAudio) {
                file = await MediaUtils.muteAudio(file);
              }
            }
          }
        }

        // try {
        //   await sendMessageMutation.mutateAsync({
        //     content: isImage ? "Photo" : file.name,
        //     type: isImage ? MessageType.IMAGE : MessageType.FILE,
        //     fileData: {
        //       file,
        //       fileName: file.name,
        //       fileSize: formatBytes(file.size),
        //       mimeType: file.type,
        //     },
        //     replyToId: replyingTo?.id,
        //   });
          setPendingFile(file);
          setShowAttachMenu(false);
        // } catch (error) {
        //   console.error("Error sending file:", error);
        //   alert("Failed to send file. Please try again.");
        // }
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [chat, sendMessageMutation],
  );

  const handleCameraCapture = useCallback(
    (imageSrc: string) => {
      if (!chat) return;

      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `camera_capture_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });

          // sendMessageMutation.mutate({
          //   content: "Photo",
          //   type: MessageType.IMAGE,
          //   fileData: {
          //     file,
          //     fileName: file.name,
          //     fileSize: formatBytes(blob.size),
          //     mimeType: file.type,
          //     replyToId: replyingTo?.id,
          //   },
          // });
          setPendingFile(file);
          setShowAttachMenu(false);
        })
        .catch((error) => {
          console.error("Error processing camera capture:", error);
          alert("Failed to process image. Please try again.");
        });
    },
    [chat, sendMessageMutation],
  );

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const durationStr = formatTime(recordingDuration);

        try {
          const audioFile = new File(
            [audioBlob],
            `voice_message_${Date.now()}.webm`,
            { type: "audio/webm" },
          );

          await sendMessageMutation.mutateAsync({
            content: `Voice message`,
            type: MessageType.AUDIO,
            fileData: {
              file: audioFile,
              fileName: `Voice note - ${durationStr}.webm`,
              fileSize: formatBytes(audioBlob.size),
              mimeType: "audio/webm",
            },
            replyToId: replyingTo?.id,
          });
        } catch (error) {
          console.error("Error sending audio message:", error);
          alert("Failed to send voice message. Please try again.");
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = (cancel = false) => {
    if (mediaRecorderRef.current && isRecording) {
      if (cancel) {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      } else {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    }
  };

  const toggleAudio = (messageId: string, url: string) => {
    let audio = audioRefs.current[messageId];

    if (!audio && url) {
      audio = new Audio(url);
      audioRefs.current[messageId] = audio;
    }

    if (!audio) return;

    if (playingAudioId === messageId) {
      audio.pause();
      setPlayingAudioId(null);
    } else {
      if (playingAudioId && audioRefs.current[playingAudioId]) {
        audioRefs.current[playingAudioId].pause();
        audioRefs.current[playingAudioId].currentTime = 0;
      }
      audio.play();
      setPlayingAudioId(messageId);
      audio.onended = () => setPlayingAudioId(null);
    }
  };

  const openReactionPicker = (messageId: string) => {
    setActiveReactionMessageId(messageId);
    setShowEmojiPicker(true);
  };

  const handleMessageClick = (
    e: React.MouseEvent,
    msgId: string,
    isDeleted: boolean,
  ) => {
    e.stopPropagation();
    if (isDeleted) return;

    if (selectedMessageId === msgId) {
      setSelectedMessageId(null);
    } else {
      setSelectedMessageId(msgId);
    }
  };

  const handleDeleteMessage = useCallback(
    (msgId: string) => {
      if (!window.confirm("Are you sure you want to delete this message?")) {
        return;
      }
      deleteMessageMutation.mutate(msgId);
      setSelectedMessageId(null);
    },
    [deleteMessageMutation],
  );

  const handleStartEdit = useCallback((msg: Message) => {
    const createdAt = msg.createdAt ? new Date(msg.createdAt).getTime() : 0;
    const isEditableUnder5Minutes = (Date.now() - createdAt) <= 15 * 60 * 1000;
    if (!isEditableUnder5Minutes) {
      alert("You can only edit messages sent within the last 5 minutes.");
      return;
    }
    setEditingMessage(msg);
    setInputValue(msg.content);
    setReplyingTo(null);
    setSelectedMessageId(null);
    inputRef.current?.focus();
  }, []);

  const handleEndEdit = useCallback(() => {
    if (!editingMessage) return;
    updateMessageMutation.mutate({
      messageId: editingMessage.id,
      content: inputValue,
    });
    setEditingMessage(null);
    setInputValue("");
    setReplyingTo(null);
    setSelectedMessageId(null);
  }, [updateMessageMutation]);

  const handleNextMatch = () => {
    if (searchResults.length === 0) return;
    setCurrentResultIndex((prev) => (prev + 1) % searchResults.length);
  };

  const handlePrevMatch = () => {
    if (searchResults.length === 0) return;
    setCurrentResultIndex(
      (prev) => (prev - 1 + searchResults.length) % searchResults.length,
    );
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleManualRefresh = () => {
    refetchMessages();
    queryClient.invalidateQueries({ queryKey: ["chats"] });
  };

  let otherUser;
  let currentUserMember;

  // Get other user and current user member
  if (user?.role === UserRole.BRANCH || user?.role === UserRole.USER) {
    otherUser = chat?.isGroup
      ? null
      : chat?.members.find((m) => m.user.id !== user?.id)?.user;
    currentUserMember = chat?.members.find((m) => m.user.id === user?.id);
  } else {
    otherUser = chat?.isGroup
      ? null
      : chat?.members.find((m) => m.user.role === UserRole.USER)?.user;
    currentUserMember = chat?.members.find(
      (m) => m.user.role === UserRole.BRANCH,
    );
  }

  // Empty state
  if (!chat) {
    return (
      <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-background relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(var(--color-pattern), 0.05) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        ></div>

        <div className="z-10 text-center p-8 animate-in zoom-in-95 duration-500">
          <div className="w-32 h-32 rounded-3xl bg-surface border border-border shadow-2xl flex items-center justify-center mb-8 mx-auto rotate-12 hover:rotate-0 transition-transform duration-500">
            <div className="w-24 h-24 bg-linear-to-tr from-primary to-green-300 rounded-2xl flex items-center justify-center text-white shadow-inner">
              <span className="text-5xl font-black">
                <MessageCircleCodeIcon size={48} />
              </span>
            </div>
          </div>
          <h2 className="text-4xl font-black text-text-main mb-4 tracking-tight">
            LineUp
          </h2>
          <p className="text-secondary max-w-sm mx-auto text-lg leading-relaxed">
            Select a conversation to start messaging securely with your team.
          </p>
          <div className="mt-8 flex gap-2 justify-center">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-xs font-mono text-secondary">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              System Operational
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(var(--color-pattern), 0.1) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      ></div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraModal
          onClose={() => setShowCamera(false)}
          onCapture={handleCameraCapture}
        />
      )}
      {/* Media Composer Modal */}
<MediaComposerModal
  file={pendingFile}
  caption={mediaCaption}
  onCaptionChange={setMediaCaption}
  onClose={() => {
    setShowMediaModal(false);
    setPendingFile(null);
    setMediaCaption("");
  }}
  onAddMore={() => fileInputRef.current?.click()}
  onSend={() => {
    if (!pendingFile) return;

    const isImage = pendingFile.type.startsWith("image/");

    handleSendMessage(
      isImage ? MessageType.IMAGE : MessageType.FILE,
      mediaCaption || (isImage ? "Photo" : pendingFile.name),
      {
        file: pendingFile,
        fileName: pendingFile.name,
        fileSize: formatBytes(pendingFile.size),
        mimeType: pendingFile.type,
      }
    );

    setShowMediaModal(false);
    setPendingFile(null);
    setMediaCaption("");
  }}
/>


      {/* Forward Message Modal */}
      {forwardingMessage && (
        <ForwardMessageModal
          message={forwardingMessage}
          chats={queryClient.getQueryData<Chat[]>(["chats"]) || []}
          onClose={() => setForwardingMessage(null)}
          onForward={forwardMessageHandler}
        />
      )}

      {/* Header */}
      <header className="h-18 px-4 md:px-6 bg-surface/90 backdrop-blur-xl flex items-center justify-between border-b border-border/60 shadow-sm relative z-20 transition-all shrink-0">
        {isSearchOpen ? (
          <div className="flex items-center w-full gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={closeSearch}
              className="p-2 text-secondary hover:text-text-main hover:bg-surface-hover rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary group-focus-within:text-primary transition-colors">
                <Search size={20} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search in conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-hover/50 text-text-main pl-10 pr-10 py-2 rounded-xl focus:outline-none border border-transparent focus:border-primary/30 focus:bg-surface transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-secondary hover:text-text-main rounded-full bg-black/5 dark:bg-white/10"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 border-l border-border pl-3">
              <span className="text-xs font-mono font-medium text-secondary mr-2 min-w-[3ch] text-center">
                {searchResults.length > 0
                  ? `${currentResultIndex + 1}/${searchResults.length}`
                  : "0"}
              </span>
              <button
                onClick={handlePrevMatch}
                disabled={searchResults.length === 0}
                className="p-1.5 hover:bg-surface-hover rounded-lg text-secondary hover:text-text-main disabled:opacity-30 transition-colors"
              >
                <ChevronUp size={18} />
              </button>
              <button
                onClick={handleNextMatch}
                disabled={searchResults.length === 0}
                className="p-1.5 hover:bg-surface-hover rounded-lg text-secondary hover:text-text-main disabled:opacity-30 transition-colors"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
              <button
                onClick={onBack}
                className="md:hidden p-2 -ml-2 text-secondary hover:text-text-main hover:bg-surface-hover rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>

              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={onToggleProfile}
              >
                <div className="relative">
                  <Avatar
                    user={chat.isGroup ? undefined : otherUser!}
                    isGroup={chat.isGroup}
                    groupName={chat.isGroup ? chat.groupName : undefined}
                    size="md"
                    showStatus={!chat.isGroup}
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-text-main font-bold leading-tight text-base md:text-lg truncate group-hover:text-primary transition-colors">
                    {chat.isGroup
                      ? chat.groupName || "Group"
                      : otherUser?.name || "Unknown"}
                  </span>
                  <span className="text-xs text-secondary truncate max-w-45 sm:max-w-xs flex items-center gap-1.5 font-medium">
                    {chat.isGroup ? (
                      `${chat.members?.length || 0} members`
                    ) : otherUser?.status === UserStatus.ONLINE ? (
                      <span className="text-primary flex items-center gap-1">
                        Online
                      </span>
                    ) : (
                      <span className="opacity-80">
                        {formatLastMessageTime(otherUser?.lastSeen || "") || "Unknown"}
                      </span>
                    )}
                  </span>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleManualRefresh}
                  disabled={isLoadingMessages}
                  className="p-1.5 hover:bg-surface-hover rounded-full transition-colors text-secondary hover:text-primary"
                  title="Refresh messages"
                >
                  <RefreshCw
                    size={16}
                    className={isLoadingMessages ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2 text-icon shrink-0">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-surface-hover hover:text-primary rounded-full transition-colors"
                title="Search in chat"
              >
                <Search size={20} />
              </button>

              <button
                className="p-2 rounded-full transition-colors hover:bg-surface-hover hover:text-text-main"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleProfile();
                }}
                title="Chat info"
              >
                <MoreHorizontal size={20} />
              </button>
            </div>
          </>
        )}
      </header>

      {/* New Messages Indicator */}
      {showNewMessageIndicator && (
        <button
          onClick={handleNewMessageClick}
          className="absolute bottom-20 right-6 z-20 bg-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 hover:bg-primary/90 transition-colors"
        >
          <ArrowDown size={16} />
          <span className="text-sm font-medium">New messages</span>
        </button>
      )}

      {/* Messages Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar relative z-0"
      >
        {isLoadingMessages && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* <div className="flex justify-center mb-8 sticky top-0 z-10 pointer-events-none">
              <span className="bg-surface/80 backdrop-blur text-secondary text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide border border-border">
                Today
              </span>
            </div> */}

            {messages.map((msg) => {
              const isMe = msg.sender?.id === currentUserMember?.user?.id;
              const isPending = msg.isPending;
              const repliedMsg = msg.replyToId
                ? messages.find((m) => m.id === msg.replyToId)
                : null;
              const isSelected = selectedMessageId === msg.id;
              const isDeleted = msg.isDeleted;
              const isSearchResult = searchResults.includes(msg.id);
              const createdAt = msg.createdAt ? new Date(msg.createdAt).getTime() : 0;
              const isEditableUnder5Minutes = (Date.now() - createdAt) <= 15 * 60 * 1000;
  
              return (
                <div
                  key={msg.id}
                  ref={(el) => {
                    messageRefs.current[msg.id] = el;
                  }}
                  className={`flex shrink ${isMe ? "justify-end" : "justify-start"} group mb-2 relative message-bubble transition-colors ${isPending ? "opacity-70" : ""} ${isSearchResult ? "z-10" : ""}`}
                >
                  {/* Pending indicator */}
                  {isPending && (
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}

                  <div className="flex flex-col max-w-[85%] sm:max-w-[65%] relative">
                    {/* Floating Actions */}
                    {!isDeleted && !isPending && (
                      <div
                        className={`
                          absolute -top-10 z-20 flex items-center gap-1 p-1 rounded-full bg-surface border border-border shadow-xl transition-all duration-200
                          ${isMe ? "right-0" : "left-0"}
                          ${isSelected ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2 pointer-events-none md:group-hover:opacity-100 md:group-hover:scale-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto"}
                        `}
                      >
                        {/* Reply */}
                        {(user?.role === UserRole.USER ||
                          user?.role === UserRole.BRANCH ||
                          (user?.role === UserRole.ADMIN && chat.isGroup) ||
                          (user?.role === UserRole.MASTER && chat.isGroup)) && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReplyingTo(msg);
                                  setSelectedMessageId(null);
                                  setEditingMessage(null);
                                }}
                                className="p-1.5 rounded-full hover:bg-surface-hover text-icon hover:text-text-main transition-colors"
                              >
                                <Reply size={16} />
                              </button>
                              <div className="w-px h-3 bg-border"></div>
                            </>
                          )}
                        {/* Forward */}
                        {(user?.role === UserRole.BRANCH ||
                          (user?.role === UserRole.ADMIN && chat.isGroup) ||
                          (user?.role === UserRole.MASTER && chat.isGroup)) && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setForwardingMessage(msg);
                                  setSelectedMessageId(null);
                                }}
                                className="p-1.5 rounded-full hover:bg-surface-hover text-icon hover:text-text-main transition-colors"
                                title="Forward"
                              >
                                <Share2 size={16} />
                              </button>
                              <div className="w-px h-3 bg-border"></div>
                            </>
                          )}
                        {/* Reactions */}
                        {(user?.role === UserRole.USER ||
                          user?.role === UserRole.BRANCH ||
                          (user?.role === UserRole.ADMIN && chat.isGroup) ||
                          (user?.role === UserRole.MASTER && chat.isGroup)) && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReactionPicker(msg.id);
                                }}
                                className="p-1.5 rounded-full hover:bg-surface-hover text-icon hover:text-text-main transition-colors"
                              >
                                <Smile size={16} />
                              </button>
                              <div className="w-px h-3 bg-border"></div>
                            </>
                          )}
                        {/* Edit */}
                        {isMe &&
                          (user?.role === UserRole.USER ||
                            user?.role === UserRole.BRANCH ||
                            (user?.role === UserRole.ADMIN && chat.isGroup) ||
                            (user?.role === UserRole.MASTER && chat.isGroup)) &&
                          msg.type === MessageType.TEXT && isEditableUnder5Minutes && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(msg);
                                }}
                                className="p-1.5 rounded-full hover:bg-surface-hover text-icon hover:text-text-main transition-colors"
                              >
                                <Pencil size={16} />
                              </button>
                              <div className="w-px h-3 bg-border"></div>
                            </>
                          )}
                        {/* Copy */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyMessage(
                              msg.id,
                              msg.content || msg.fileName || "Attachment",
                            );
                          }}
                          className="p-1.5 rounded-full hover:bg-surface-hover text-icon hover:text-text-main transition-colors relative"
                          title="Copy message"
                        >
                          {copiedMessageId === msg.id ? (
                            <Check size={16} className="text-green-500" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                        {/* Delete */}
                        {isMe &&
                          (user?.role === UserRole.USER ||
                            user?.role === UserRole.BRANCH ||
                            (user?.role === UserRole.ADMIN && chat.isGroup) ||
                            (user?.role === UserRole.MASTER &&
                              chat.isGroup)) && (
                            <>
                              <div className="w-px h-3 bg-border"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.confirm(
                                    "Are you sure you want to delete this message?",
                                  ) && handleDeleteMessage(msg.id);
                                }}
                                className="p-1.5 rounded-full hover:bg-surface-hover text-icon hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`
                        rounded-2xl relative shadow-sm overflow-hidden transition-colors
                        ${isDeleted
                          ? "bg-surface text-secondary border border-border"
                          : isMe
                            ? "bg-bubble-out text-text-main dark:text-text-main rounded-tr-sm"
                            : "bg-bubble-in text-text-main rounded-tl-sm border border-border/50"
                        }
                        ${isSelected ? "ring-2 ring-primary/50 shadow-lg" : ""}
                      `}
                      onClick={(e) =>
                        handleMessageClick(e, msg.id, !!isDeleted)
                      }
                    >
                      {/* Forwarded Label */}
                      {!isDeleted && msg.forwardedFromId && (
                        <div
                          className={`px-4 pt-2 pb-0.5 flex items-center gap-1.5 text-xs italic ${isMe ? "text-bubble-meta opacity-80" : "text-secondary"}`}
                        >
                          <Share2 size={12} />
                          <span>
                            Forwarded
                            {msg.originalSenderName
                              ? ` from ${msg.originalSenderName}`
                              : ""}
                          </span>
                        </div>
                      )}
                      {/* Reply Quote */}
                      {!isDeleted && repliedMsg && (
                        <div
                          className={`mx-1 mt-1 mb-1 rounded-lg p-2 border-l-4 text-sm bg-black/5 dark:bg-black/20 cursor-pointer hover:bg-black/10 dark:hover:bg-black/30 transition-colors ${isMe ? "border-primary/50" : "border-primary"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollToMessage(repliedMsg.id);
                          }}
                        >
                          <p
                            className={`text-xs font-bold mb-0.5 ${isMe ? "text-primary" : "text-primary"}`}
                          >
                            {repliedMsg.sender?.id === user?.id
                              ? "You"
                              : chat.members.find(
                                (m) => m.user.id === repliedMsg.sender?.id,
                              )?.user.name || "Unknown"}
                          </p>
                          <p className="opacity-80 truncate">
                            {repliedMsg.content || "Attachment"}
                          </p>
                        </div>
                      )}
                      {isDeleted ? (
                        <div className="px-4 py-2 flex items-center gap-2 text-sm italic opacity-80 select-none">
                          <Ban size={14} className="text-secondary" />
                          <span>This message was deleted</span>
                        </div>
                      ) : (
                        renderMessageContent(
                          msg,
                          isMe,
                          chat,
                          playingAudioId,
                          toggleAudio,
                          searchQuery,
                          audioRefs,
                          onStatusClick
                        )
                      )}
                      {/* Message Meta */}
                      <div
                        className={`px-2 pb-1 text-[10px] flex items-center justify-end gap-1 ${isMe && !isDeleted ? "text-bubble-meta opacity-80" : "text-bubble-meta"}`}
                      >
                        {!isDeleted && msg.isEdited && (
                          <span className="italic opacity-80 mr-1">
                            (edited)
                          </span>
                        )}
                        <span>
                          {formatMessageTime(msg.createdAt)}
                        </span>
                        {isMe && !isDeleted && !isPending && (
                          <span>
                            <CheckCheck size={14} />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reactions */}
                    {!isDeleted &&
                      !isPending &&
                      msg.reactions &&
                      Object.keys(msg.reactions).length > 0 && (
                        <div
                          className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          {Object.entries(msg.reactions).map(
                            ([emoji, users]) => (
                              <button
                                key={emoji}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleReaction(msg.id, emoji);
                                }}
                                className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 transition-colors scale-100 hover:scale-110 ${(users as string[]).includes(user?.id || "")
                                  ? "bg-primary/20 border-primary/50 text-text-main"
                                  : "bg-surface border-border text-secondary hover:bg-surface-hover"
                                  }`}
                              >
                                <span>{emoji}</span>
                                <span className="font-mono">
                                  {(users as string[]).length}
                                </span>
                              </button>
                            ),
                          )}
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && !showNewMessageIndicator && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-24 right-6 p-3 bg-surface border border-border rounded-full shadow-lg text-secondary hover:text-primary z-20 animate-in fade-in zoom-in"
        >
          <ArrowDown size={20} />
        </button>
      )}

      {/* Input Area */}
      <div className="bg-surface/50 backdrop-blur-sm px-4 pb-4 pt-2 relative z-20">
        {/* Reply Context */}
        {replyingTo && (
          <div className="flex items-center justify-between bg-surface border border-border p-3 mb-2 rounded-2xl shadow-lg animate-in slide-in-from-bottom-2 fade-in">
            <div className="overflow-hidden border-l-4 border-primary pl-3">
              <span className="text-xs text-primary font-bold block mb-0.5">
                Replying to{" "}
                {replyingTo.sender?.id === user?.id
                  ? "You"
                  : chat.members.find(
                    (m) => m.user.id === replyingTo.sender?.id,
                  )?.user.name || "Unknown"}
              </span>
              <p className="text-sm text-secondary truncate">
                {replyingTo?.content || "Attachment"}
              </p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-2 text-secondary hover:text-text-main rounded-full hover:bg-surface-hover"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Edit Context */}
        {editingMessage && (
          <div className="flex items-center justify-between bg-surface border border-border p-3 mb-2 rounded-2xl shadow-lg animate-in slide-in-from-bottom-2 fade-in">
            <div className="overflow-hidden flex items-center gap-3 pl-2">
              <Pencil size={18} className="text-primary" />
              <span className="text-sm font-bold text-text-main">
                Editing Message
              </span>
            </div>
            <button
              onClick={() => {
                setEditingMessage(null);
                setInputValue("");
              }}
              className="p-2 text-secondary hover:text-text-main rounded-full hover:bg-surface-hover"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Canned Responses Menu */}
        {showCannedMenu && (
          <div className="absolute bottom-24 left-6 w-80 md:w-96 bg-surface border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 canned-menu">
            <div className="p-3 bg-surface-hover border-b border-border flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                Canned Responses
              </span>
            </div>
            <div
              ref={cannedListRef}
              className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1"
            >
              {filteredCannedResponses.length > 0 ? (
                filteredCannedResponses.map((item, index) => (
                  <button
                    key={item.command}
                    onClick={() => selectCannedResponse(item)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 ${index === selectedCannedIndex
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-surface-hover border border-transparent"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-sm font-bold ${index === selectedCannedIndex ? "text-primary" : "text-text-main"}`}
                      >
                        {item.command}
                      </span>
                      <span className="text-[10px] text-secondary border border-border px-1.5 rounded">
                        {item.description}
                      </span>
                    </div>
                    <p className="text-xs text-secondary truncate">
                      {item.text}
                    </p>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-secondary text-sm">
                  No canned responses found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Bar */}
        {(user?.role == UserRole.USER ||
          user?.role == UserRole.BRANCH ||
          (user?.role == UserRole.ADMIN && chat.isGroup) ||
          (user?.role == UserRole.MASTER && chat.isGroup)) && (
            <div className="flex items-end gap-2 p-1.5 bg-surface rounded-4xl shadow-xl border border-border relative">
              {showEmojiPicker && (
                <div
                  className={`absolute left-0 z-50 ${replyingTo || editingMessage ? "bottom-20" : "bottom-16"}`}
                >
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                      setShowEmojiPicker(false);
                      setActiveReactionMessageId(null);
                    }}
                  ></div>
                  <EmojiPicker
                    onSelect={handleEmojiSelect}
                    onClose={() => {
                      setShowEmojiPicker(false);
                      setActiveReactionMessageId(null);
                    }}
                  />
                </div>
              )}

              {/* Attachments & Emoji */}
              <div className="flex items-center pl-1 pb-1">
                <button
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setActiveReactionMessageId(null);
                    setShowAttachMenu(false);
                  }}
                  className={`p-2.5 rounded-full transition-colors ${showEmojiPicker && !activeReactionMessageId ? "text-primary bg-primary/10" : "text-secondary hover:text-text-main hover:bg-surface-hover"}`}
                >
                  <Smile size={24} />
                </button>

                {!editingMessage && (
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowAttachMenu(!showAttachMenu);
                        setShowEmojiPicker(false);
                      }}
                      className={`p-2.5 transition-colors rounded-full attach-menu-trigger ${showAttachMenu ? "text-primary bg-primary/10 rotate-45" : "text-secondary hover:text-text-main hover:bg-surface-hover"}`}
                    >
                      <Plus
                        size={24}
                        className={`transition-transform duration-200 ${showAttachMenu ? "rotate-45" : ""}`}
                      />
                    </button>

                    {showAttachMenu && (
                      <div className="absolute bottom-16 left-0 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col w-56 animate-in fade-in slide-in-from-bottom-2 z-50 attach-menu p-1">
                        <button
                          onClick={() => setShowCamera(true)}
                          className="flex items-center gap-3 p-3 hover:bg-surface-hover rounded-xl text-left transition-colors"
                        >
                          <div className="p-2 bg-linear-to-br from-pink-500 to-rose-500 rounded-full text-white">
                            <Camera size={18} />
                          </div>
                          <span className="text-text-main font-medium text-sm">
                            Camera
                          </span>
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-3 p-3 hover:bg-surface-hover rounded-xl text-left transition-colors"
                        >
                          <div className="p-2 bg-linear-to-br from-purple-500 to-indigo-500 rounded-full text-white">
                            <Image size={18} />
                          </div>
                          <span className="text-text-main font-medium text-sm">
                            Photos & Videos
                          </span>
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-3 p-3 hover:bg-surface-hover rounded-xl text-left transition-colors"
                        >
                          <div className="p-2 bg-linear-to-br from-indigo-500 to-blue-500 rounded-full text-white">
                            <FileText size={18} />
                          </div>
                          <span className="text-text-main font-medium text-sm">
                            Document
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                />
              </div>
              {pendingFile && (
    <div className="flex items-center gap-3 px-2 py-2 bg-black/5 dark:bg-white/5 rounded-xl">
      
      {/* Thumbnail */}
      {pendingFile.type.startsWith("image/") ? (
        <img
          src={URL.createObjectURL(pendingFile)}
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-surface-hover flex items-center justify-center">
          <FileText size={18} />
        </div>
      )}

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {pendingFile.name}
        </p>
        <p className="text-xs text-secondary">
          {(pendingFile.size / 1024).toFixed(1)} KB
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => setPendingFile(null)}
        className="p-1.5 hover:bg-surface-hover rounded-full"
      >
        <X size={16} />
      </button>
    </div>
  )}

              {/* Text Input */}
              <div className="flex-1 min-w-0 relative min-h-12.5">
                {" "}
                {/* Changed from min-h-12.5 flex items-center */}
                {isRecording ? (
                  <div className="absolute inset-0 flex items-center px-0 z-20 animate-pulse text-red-500 gap-2">
                    <div className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-red-500 animate-ping"></div>
                    <span className="font-mono font-bold text-sm md:text-lg">
                      {formatTime(recordingDuration)}
                    </span>
                    <span className="text-xs md:text-sm font-medium">rec...</span>
                    <div className="flex-1"></div>
                    <button
                      onClick={() => stopRecording(true)}
                      className="p-2 hover:bg-red-500/50 bg-red-500/80 text-text-main rounded-full flex items-center gap-1 text-xs uppercase font-bold tracking-wider transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full relative">
                    {/* Hidden measuring div - exact same styling as textarea */}
                    <div
                      className="invisible whitespace-pre-wrap wrap-break-word max-h-30 overflow-y-auto px-3 py-3 text-base"
                      style={{
                        minHeight: "44px",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {inputValue || "placeholder"}
                    </div>

                    {/* Actual textarea */}
                    <textarea
                      ref={inputRef}
                      placeholder={
                        replyingTo
                          ? "Reply..."
                          : editingMessage
                            ? "Edit message..."
                            : "Message"
                      }
                      className="absolute inset-0 w-full h-full bg-transparent text-text-main px-3 py-3 focus:outline-none placeholder-secondary/70 text-base resize-none overflow-y-auto"
                      style={{
                        minHeight: "44px",
                        maxHeight: "120px",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      disabled={sendMessageMutation.isPending}
                      rows={1}
                      wrap="soft"
                      inputMode="text"
                      // enterKeyHint="send"
                      enterKeyHint="enter"
                      autoCapitalize="sentences"
                      autoCorrect="on"
                      spellCheck="true"
                    />

                    {/* Command hint - absolutely positioned */}
                    {!inputValue &&
                      !isRecording &&
                      !sendMessageMutation.isPending && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 flex items-center gap-1 text-secondary">
                          <Command size={14} className="hidden sm:block" />
                          <span className="text-xs hidden sm:inline">/</span>
                          <span className="text-xs sm:hidden">/</span>{" "}
                          {/* Mobile fallback */}
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Send Button */}
              <div className="pb-1 pr-1">
                {inputValue.trim() || isRecording || pendingFile? (
                  <button
                    onClick={
                      isRecording
                        ? () => stopRecording(false)
                        : editingMessage
                          ? handleEndEdit
                          : handleTextSend
                    }
                    disabled={sendMessageMutation.isPending}
                    className={`w-12 h-12 rounded-full transition-all shadow-lg text-white transform active:scale-95 flex items-center justify-center ${editingMessage || sendMessageMutation.isPending ? "bg-primary hover:bg-primary/90" : "bg-primary hover:bg-primary/90"} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {sendMessageMutation.isPending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : editingMessage ? (
                      <Check size={24} />
                    ) : isRecording ? (
                      <Send size={24} />
                    ) : (
                      <Send size={24} />
                    )}
                  </button>
                ) : (
                  !editingMessage &&
                  !pendingFile && (
                    <button
                      onClick={startRecording}
                      disabled={sendMessageMutation.isPending}
                      className="w-12 h-12 rounded-full transition-all bg-surface-hover text-text-main hover:bg-secondary/20 flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Mic size={24} />
                    </button>
                  )
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
