import React, { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  MessageCircle,
  Trash2,
  Eye,
  Share2,
  Heart,
} from "lucide-react";
import { Avatar } from "../../../components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";

interface StatusViewProps {
  status: any; // Matching your backend JSON object
  allStatuses: any[];
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDelete: (statusId: string) => void;
}

export const StatusView: React.FC<StatusViewProps> = ({
  status,
  allStatuses,
  onClose,
  onNext,
  onPrev,
  onDelete,
}) => {
  const { user: CurrentUser } = useAuth();
  const [progress, setProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Filter all statuses that belong to the owner of the current status
  const userStatuses = allStatuses.filter((s) => s.user?.id === status.user?.id);
  const currentIndex = userStatuses.findIndex((s) => s.id === status.id);
  const isMyStatus = status.user?.id === CurrentUser?.id;

  // Auto-advance logic
  useEffect(() => {
    setProgress(0);
    setImageLoaded(false);
    setImageError(false);
    
    const duration = status.type === "IMAGE" ? 7000 : 5000; // 7 sec for images, 5 sec for text
    const intervalTime = 50;
    const increment = (intervalTime / duration) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onNext();
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [status, onNext]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this status update?")) {
      onDelete(status.id);
    }
  };

  // ✅ Get public S3 URL
  const getMediaUrl = (fileKey: string) => {
    const bucket = process.env.VITE_S3_BUCKET || "lineup-v0-s3-bucket";
    const region =process.env.VITE_AWS_REGION || "us-east-1";
    return `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}`;
  };

  // ✅ Handle image load error
  const handleImageError = () => {
    console.error("Failed to load image:", status.media?.fileKey);
    setImageError(true);
  };

  return (
    <div className="flex-1 h-full bg-black relative flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
      {/* Background Blur for Image Content */}
      {status.type === "IMAGE" && status.media?.fileKey && !imageError && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110 pointer-events-none"
          style={{
            backgroundImage: `url(${getMediaUrl(status.media.fileKey)})`,
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
                {status.createdAt ? (
                  new Date(status.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                ) : (
                  "Just now"
                )}
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
          <div className="relative flex flex-col items-center px-4">
            {status.media?.fileKey ? (
              <>
                {!imageLoaded && !imageError && (
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                <img
                  src={getMediaUrl(status.media.fileKey)}
                  alt="Status"
                  className={`max-h-[85vh] max-w-full object-contain shadow-2xl transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={handleImageError}
                />
                {imageError && (
                  <div className="text-center text-white/70 p-8">
                    <p className="text-lg">Failed to load image</p>
                    <p className="text-sm mt-2">The image may have been deleted</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-white/70 p-8">
                <p className="text-lg">No image available</p>
              </div>
            )}
            {status.content && imageLoaded && (
              <p className="absolute bottom-10 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg text-white text-lg max-w-[80%] text-center">
                {status.content}
              </p>
            )}
          </div>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center p-12 text-center"
            style={{ backgroundColor: status.color || "#00a884" }}
          >
            <p className="text-white text-3xl md:text-5xl font-bold leading-tight drop-shadow-xl max-w-2xl whitespace-pre-wrap">
              {status.content || "No content"}
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {/* <div className="absolute bottom-0 left-0 right-0 p-8 bg-linear-to-t from-black/90 to-transparent z-30 flex flex-col items-center">
        {isMyStatus ? (
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all">
                <Eye size={24} className="text-white" />
              </div>
              <span className="text-white text-xs font-semibold">
                {status._count?.viewers || status.viewers?.length || 0} views
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all">
                <Share2 size={24} className="text-white" />
              </div>
              <span className="text-white text-xs font-semibold">Share</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl flex flex-col items-center gap-4">
            <div className="w-full relative">
              <input
                type="text"
                placeholder="Reply..."
                className="w-full bg-white/10 border border-white/20 rounded-full py-3 px-6 text-white placeholder-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-white/20"
                onKeyDown={(e) => e.stopPropagation()}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button className="p-2 text-white/50 hover:text-red-400 transition-colors">
                  <Heart size={20} />
                </button>
                <button className="p-2 bg-primary text-white rounded-full">
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div> */}
    </div>
  );
};