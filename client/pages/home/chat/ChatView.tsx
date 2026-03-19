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
  Clock3,
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
  Play,
  Pause,
  Ear,
  Speaker,
  LucideSpeaker,
  MonitorSpeakerIcon,
  Volume2,
  Sticker,
} from "lucide-react";
import {
  Chat,
  Message,
  MessageAttachment,
  UserStatus,
  CannedResponse,
  MessageType,
  User,
  UserRole,
} from "../../../types";
import { Avatar } from "../../../components/ui/Avatar";
import { EmojiPicker } from "../../../components/ui/EmojiPicker";
import { StickerPicker, getStickerUrl } from "../../../components/ui/StickerPicker";
import { CameraModal } from "../../../components/modals/CameraModal";
import { ForwardMessageModal } from "../../../components/modals/ForwardMessageModal";
import { MediaComposerModal } from "../../../components/modals/MediaComposerModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChatService,
  type MediaSendProgress,
  type MediaSendReport,
} from "@/services/chat.service";
import AudioMessage from "@/components/ui/AudioMessage";
import { CurrentUser } from "@/constants";
import TextMessage from "@/components/ui/TextMessage";
import { MediaUtils } from "@/utils/media.utils";
import {
  formatLastMessageTime,
  formatMessageTime,
} from "@/utils/time_formatter.utils";
import { getMessageStatus } from "@/utils/messageStatus";
import { MessageStatusIcon } from "@/components/ui/MessageStatusIcon";
import { useChatMessages } from "@/utils/useChatMessages";

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

const DEFAULT_MEDIA_CAPTIONS = new Set(["photo", "photos", "file", "files"]);
const MAX_MEDIA_UPLOAD_BYTES = 10 * 1024 * 1024;

const isDefaultMediaCaption = (content?: string) =>
  !content || DEFAULT_MEDIA_CAPTIONS.has(content.trim().toLowerCase());

