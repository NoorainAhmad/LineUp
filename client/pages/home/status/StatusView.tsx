import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  MessageCircle,
  Trash2,
  Eye,
  Share2,
  Heart,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Avatar } from "../../../components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { StatusViewers } from "./StatusViewers";
import { StatusService } from "@/services/status.service";
import { ShareStatusModal } from "../../../components/modals/ShareStatusModal";
import { Chat } from "../../../types";

interface StatusViewProps {
  status: any; // Matching your backend JSON object
  allStatuses: any[];
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDelete: (statusId: string) => void;
  onReply?: (statusId: string, message: string) => void;
  onReact?: (statusId: string) => void;
  onShare?: (statusId: string, targetChatIds: string[]) => Promise<void>;
  chats?: Chat[];
}

// Get public S3 URL
const getMediaUrl = (fileKey: string) => {
  const bucket = process.env.VITE_S3_BUCKET || "lineup-v0-s3-bucket";
  const region = process.env.VITE_AWS_REGION || "us-east-1";
  return `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}`;
};

export const StatusView: React.FC<StatusViewProps> = ({
  status,
  allStatuses,
  onClose,
  onNext,
  onPrev,
  onDelete,
  onReply,
  onReact,
  onShare,
  chats = [],
}) => {
  const { user: CurrentUser } = useAuth();
  const [progress, setProgress] = useState(0);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewersData, setViewersData] = useState<{ total: number; viewers: any[] }>({ total: 0, viewers: [] });
  const [viewersLoading, setViewersLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerConfigRef = useRef<{ intervalTime: number; increment: number } | null>(null);

  // Determine media type
  const isVideo = status.media?.mimeType?.startsWith("video/");
  const isImage = status.type === "IMAGE" && !isVideo;
  const mediaUrl = status.media?.fileKey
    ? getMediaUrl(status.media.fileKey)
    : null;

  // Filter all statuses that belong to the owner of the current status
  const userStatuses = allStatuses.filter(
    (s) => s.user?.id === status.user?.id,
  );
  const currentIndex = userStatuses.findIndex((s) => s.id === status.id);
  const isMyStatus = status.user?.id === CurrentUser?.id;

  // Auto-advance logic
  useEffect(() => {
    // Reset state when status changes
    setProgress(0);
    setMediaLoaded(false);
    setMediaError(false);
    setIsPlaying(true);

    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Determine duration based on content type
    let duration = 5000; // Default 5 seconds for text
    if (isVideo) {
      duration = 30000; // 30 seconds for video (will be controlled by video duration)
    } else if (isImage) {
      duration = 7000; // 7 seconds for images
    }

    // For videos, progress is controlled by video timeupdate event
    if (!isVideo) {
      const intervalTime = 50;
      const increment = (intervalTime / duration) * 100;
      timerConfigRef.current = { intervalTime, increment };

      if (!isReplying && !showViewers && !showShareModal) {
        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
              }
              onNext();
              return 100;
            }
            return prev + increment;
          });
        }, intervalTime);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [status, onNext, isVideo, isImage, isReplying, showShareModal, showViewers]);

  // Mark as viewed when status changes
  useEffect(() => {
    if (status && CurrentUser && status.user?.id !== CurrentUser.id) {
      StatusService.markAsViewed(status.id).catch((err) => {
        console.error("Failed to mark status as viewed:", err);
      });
    }
  }, [status.id, CurrentUser?.id]);

  // Handle video time update for progress
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const progressPercent = (video.currentTime / video.duration) * 100;
      setProgress(progressPercent);
    }
  };

  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false);
    onNext();
  };

  // Toggle play/pause for video
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle video click (pause/resume)
  const handleMediaClick = () => {
    if (isVideo) {
      togglePlay();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this status update?")) {
      onDelete(status.id);
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim() && onReply) {
      onReply(status.id, replyText);
      setReplyText("");
      setIsReplying(false);
    }
  };

  const handleShareClick = () => {
    setShowShareModal(true);
    // Pause the timer
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    // Also pause video if playing
    if (isVideo && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleReplyFocus = () => {
    setIsReplying(true);
    // Pause the timer
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    // Also pause video if playing
    if (isVideo && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleReplyBlur = () => {
    // Only resume if the reply text is empty (user abandoned reply)
    if (!replyText.trim()) {
      setIsReplying(false);
      // Resume timer
      if (!isVideo && timerConfigRef.current) {
        const { intervalTime, increment } = timerConfigRef.current;
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
              onNext();
              return 100;
            }
            return prev + increment;
          });
        }, intervalTime);
      }
      if (isVideo && videoRef.current) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Handle media load error
  const handleMediaError = () => {
    console.error("Failed to load media:", status.media?.fileKey);
    setMediaError(true);
    // Auto advance after error
    setTimeout(() => onNext(), 2000);
  };

  return (
    <div className="flex-1 h-full bg-black relative flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
      {/* Background Blur for Image Content */}
      {isImage && mediaUrl && !mediaError && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110 pointer-events-none"
          style={{
            backgroundImage: `url(${mediaUrl})`,
          }}
        />
      )}

      {/* Progress Bars & Header */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-6 bg-linear-to-b from-black/80 to-transparent">
        <div className="flex gap-1.5 mb-4">
          {userStatuses.map((s, idx) => (
            <div
              key={s.id}
              className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm"
            >
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width:
                    idx < currentIndex
                      ? "100%"
                      : idx === currentIndex
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full md:hidden"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <Avatar user={status.user} size="md" />
            <div className="flex flex-col text-shadow">
              <span className="text-white font-bold text-sm leading-tight">
                {status.user?.name || "Unknown"}
              </span>
              <span className="text-white/70 text-xs">
                {status.createdAt
                  ? new Date(status.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "Just now"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMyStatus && (
              <button
                onClick={handleDelete}
                className="text-white/70 hover:text-red-400 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full h-full flex items-center justify-center relative z-10">
        <div
          className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
          onClick={onPrev}
        />
        <div
          className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer"
          onClick={onNext}
        />

        {status.type === "IMAGE" ? (
          <div
            className="relative flex flex-col items-center px-4"
            onClick={handleMediaClick}
          >
            {mediaUrl ? (
              <>
                {!mediaLoaded && !mediaError && (
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}

                {isVideo ? (
                  // Video Player
                  <video
                    ref={videoRef}
                    src={mediaUrl}
                    className={`max-h-[85vh] max-w-full object-contain shadow-2xl transition-opacity duration-300 ${mediaLoaded ? "opacity-100" : "opacity-0"
                      }`}
                    autoPlay
                    playsInline
                    loop={false}
                    muted={isMuted}
                    onLoadedData={() => setMediaLoaded(true)}
                    onError={handleMediaError}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onEnded={handleVideoEnd}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  // Image
                  <img
                    src={mediaUrl}
                    alt="Status"
                    className={`max-h-[85vh] max-w-full object-contain shadow-2xl transition-opacity duration-300 ${mediaLoaded ? "opacity-100" : "opacity-0"
                      }`}
                    onLoad={() => setMediaLoaded(true)}
                    onError={handleMediaError}
                  />
                )}

                {/* Video Controls */}
                {isVideo && mediaLoaded && (
                  <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-3 z-30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                      }}
                      className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                  </div>
                )}

                {mediaError && (
                  <div className="text-center text-white/70 p-8">
                    <p className="text-lg">Failed to load media</p>
                    <p className="text-sm mt-2">
                      The media may have been deleted
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-white/70 p-8">
                <p className="text-lg">No media available</p>
              </div>
            )}

            {status.content && mediaLoaded && (
              <p className="absolute bottom-10 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg text-white text-lg max-w-[80%] text-center">
                {status.content}
              </p>
            )}
          </div>
        ) : (
          // Text Status
          <div
            className="w-full h-full flex items-center justify-center p-12 text-center cursor-pointer"
            style={{ backgroundColor: status.color || "#00a884" }}
            onClick={onNext}
          >
            <p className="text-white text-3xl md:text-5xl font-bold leading-tight drop-shadow-xl max-w-2xl whitespace-pre-wrap">
              {status.content || "No content"}
            </p>
          </div>
        )}
      </div>

      {/* Viewers Panel */}
      {showViewers && (
        <StatusViewers
          viewers={viewersData.viewers}
          total={viewersData.total}
          isLoading={viewersLoading}
          onClose={() => {
            setShowViewers(false);
            // Resume timer
            if (!isVideo && timerConfigRef.current) {
              const { intervalTime, increment } = timerConfigRef.current;
              progressIntervalRef.current = setInterval(() => {
                setProgress((prev) => {
                  if (prev >= 100) {
                    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                    onNext();
                    return 100;
                  }
                  return prev + increment;
                });
              }, intervalTime);
            }
            if (isVideo && videoRef.current) {
              videoRef.current.play();
              setIsPlaying(true);
            }
          }}
        />
      )}

      {/* Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-linear-to-t from-black/90 to-transparent z-30 flex flex-col items-center">
        {isMyStatus ? (
          <div className="flex items-center gap-8">
            <button
              onClick={async (e) => {
                e.stopPropagation();
                setShowViewers(true);
                setViewersLoading(true);
                // Pause timer
                if (progressIntervalRef.current) {
                  clearInterval(progressIntervalRef.current);
                  progressIntervalRef.current = null;
                }
                if (isVideo && videoRef.current && !videoRef.current.paused) {
                  videoRef.current.pause();
                  setIsPlaying(false);
                }
                try {
                  const res = await StatusService.getStatusViewers(status.id);
                  setViewersData(res.data);
                } catch (err) {
                  console.error("Failed to fetch viewers:", err);
                  setViewersData({ total: 0, viewers: [] });
                } finally {
                  setViewersLoading(false);
                }
              }}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all">
                <Eye size={24} className="text-white" />
              </div>
              <span className="text-white text-xs font-semibold">
                {status._count?.viewers || status.viewers?.length || 0} views
              </span>
            </button>
            <div
              className="flex flex-col items-center gap-1 group cursor-pointer"
              onClick={handleShareClick}
            >
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all">
                <Share2 size={24} className="text-white" />
              </div>
              <span className="text-white text-xs font-semibold">Share</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl flex flex-col items-center gap-4">
            <form onSubmit={handleReplySubmit} className="w-full relative">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply to this status..."
                className="w-full bg-white/10 border border-white/20 rounded-full py-3 px-6 text-white placeholder-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-white/20"
                onFocus={handleReplyFocus}
                onBlur={handleReplyBlur}
                onKeyDown={(e) => e.stopPropagation()}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onReact?.(status.id)}
                  className="p-2 text-white/50 hover:text-red-400 transition-colors"
                >
                  <Heart size={20} />
                </button>
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="p-2 bg-primary text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Share Status Modal */}
      {showShareModal && (
        <ShareStatusModal
          status={status}
          chats={chats}
          onClose={() => setShowShareModal(false)}
          onShare={async (statusId, targetChatIds) => {
            if (onShare) {
              await onShare(statusId, targetChatIds);
            }
          }}
        />
      )}
    </div>
  );
};