const toNumericSize = (size?: string | number) => {
  if (typeof size === "number") return size;
  if (typeof size === "string") {
    const parsed = Number(size);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const getMessageAttachments = (msg: Message): MessageAttachment[] => {
  if (Array.isArray(msg.attachments) && msg.attachments.length > 0) {
    return msg.attachments;
  }

  if (!msg.fileUrl) return [];

  return [
    {
      id: `${msg.id}-legacy`,
      fileKey: "",
      fileUrl: msg.fileUrl,
      fileName: msg.fileName || "Attachment",
      mimeType: msg.mimeType || "application/octet-stream",
      fileSize: toNumericSize(msg.fileSize),
      order: 0,
    },
  ];
};

const isImageAttachment = (attachment: MessageAttachment) =>
  attachment.mimeType?.startsWith("image/");

// Helper to render message content
const renderMessageContent = (
  msg: Message,
  isMe: boolean,
  chat: Chat,
  playingAudioId: string | null,
  toggleAudio: (messageId: string, url: string) => void,
  searchQuery: string,
  audioRefs: React.MutableRefObject<{ [key: string]: HTMLAudioElement }>,
  onImagePreview?: (url: string, fileName?: string) => void,
  onStatusClick?: (statusId: string) => void,
  isPending?: boolean,
) => {
  // Determine if this is a group chat
  const isGroupChat = chat?.isGroup || false;

  // Get sender name
  const senderName = msg.sender?.name || "Unknown";
  const attachments = getMessageAttachments(msg);
  const hasAttachments = attachments.length > 0;
  const attachmentsToRender = hasAttachments
    ? attachments
    : getMessageAttachments(msg);

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
          {attachments.map((attachment) => (
            <img
              key={attachment.id}
              src={attachment.fileUrl}
              alt={attachment.fileName}
              className="rounded-xl max-w-sm max-h-80 object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onImagePreview?.(attachment.fileUrl, attachment.fileName);
              }}
            />
          ))}

          {!isDefaultMediaCaption(msg.content) && (
            <p className="px-3 pt-2 pb-1 text-sm">
              <HighlightedText text={msg.content} highlight={searchQuery} />
            </p>
          )}
        </div>
      )}

      {msg.type === MessageType.FILE && (
        <div className="p-1 m-1 rounded-xl border border-border/50 bg-black/5 dark:bg-black/20">
          {attachmentsToRender.length === 0 ? (
            <div className="px-3 py-2 text-xs text-secondary">
              Attachment unavailable
            </div>
          ) : (
            (() => {
              const mediaAttachments = attachmentsToRender.filter(isImageAttachment);
              const documentAttachments = attachmentsToRender.filter(
                (attachment) => !isImageAttachment(attachment),
              );

              return (
                <>
                  {mediaAttachments.length > 0 && (
                    <div className="px-2 pt-2">
                      <div
                        className={`grid gap-2 ${mediaAttachments.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
                      >
                        {mediaAttachments.map((attachment) => (
                          <img
                            key={attachment.id}
                            src={attachment.fileUrl}
                            alt={attachment.fileName}
                            className={`rounded-xl w-full object-cover cursor-pointer hover:opacity-95 transition-opacity ${mediaAttachments.length > 1
                              ? "h-40"
                              : "max-w-sm max-h-80"
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onImagePreview?.(
                                attachment.fileUrl,
                                attachment.fileName,
                              );
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {mediaAttachments.length > 0 &&
                    documentAttachments.length > 0 && (
                      <div className="mx-3 my-2 h-px bg-border/40" />
                    )}

                  {documentAttachments.length > 0 &&
                    documentAttachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="p-3 flex items-center gap-3 border-b border-border/40 last:border-b-0"
                      >
                        <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-primary shadow-sm">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              <HighlightedText
                                text={attachment.fileName || "Document"}
                                highlight={searchQuery}
                              />
                            </p>
                            {isGroupChat && !isMe && (
                              <span className="text-[10px] text-secondary whitespace-nowrap">
                                | {senderName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs opacity-70">
                            {formatBytes(attachment.fileSize || 0)} |{" "}
                            {attachment.fileName
                              ?.split(".")
                              .pop()
                              ?.toUpperCase() || "FILE"}
                          </p>
                        </div>
                        <a
                          href={attachment.fileUrl}
                          download={attachment.fileName}
                          className="p-2 hover:bg-surface-hover rounded-full transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    ))}
                </>
              );
            })()
          )}
          {!isDefaultMediaCaption(msg.content) && (
            <p className="px-3 pb-2 text-sm">
              <HighlightedText text={msg.content} highlight={searchQuery} />
            </p>
          )}
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

      {msg.type === MessageType.STICKER && (
        <div className="p-2 relative">
          <img
            src={getStickerUrl(msg.content)}
            alt="Sticker"
            className={`w-40 h-40 object-contain drop-shadow-md transition-all duration-300 ${isPending
              ? "opacity-60 scale-95"
              : "hover:scale-105"
              }`}
            loading="lazy"
          />
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
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
          title="Bold (Cmd+B)"
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
          title="Italic (Cmd+I)"
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
          title="Strikethrough (Cmd+Shift+X)"
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
          title="Code (Cmd+E)"
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
                    Cmd+B
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
      <span className="text-secondary">{"->"}</span>
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

const buildMediaSkipAlertMessage = (
  report: MediaSendReport | undefined,
  prefix = "Message sent.",
) => {
  if (!report) return "";

  const entries = [...report.skippedFiles, ...report.failedFiles];
  if (entries.length === 0) return "";

  return `${prefix}\nUploaded: ${report.uploaded}/${report.totalSelected}\nSkipped: ${entries.length}\n\n${entries
    .map((entry, index) => `${index + 1}. ${entry}`)
    .join("\n")}`;
};

const normalizePendingStage = (stage?: string) =>
  (stage || "")
    .replace(/\(\s*\d+\s*files?\s*\)/gi, "")
    .replace(/\(\s*\d+\s*\/\s*\d+\s*\)/g, "")
    .trim();

const getPendingStatusLabel = (msg: Message) => {
  const rawStage = normalizePendingStage(msg.uploadStage);
  const stage = rawStage.toLowerCase();

  if (msg.type === MessageType.AUDIO) {
    if (stage.includes("sending") || stage.includes("validating")) {
      return "Sending voice note...";
    }
    if (
      stage.includes("sending") ||
      stage.includes("requesting") ||
      stage.includes("ticket")
    ) {
      return "Sending";
    }
    if (stage.includes("upload") || stage.includes("sending")) {
      return "Sending voice note...";
    }
    if (stage.includes("finaliz")) {
      return "Finalizing voice note...";
    }
    return "Sending voice note...";
  }

  if (stage.includes("validating")) return "Checking files...";
  if (
    stage.includes("preparing") ||
    stage.includes("requesting") ||
    stage.includes("ticket")
  ) {
    return "Preparing upload...";
  }
  if (stage.includes("upload")) return "Uploading...";
  if (stage.includes("finaliz")) return "Finalizing...";
  if (stage.includes("sending")) return "Sending...";
  return rawStage || "Sending...";
};

// Helper to format time
const formatTime = (seconds: number) => {
  if (!seconds || !isFinite(seconds) || isNaN(seconds)) {
    return "0:00";
  }
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
  const [showStickerPicker, setShowStickerPicker] = useState(false);
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
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(
    null,
  );

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    fileName?: string;
  } | null>(null);

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
  const [isPaused, setIsPaused] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const isScrolledToBottomRef = useRef(true);
  const prevMessagesLengthRef = useRef(0);
  const recordingDurationRef = useRef(0);
  const pendingAttachmentUrlsRef = useRef<Record<string, string[]>>({});

  const cleanupPendingAttachmentUrls = useCallback(
    (pendingId: string, immediate = false) => {
      const urls = pendingAttachmentUrlsRef.current[pendingId];
      if (!urls || urls.length === 0) return;

      const revoke = () => {
        urls.forEach((url) => URL.revokeObjectURL(url));
        delete pendingAttachmentUrlsRef.current[pendingId];
      };

      if (immediate) {
        revoke();
        return;
      }

      // Keep blob previews briefly so hydrated messages don't flash "Attachment unavailable".
      setTimeout(revoke, 15000);
    },
    [],
  );

  const cleanupAllPendingAttachmentUrls = useCallback(() => {
    Object.values(pendingAttachmentUrlsRef.current)
      .flat()
      .forEach((url) => URL.revokeObjectURL(url));
    pendingAttachmentUrlsRef.current = {};
  }, []);

  const removePendingMessageById = useCallback(
    (pendingId?: string) => {
      if (!pendingId) return false;
      let removed = false;

      const pendingEntries = queryClient.getQueriesData<Message[]>({
        queryKey: ["pending-messages"],
      });

      pendingEntries.forEach(([cacheKey, cacheValue]) => {
        if (!Array.isArray(cacheValue)) return;
        if (!cacheValue.some((msg) => msg.id === pendingId)) return;

        removed = true;
        queryClient.setQueryData(
          cacheKey,
          cacheValue.filter((msg) => msg.id !== pendingId),
        );
      });

      return removed;
    },
    [queryClient],
  );

  useEffect(() => {
    return () => {
      cleanupAllPendingAttachmentUrls();
    };
  }, [cleanupAllPendingAttachmentUrls]);

  // Join the Socket.IO chat room when the user opens this chat
  useEffect(() => {
    const currentChatId = chat?.id;
    if (!currentChatId) {
      console.log(`[ChatView] No chat ID available, skipping join_chat`);
      return;
    }

    console.log(`[ChatView] Attempting to join chat room: ${currentChatId}`);
    let cleanup = () => { };

    import("@/utils/socket")
      .then(({ getSocket }) => {
        const s = getSocket();
        if (!s) {
          console.warn(`[ChatView] Socket not available for chat: ${currentChatId}`);
          return;
        }

        const doJoin = () => {
          console.log(`[ChatView] ✅ join_chat emitted for: ${currentChatId}`);
          s.emit("join_chat", currentChatId);
        };

        if (s.connected) {
          doJoin();
        }

        s.on("connect", doJoin);

        cleanup = () => {
          console.log(`[ChatView] Cleaning up socket for chat: ${currentChatId}`);
          s.off("connect", doJoin);
          s.emit("leave_chat", currentChatId);
        };
      })
      .catch((err) =>
        console.error("[ChatView] Failed to load socket for join_chat", err)
      );

    return () => cleanup();
  }, [chat?.id]);

  // Polling query for messages
  const {
    messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
    resetCursor,
  } = useChatMessages(chat);

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      content,
      type,
      fileData,
      replyToId,
      onProgress,
      mediaOptions,
    }: {
      content: string;
      type: MessageType;
      fileData?: any;
      replyToId?: string;
      onProgress?: (progress: MediaSendProgress) => void;
      mediaOptions?: { isMuted?: boolean };
    }) => {
      const rawFiles = fileData?.files ?? fileData?.file;
      const normalizedFiles = Array.isArray(rawFiles)
        ? rawFiles
        : rawFiles
          ? [rawFiles]
          : [];
      const oversizedFiles = normalizedFiles.filter(
        (file) => file.size > MAX_MEDIA_UPLOAD_BYTES,
      );
      const validSizeFiles =
        oversizedFiles.length > 0
          ? normalizedFiles.filter((file) => file.size <= MAX_MEDIA_UPLOAD_BYTES)
          : normalizedFiles;

      if (normalizedFiles.length > 0 && validSizeFiles.length === 0) {
        const details = oversizedFiles
          .map(
            (file, index) =>
              `${index + 1}. ${file.name} - ${(file.size / (1024 * 1024)).toFixed(1)} MB (max 10.0 MB)`,
          )
          .join("\n");

        throw new Error(`No valid media files to upload.\n${details}`);
      }

      const uploadFileCount = validSizeFiles.length;
      const pendingMessageId = `pending-${Date.now()}`;
      const previewUrls: string[] = [];
      const pendingAttachments: MessageAttachment[] = validSizeFiles.map(
        (file, index) => {
          const localUrl = URL.createObjectURL(file);
          previewUrls.push(localUrl);
          return {
            id: `${pendingMessageId}-${index}`,
            fileKey: "",
            fileUrl: localUrl,
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            fileSize: file.size,
            order: index,
          };
        },
      );

      if (previewUrls.length > 0) {
        pendingAttachmentUrlsRef.current[pendingMessageId] = previewUrls;
      }

      const updatePendingProgress = (progress: MediaSendProgress) => {
        queryClient.setQueryData(
          ["pending-messages", chat?.id],
          (old: Message[] = []) =>
            old.map((msg) =>
              msg.id === pendingMessageId
                ? {
                  ...msg,
                  uploadStage: progress.message,
                  uploadProgress: progress.progressPercent,
                  uploadCompletedFiles: progress.completedFiles,
                  uploadTotalFiles: progress.totalFiles,
                  uploadFailedFiles: progress.failedFiles,
                }
                : msg,
            ),
        );
        onProgress?.(progress);
      };

      // Create pending message
      const pendingMessage: Message = {
        id: pendingMessageId,
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
        uploadStage:
          uploadFileCount > 0 ? "Preparing media..." : "Sending message...",
        uploadProgress: uploadFileCount > 0 ? 0 : 90,
        uploadCompletedFiles: 0,
        uploadTotalFiles: uploadFileCount,
        uploadFailedFiles: 0,
        attachments: pendingAttachments,
        fileUrl: pendingAttachments[0]?.fileUrl,
        fileName: pendingAttachments[0]?.fileName,
        mimeType: pendingAttachments[0]?.mimeType,
        fileSize:
          pendingAttachments[0]?.fileSize != null
            ? String(pendingAttachments[0].fileSize)
            : undefined,
        ...fileData,
        replyToId,
      };

      // Add to pending cache
      queryClient.setQueryData(
        ["pending-messages", chat?.id],
        (old: Message[] = []) => [...old, pendingMessage],
      );

      let filesToUpload: File[] | File | undefined = validSizeFiles;

      if (mediaOptions?.isMuted && validSizeFiles.length > 0) {
        updatePendingProgress({
          stage: "validating",
          message: "Processing media...",
          totalFiles: validSizeFiles.length,
          completedFiles: 0,
          successfulFiles: 0,
          failedFiles: 0,
          progressPercent: 4,
        });

        const mutedFiles = await Promise.all(
          validSizeFiles.map(async (file) => {
            if (file.type.startsWith("video/")) {
              return MediaUtils.muteVideo(file);
            }
            if (file.type.startsWith("audio/")) {
              return MediaUtils.muteAudio(file);
            }
            return file;
          }),
        );

        filesToUpload =
          mutedFiles.length > 1
            ? mutedFiles
            : mutedFiles.length === 1
              ? mutedFiles[0]
              : undefined;
      } else {
        filesToUpload =
          validSizeFiles.length > 1
            ? validSizeFiles
            : validSizeFiles.length === 1
              ? validSizeFiles[0]
              : undefined;
      }

      try {
        const result = await ChatService.sendMessage(
          {
            chatId: chat?.id || "",
            content,
            type,
            ...fileData,
            replyToId,
          },
          filesToUpload,
          {
            onProgress: updatePendingProgress,
          },
        );
        return { pendingMessageId, result };
      } catch (error) {
        if (error && typeof error === "object") {
          (error as { pendingMessageId?: string }).pendingMessageId =
            pendingMessageId;
        }
        throw error;
      }
    },
    onSuccess: (response, variables) => {
      const pendingMessageId = response?.pendingMessageId;
      const sendResult = response?.result;
      const newMessages: Message[] = sendResult?.messages ?? [];
      const mediaReport = sendResult?.mediaReport;
      let matchedPendingMessage: Message | undefined;

      if (!newMessages) {
        console.warn("Message response missing");
        return;
      }

      // Remove pending message safely
      queryClient.setQueryData(
        ["pending-messages", chat?.id],
        (old: Message[] = []) => {
          if (pendingMessageId) {
            matchedPendingMessage = old.find((msg) => msg.id.startsWith("pending-"));
            return old.filter((msg) => msg.id !== pendingMessageId);
          }

          const pendingIndex = old.findIndex(
            (msg) =>
              msg.id.startsWith("pending-") &&
              msg.content === variables.content &&
              msg.type === variables.type,
          );

          if (pendingIndex === -1) {
            return old.filter((msg) => msg.id !== newMessages[0].id);
          }

          matchedPendingMessage = old[pendingIndex];
          return old.filter((_, index) => index !== pendingIndex);
        },
      );

      queryClient.setQueryData(
        ["chat-messages", chat?.id],
        (old: Message[] = []) => {
          const existingIds = new Set(old.map((m) => m.id));

          const merged = [
            ...old,
            ...newMessages.filter((msg) => !existingIds.has(msg.id)),
          ];

          return merged.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
      );

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chat-messages", chat?.id] });

      if (pendingMessageId) {
        cleanupPendingAttachmentUrls(pendingMessageId);
      } else if (matchedPendingMessage?.id) {
        cleanupPendingAttachmentUrls(matchedPendingMessage.id);
      }

      if (mediaReport && !variables.onProgress) {
        const skipAlert = buildMediaSkipAlertMessage(
          mediaReport,
          "Message sent with partial media upload.",
        );
        if (skipAlert) {
          alert(skipAlert);
        }
      }
    },
    onError: (error, variables) => {
      console.error("Failed to send message:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again.";
      const pendingIdFromError =
        error && typeof error === "object" && "pendingMessageId" in error
          ? (error as { pendingMessageId?: string }).pendingMessageId
          : undefined;
      if (!variables.onProgress) {
        alert(errorMessage);
      }

      // Remove failed pending message
      let failedPendingId: string | undefined = pendingIdFromError;
      const removedById = removePendingMessageById(failedPendingId);

      if (!removedById) {
        queryClient.setQueryData(
          ["pending-messages", chat?.id],
          (old: Message[] = []) => {
            const requestedFiles = Array.isArray(variables.fileData?.files)
              ? variables.fileData.files
              : variables.fileData?.file
                ? [variables.fileData.file]
                : [];

            const requestedNames = requestedFiles
              .map((file: File) => file.name)
              .sort();

            const index = old.findIndex((msg) => {
              if (!msg.isPending || msg.type !== variables.type) return false;

              const msgNames = (msg.attachments || [])
                .map((attachment) => attachment.fileName)
                .sort();

              if (requestedNames.length > 0) {
                if (requestedNames.length !== msgNames.length) return false;
                return requestedNames.every((name: string, idx: number) => name === msgNames[idx]);
              }

              return msg.content === variables.content;
            });

            if (index === -1) return old;

            failedPendingId = old[index]?.id;
            return old.filter((_, idx) => idx !== index);
          },
        );
      }

      if (failedPendingId) {
        cleanupPendingAttachmentUrls(failedPendingId, true);
      }
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
  // Scroll utilities
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

  const markAsRead = useCallback(async () => {
    if (!chat?.id) return;

    await ChatService.markAsRead(chat.id);
    queryClient.invalidateQueries({ queryKey: ["chats"] });
  }, [chat?.id, queryClient]);

  // Effects
  useEffect(() => {
    if (!chat?.id) return;
    // Reset all states
    resetCursor();
    queryClient.invalidateQueries({ queryKey: ["chat-messages", chat.id] }); // Ensure we fetch fresh messages for the new chat
    setInputValue("");
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    setShowStickerPicker(false);
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
    setPreviewImage(null);

    // Stop recording if active
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    // Clear pending messages
    cleanupAllPendingAttachmentUrls();
    queryClient.setQueryData(["pending-messages", chat.id], []);

    // Mark as read
    if (user?.role === UserRole.USER || user?.role === UserRole.BRANCH) {
      setTimeout(() => {
        markAsRead();
      }, 0);
    }

    // Reset message length tracking for the new chat
    prevMessagesLengthRef.current = 0;

    // Reset scroll button
    setShowScrollButton(false);
  },
    [chat?.id, cleanupAllPendingAttachmentUrls, markAsRead, queryClient, resetCursor, user?.role,]);



  // Track new messages
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      const newMessages = messages.slice(prevMessagesLengthRef.current);
      const hasIncoming = newMessages.some((m) => m.senderId !== user?.id);



      // If we have incoming messages and we are "active" (viewing this chat), mark them read
      if (
        hasIncoming &&
        (user?.role === UserRole.USER || user?.role === UserRole.BRANCH)
      ) {
        markAsRead();
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, user, markAsRead]);



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
    if (isRecording && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => {
          recordingDurationRef.current = prev + 1;
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording, isPaused]);

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
      const hasFiles =
        !!fileData?.file ||
        (Array.isArray(fileData?.files) && fileData.files.length > 0);

      if (
        !chat ||
        (!content.trim() && type === MessageType.TEXT && !hasFiles)
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

    // CASE 1: Media is selected (image/file)
    if (pendingFiles.length > 0) {
      const isImage = pendingFiles.every((f) => f.type.startsWith("image"));
      handleSendMessage(
        isImage ? MessageType.IMAGE : MessageType.FILE,
        inputValue || (isImage ? "Photos" : "Files"),
        {
          files: pendingFiles,
        },
      );
      // Clear after send
      setPendingFiles([]);
      return;
    }
    if (!inputValue.trim()) return;
    handleSendMessage(MessageType.TEXT, inputValue);
  }, [chat, pendingFiles, inputValue, handleSendMessage]);

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
        const files = Array.from(e.target.files);
        setPendingFiles((prev) => {
          const nextFiles = showMediaModal ? [...prev, ...files] : files;
          if (nextFiles.length > 10) {
            alert("Maximum 10 files allowed");
            return prev;
          }
          return nextFiles;
        });
        setShowMediaModal(true);
        setShowAttachMenu(false);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [chat, showMediaModal],
  );

  const handleCameraCapture = useCallback(
    async (imageSrc: string) => {
      if (!chat) return;

      try {
        const res = await fetch(imageSrc);
        const blob = await res.blob();

        const file = new File(
          [blob],
          `camera_capture_${Date.now()}.jpg`,
          { type: "image/jpeg" }
        );

        setPendingFiles((prev) => {
          const updated = [...prev, file];

          if (updated.length > 10) {
            alert("Maximum 10 media files allowed");
            return prev;
          }

          return updated;
        });

        setShowMediaModal(true);
        setShowAttachMenu(false);

      } catch (error) {
        console.error("Error processing camera capture:", error);
        alert("Failed to process image. Please try again.");
      }
    },
    [chat]
  );

  const startRecording = async () => {
    try {
      setRecordingDuration(0);
      setIsPaused(false);
      recordingDurationRef.current = 0;
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
        let finalDuration = recordingDurationRef.current;
        // Ensure duration is a valid number
        if (!isFinite(finalDuration) || finalDuration <= 0) {
          finalDuration = 0;
        }
        const durationStr = formatTime(finalDuration);
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
              duration: recordingDurationRef.current,
              mimeType: "audio/webm",
            },
            replyToId: replyingTo?.id,
          });
          setReplyingTo(null);
        } catch (error) {
          console.error("Error sending audio message:", error);
          alert("Failed to send voice message. Please try again.");
        }

        // Stop mic stream
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start(200);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const playPreviewAudio = async () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder) {
      console.log("No recorder");
      return;
    }

    if (audioChunksRef.current.length === 0) {
      console.log("No audio chunks yet");
      return;
    }

    try {
      // Force latest chunk flush
      if (recorder.state === "paused" || recorder.state === "recording") {
        recorder.requestData();
      }

      // Wait for chunk to be pushed into array
      await new Promise((res) => setTimeout(res, 100));

      if (audioChunksRef.current.length === 0) {
        console.log("Still no chunks after requestData");
        return;
      }

      const previewBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm;codecs=opus",
      });

      const previewUrl = URL.createObjectURL(previewBlob);

      // Stop previous preview if playing
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }

      const audio = new Audio(previewUrl);
      previewAudioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(previewUrl);
      };

      await audio.play();
    } catch (err) {
      console.error("Preview playback failed:", err);
    }
  };

  const stopRecording = (cancel = false) => {
    if (!mediaRecorderRef.current || !isRecording) return;
    console.log(
      "stopRecording called, current state:",
      mediaRecorderRef.current.state,
    ); // debug
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
      setIsPaused(false);
    }
  };

  const togglePauseRecording = () => {
    if (!mediaRecorderRef.current) return;

    if (mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    } else if (mediaRecorderRef.current.state === "paused") {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      }
      mediaRecorderRef.current.resume();
      setIsPaused(false);
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
    const isEditableUnder5Minutes = Date.now() - createdAt <= 15 * 60 * 1000;
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
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden z-100">
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

      {previewImage && (
        <div
          className="fixed inset-0 z-90 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage(null);
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60"
            aria-label="Close image preview"
          >
            <X size={20} />
          </button>
          <img
            src={previewImage.url}
            alt={previewImage.fileName || "Image preview"}
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Media Composer Modal */}
      {showMediaModal && (
        <MediaComposerModal
          files={pendingFiles}
          processing={false}
          onClose={() => {
            setShowMediaModal(false);
            setPendingFiles([]);
          }}
          onRemoveFile={(index: number) => {
            setPendingFiles((prev) => {
              const next = prev.filter((_, i) => i !== index);
              if (next.length === 0) {
                setShowMediaModal(false);
              }
              return next;
            });
          }}
          onAddMore={() => fileInputRef.current?.click()}
          onSend={async (options?: { isMuted?: boolean; caption?: string }) => {
            if (pendingFiles.length === 0) return;

            // 1. Close the modal immediately — WhatsApp-style
            const filesToSend = [...pendingFiles];
            const capturedReplyToId = replyingTo?.id;
            setShowMediaModal(false);
            setPendingFiles([]);
            setReplyingTo(null);

            // 2. Process files asynchronously in the background
            try {
              let processedFiles = filesToSend;

              if (options?.isMuted) {
                processedFiles = await Promise.all(
                  processedFiles.map(async (file) => {
                    if (file.type.startsWith("video/")) {
                      return await MediaUtils.muteVideo(file);
                    }
                    if (file.type.startsWith("audio/")) {
                      return await MediaUtils.muteAudio(file);
                    }
                    return file;
                  }),
                );
              }

              processedFiles = await Promise.all(
                processedFiles.map(async (file) => {
                  if (file.type.startsWith("image/")) {
                    return MediaUtils.optimizeImageForUpload(file);
                  }
                  return file;
                }),
              );

              const isImage = processedFiles.every((f) => f.type.startsWith("image/"));

              // 3. Fire upload — pending bubble with progress is handled by sendMessageMutation
              const sendResult = await sendMessageMutation.mutateAsync({
                content: options?.caption || (isImage ? "Photos" : "Files"),
                type: isImage ? MessageType.IMAGE : MessageType.FILE,
                fileData: { files: processedFiles },
                replyToId: capturedReplyToId,
              });

              const report = sendResult?.result?.mediaReport;
              if (report) {
                const skipAlert = buildMediaSkipAlertMessage(
                  report,
                  "Media sent with some files skipped.",
                );
                if (skipAlert) alert(skipAlert);
              }
            } catch (error) {
              console.error("Error sending media:", error);
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Failed to send media. Please try again.";
              alert(errorMessage);
            }
          }}
        />
      )}

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
      <header className="h-18 px-4 lg:px-6 bg-surface/90 backdrop-blur-xl sticky lg:relative top-0 left-0 right-0 flex items-center justify-between border-b border-border/60 shadow-sm z-50 transition-all shrink-0">
        {isSearchOpen ? (
          <div className="flex items-center w-full gap-2 md:gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={closeSearch}
              className="p-2 text-secondary hover:text-text-main hover:bg-surface-hover rounded-full transition-colors shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 relative group min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary group-focus-within:text-primary transition-colors">
                <Search size={18} className="md:size-20" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search in conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-hover/50 text-text-main pl-9 md:pl-10 pr-9 md:pr-10 py-2 rounded-xl focus:outline-none border border-transparent focus:border-primary/30 focus:bg-surface transition-all font-medium text-sm md:text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-1 text-secondary hover:text-text-main rounded-full bg-black/5 dark:bg-white/10"
                >
                  <X size={14} className="md:size-12" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 border-l border-border pl-2 md:pl-3 shrink-0">
              <span className="text-xs font-mono font-medium text-secondary mr-1 md:mr-2 min-w-[3ch] text-center">
                {searchResults.length > 0
                  ? `${currentResultIndex + 1}/${searchResults.length}`
                  : "0"}
              </span>
              <button
                onClick={handlePrevMatch}
                disabled={searchResults.length === 0}
                className="p-1 md:p-1.5 hover:bg-surface-hover rounded-lg text-secondary hover:text-text-main disabled:opacity-30 transition-colors"
              >
                <ChevronUp size={16} className="md:size-18" />
              </button>
              <button
                onClick={handleNextMatch}
                disabled={searchResults.length === 0}
                className="p-1 md:p-1.5 hover:bg-surface-hover rounded-lg text-secondary hover:text-text-main disabled:opacity-30 transition-colors"
              >
                <ChevronDown size={16} className="md:size-18" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 md:gap-4 overflow-hidden flex-1 min-w-0">
              <button
                onClick={onBack}
                className="md:hidden p-2 -ml-2 text-secondary hover:text-text-main hover:bg-surface-hover rounded-full transition-colors shrink-0"
              >
                <ArrowLeft size={20} />
              </button>

              <div
                className="flex items-center gap-2 md:gap-3 cursor-pointer group min-w-0 flex-1"
                onClick={onToggleProfile}
              >
                <div className="relative shrink-0">
                  <Avatar
                    user={chat.isGroup ? undefined : otherUser!}
                    isGroup={chat.isGroup}
                    groupName={chat.isGroup ? chat.groupName : undefined}
                    size={window.innerWidth < 768 ? "sm" : "md"}
                    showStatus={!chat.isGroup}
                  />
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-text-main font-bold leading-tight text-sm md:text-lg truncate group-hover:text-primary transition-colors">
                    {chat.isGroup
                      ? chat.groupName || "Group"
                      : otherUser?.name || "Unknown"}
                  </span>
                  <span className="text-xs text-secondary truncate flex items-center gap-1 font-medium">
                    {chat.isGroup ? (
                      `${chat.members?.length || 0} members`
                    ) : otherUser?.status === UserStatus.ONLINE ? (
                      <span className="text-primary flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        Online
                      </span>
                    ) : (
                      <span className="opacity-80">
                        {formatLastMessageTime(otherUser?.lastSeen || "") ||
                          "last seen recently"}
                      </span>
                    )}
                  </span>
                </div>

                {/* Refresh Button - Hidden on mobile, visible on desktop */}
                <button
                  onClick={handleManualRefresh}
                  disabled={isLoadingMessages}
                  className="hidden md:block p-1.5 hover:bg-surface-hover rounded-full transition-colors text-secondary hover:text-primary shrink-0"
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



      {/* Messages Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto flex flex-col-reverse p-4 sm:p-6 gap-y-4 custom-scrollbar relative z-0"
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

            <div ref={messagesEndRef} />
            {[...messages].reverse().map((msg) => {
              const isMe = msg.sender?.id === user?.id;
              const isPending = msg.isPending;
              const pendingLabel = getPendingStatusLabel(msg);
              const pendingProgress =
                typeof msg.uploadProgress === "number"
                  ? Math.max(0, Math.min(100, msg.uploadProgress))
                  : 0;
              const pendingCounterLabel =
                typeof msg.uploadTotalFiles === "number" && msg.uploadTotalFiles > 1
                  ? `${msg.uploadCompletedFiles || 0}/${msg.uploadTotalFiles}`
                  : null;
              const repliedMsg = msg.replyToId
                ? messages.find((m) => m.id === msg.replyToId)
                : null;
              const isSelected = selectedMessageId === msg.id;
              const isDeleted = msg.isDeleted;
              const isSearchResult = searchResults.includes(msg.id);
              const createdAt = msg.createdAt
                ? new Date(msg.createdAt).getTime()
                : 0;
              const isEditableUnder5Minutes =
                Date.now() - createdAt <= 15 * 60 * 1000;

              return (
                <div
                  key={msg.id}
                  ref={(el) => {
                    messageRefs.current[msg.id] = el;
                  }}
                  className={`flex shrink ${isMe ? "justify-end" : "justify-start"} group mb-2 relative message-bubble transition-colors ${isSearchResult ? "z-10" : ""}`}
                >
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
                          msg.type === MessageType.TEXT &&
                          isEditableUnder5Minutes && (
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
                        ${isPending ? "ring-1 ring-primary/30" : ""}
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
                          (url: string, fileName?: string) =>
                            setPreviewImage({ url, fileName }),
                          onStatusClick,
                          isPending,
                        )
                      )}
                      {isPending && msg.type !== MessageType.STICKER && (
                        <div className="px-3 pb-2">
                          <div className="text-[11px] flex items-center justify-between gap-3 text-bubble-meta opacity-90">
                            <div className="flex items-center gap-2">
                              <div className="animate-pulse rounded-full h-2.5 w-2.5 bg-primary"></div>
                              <p className="text-text-main">{pendingLabel}</p>
                            </div>
                            {pendingCounterLabel && (
                              <span className="text-[11px] text-secondary font-medium">
                                {pendingCounterLabel}
                              </span>
                            )}
                          </div>
                          {pendingProgress > 0 && (
                            <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-200"
                                style={{ width: `${pendingProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
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
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {isMe && !isDeleted && (
                          <MessageStatusIcon
                            status={getMessageStatus(msg, chat, user!.id || "")}
                            size={14}
                          />
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
          </>
        )}
      </div>



      {/* Input Area */}
      <div className="bg-surface/50 backdrop-blur-sm p-2 relative z-20">
        {/* Reply Context */}
        {replyingTo && (
          <div className="flex items-center justify-between bg-surface border border-border p-3 mb-2 rounded-2xl shadow-lg animate-in slide-in-from-bottom-2 fade-in">
            <div className="overflow-hidden border-l-4 border-primary pl-3">
              <span className="text-xs text-primary font-bold block mb-0.5">
                Replying to{" "}
                {replyingTo.sender?.id === user?.id
                  ? "You"
                  : chat.members.find(
                    (m) => m.user.id === replyingTo.sender?.id
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
                        className={`font-mono text-sm font-bold ${index === selectedCannedIndex ? "text-primary" : "text-text-main"
                          }`}
                      >
                        {item.command}
                      </span>
                      <span className="text-[10px] text-secondary border border-border px-1.5 rounded">
                        {item.description}
                      </span>
                    </div>
                    <p className="text-xs text-secondary truncate">{item.text}</p>
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

        {/* Input Bar - Only show for authorized users */}
        {(user?.role === UserRole.USER ||
          user?.role === UserRole.BRANCH ||
          (user?.role === UserRole.ADMIN && chat.isGroup) ||
          (user?.role === UserRole.MASTER && chat.isGroup)) && (
            <div className="flex items-end gap-2 p-1.5 bg-surface rounded-4xl shadow-xl border border-border relative">
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div
                  className={`absolute left-0 z-50 ${replyingTo || editingMessage ? "bottom-20" : "bottom-16"
                    }`}
                >
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                      setShowEmojiPicker(false);
                      setActiveReactionMessageId(null);
                    }}
                  />
                  <EmojiPicker
                    onSelect={handleEmojiSelect}
                    onClose={() => {
                      setShowEmojiPicker(false);
                      setActiveReactionMessageId(null);
                    }}
                  />
                </div>
              )}

              {/* Sticker Picker */}
              {showStickerPicker && (
                <div
                  className={`absolute left-0 z-50 ${replyingTo || editingMessage ? "bottom-20" : "bottom-16"
                    }`}
                >
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowStickerPicker(false)}
                  />
                  <StickerPicker
                    onSelect={(stickerId) => {
                      handleSendMessage(MessageType.STICKER, stickerId);
                      setShowStickerPicker(false);
                    }}
                    onClose={() => setShowStickerPicker(false)}
                  />
                </div>
              )}

              {/* Action Buttons - Emoji, Sticker, Attach */}
              <div className="flex items-center pl-1 pb-1">
                {/* Emoji Button - Hides when typing */}
                <div
                  className="transition-all duration-300 ease-in-out overflow-hidden"
                  style={{
                    width: inputValue.trim() || isRecording ? 0 : "auto",
                    opacity: inputValue.trim() || isRecording ? 0 : 1,
                    marginRight: inputValue.trim() || isRecording ? 0 : "0px",
                  }}
                >
                  <button
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setActiveReactionMessageId(null);
                      setShowAttachMenu(false);
                      setShowStickerPicker(false);
                    }}
                    className={`p-2 rounded-full transition-colors ${showEmojiPicker && !activeReactionMessageId
                      ? "text-primary bg-primary/10"
                      : "text-secondary hover:text-text-main hover:bg-surface-hover"
                      }`}
                    aria-label="Open emoji picker"
                  >
                    <Smile size={24} />
                  </button>
                </div>

                {/* Sticker Button - Hides when typing */}
                <div
                  className="transition-all duration-300 ease-in-out overflow-hidden"
                  style={{
                    width: inputValue.trim() || isRecording ? 0 : "auto",
                    opacity: inputValue.trim() || isRecording ? 0 : 1,
                    marginRight: inputValue.trim() || isRecording ? 0 : "0px",
                  }}
                >
                  <button
                    onClick={() => {
                      setShowStickerPicker(!showStickerPicker);
                      setShowEmojiPicker(false);
                      setActiveReactionMessageId(null);
                      setShowAttachMenu(false);
                    }}
                    className={`p-2 rounded-full transition-colors ${showStickerPicker
                      ? "text-primary bg-primary/10"
                      : "text-secondary hover:text-text-main hover:bg-surface-hover"
                      }`}
                    aria-label="Open sticker picker"
                  >
                    <Sticker size={24} />
                  </button>
                </div>

                {/* Attach Button - Always visible */}
                {!editingMessage && (
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowAttachMenu(!showAttachMenu);
                        setShowEmojiPicker(false);
                        setShowStickerPicker(false);
                      }}
                      className={`p-2 transition-colors rounded-full attach-menu-trigger ${showAttachMenu
                        ? "text-primary bg-primary/10 rotate-45"
                        : "text-secondary hover:text-text-main hover:bg-surface-hover"
                        }`}
                      aria-label="Open attachment menu"
                    >
                      <Plus
                        size={24}
                        className={`transition-transform duration-200 ${showAttachMenu ? "rotate-45" : ""
                          }`}
                      />
                    </button>

                    {/* Attachment Menu */}
                    {showAttachMenu && (
                      <div className="absolute bottom-16 left-0 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col w-56 animate-in fade-in slide-in-from-bottom-2 z-50 attach-menu p-1">
                        <button
                          onClick={() => setShowCamera(true)}
                          className="flex items-center gap-3 p-3 hover:bg-surface-hover rounded-xl text-left transition-colors"
                        >
                          <div className="p-2 bg-linear-to-br from-pink-500 to-rose-500 rounded-full text-white">
                            <Camera size={18} />
                          </div>
                          <span className="text-text-main font-medium text-sm">Camera</span>
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
                          <span className="text-text-main font-medium text-sm">Document</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  multiple
                />
              </div>

              {/* Text Input Area */}
              <div className="flex-1 flex items-end justify-center min-w-0 relative min-h-13">
                {isRecording ? (
                  /* Recording UI */
                  <div className="absolute inset-0 z-20 flex items-center justify-between px-3 bg-surface rounded-4xl">
                    {/* Cancel Button */}
                    <button
                      onClick={() => stopRecording(true)}
                      className="shrink-0 p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                      aria-label="Cancel recording"
                    >
                      <X size={16} />
                    </button>

                    {/* Timer */}
                    <div className="flex items-center gap-2 text-red-500 font-mono font-bold text-sm">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      {formatTime(recordingDuration)}
                      <span className="hidden sm:inline text-secondary">
                        {isPaused ? "Paused" : "Recording"}
                      </span>
                    </div>

                    {/* Recording Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isPaused && (
                        <button
                          onClick={playPreviewAudio}
                          className="shrink-0 p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                          title="Preview recording"
                          aria-label="Preview recording"
                        >
                          <Volume2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={togglePauseRecording}
                        className="shrink-0 p-2 rounded-full bg-surface-hover text-text-main hover:bg-primary/10 transition-colors"
                        title={isPaused ? "Resume" : "Pause"}
                        aria-label={isPaused ? "Resume recording" : "Pause recording"}
                      >
                        {isPaused ? <Play size={16} /> : <Pause size={16} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Text Input */
                  <div className="w-full relative">
                    {/* Hidden measuring div for auto-expand */}
                    <div
                      className="invisible whitespace-pre-wrap wrap-break-word max-h-30 overflow-y-auto px-3 py-3 text-base"
                      style={{
                        minHeight: "44px",
                        wordBreak: "break-word",
                      }}
                    >
                      {inputValue || "placeholder"}
                    </div>

                    {/* Textarea */}
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
                      }}
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      wrap="soft"
                      inputMode="text"
                      enterKeyHint="enter"
                      autoCapitalize="sentences"
                      autoCorrect="on"
                      spellCheck="true"
                      aria-label="Message input"
                    />

                    {/* Command Hint */}
                    {!inputValue && !isRecording && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 flex items-center gap-1 text-secondary">
                        <Command size={14} className="hidden sm:block" />
                        <span className="text-xs hidden sm:inline">/</span>
                        <span className="text-xs sm:hidden">/</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Send/Action Button */}
              <div className="pr-1 pb-0.5">
                {inputValue.trim() || isRecording ? (
                  <button
                    onClick={
                      isRecording
                        ? () => stopRecording(false)
                        : editingMessage
                          ? handleEndEdit
                          : handleTextSend
                    }
                    className="w-12 h-12 rounded-full transition-all shadow-lg text-white transform active:scale-95 flex items-center justify-center bg-primary hover:bg-primary/90"
                    aria-label={editingMessage ? "Save edit" : isRecording ? "Send recording" : "Send message"}
                  >
                    {editingMessage ? <Check size={24} /> : <Send size={24} />}
                  </button>
                ) : (
                  !editingMessage && (
                    <button
                      onClick={startRecording}
                      className="w-12 h-12 rounded-full transition-all bg-surface-hover text-text-main hover:bg-secondary/20 flex items-center justify-center active:scale-95"
                      aria-label="Start voice recording"
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

