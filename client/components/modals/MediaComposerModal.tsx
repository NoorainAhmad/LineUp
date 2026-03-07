import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  X,
  FileText,
  Volume2,
  VolumeX,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

interface MediaComposerModalProps {
  files: File[];
  processing: boolean;
  processingLabel?: string;
  processingProgress?: number;
  onClose: () => void;
  onSend: (options?: { isMuted?: boolean; caption?: string }) => void;
  onAddMore: () => void;
  onRemoveFile?: (index: number) => void;
}

const formatBytes = (bytes: number, decimals = 1) => {
  if (!+bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

const getMediaKind = (file?: File | null) => {
  if (!file) return "file";
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "file";
};

export const MediaComposerModal: React.FC<MediaComposerModalProps> = ({
  files,
  processing,
  processingLabel,
  processingProgress,
  onClose,
  onSend,
  onAddMore,
  onRemoveFile,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [caption, setCaption] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  useEffect(() => {
    if (activeIndex >= files.length) {
      setActiveIndex(Math.max(0, files.length - 1));
    }
  }, [activeIndex, files.length]);

  const activeFile = files?.[activeIndex];
  const activeUrl = previewUrls?.[activeIndex];
  const mediaKind = getMediaKind(activeFile);

  const fileInfo = useMemo(() => {
    if (!activeFile)
      return {
        isImage: false,
        isVideo: false,
        isAudio: false,
        fileName: "",
        fileSize: 0,
      };

    return {
      isImage: activeFile.type.startsWith("image/"),
      isVideo: activeFile.type.startsWith("video/"),
      isAudio: activeFile.type.startsWith("audio/"),
      fileName: activeFile.name,
      fileSize: activeFile.size,
    };
  }, [activeFile]);

  const handleSend = useCallback(() => {
    const { isVideo, isAudio } = fileInfo;

    if (isVideo || isAudio) {
      onSend({ isMuted, caption });
    } else {
      onSend({ caption });
    }

    setCaption("");
  }, [fileInfo, isMuted, caption, onSend]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleCaptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCaption(e.target.value);
    },
    [],
  );

  const getMediaIcon = () => {
    const { isImage, isVideo, isAudio } = fileInfo;

    if (isImage) return <ImageIcon size={18} />;
    if (isVideo) return isMuted ? <VideoOff size={18} /> : <Video size={18} />;
    if (isAudio) return isMuted ? <MicOff size={18} /> : <Mic size={18} />;
    return <FileText size={18} />;
  };

  const getMediaTypeText = () => {
    if (files.length > 1) return `${files.length} files`;
    const { isImage, isVideo, isAudio } = fileInfo;
    if (isImage) return "an image";
    if (isVideo) return "a video";
    if (isAudio) return "an audio";
    return "a file";
  };

  if (!activeFile || !activeUrl) return null;

  const { isImage, isVideo, isAudio, fileName, fileSize } = fileInfo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-[640px] max-w-[96vw] max-h-[90vh] bg-surface rounded-2xl shadow-2xl border border-border p-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-text-main">
            Send {getMediaTypeText()}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-full"
            disabled={processing}
          >
            <X size={18} />
          </button>
        </div>

        {files.length > 1 && (
          <div className="mb-3 max-h-32 overflow-y-auto pr-1">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {files.map((file, index) => {
                const kind = getMediaKind(file);
                const thumbUrl = previewUrls[index];
                return (
                  <div key={`${file.name}-${index}`} className="relative">
                    <button
                      onClick={() => setActiveIndex(index)}
                      className={`w-full h-16 rounded-lg border overflow-hidden ${
                        activeIndex === index
                          ? "border-primary ring-1 ring-primary/40"
                          : "border-border"
                      }`}
                      disabled={processing}
                    >
                      {kind === "image" && (
                        <img
                          src={thumbUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {kind === "video" && (
                        <div className="w-full h-full bg-black/10 flex items-center justify-center">
                          <Video size={18} />
                        </div>
                      )}
                      {kind === "audio" && (
                        <div className="w-full h-full bg-black/10 flex items-center justify-center">
                          <Mic size={18} />
                        </div>
                      )}
                      {kind === "file" && (
                        <div className="w-full h-full bg-black/10 flex items-center justify-center">
                          <FileText size={18} />
                        </div>
                      )}
                    </button>
                    {onRemoveFile && !processing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFile(index);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center"
                        title="Remove"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 mb-4 flex items-center justify-center relative min-h-[220px]">
          {isImage && (
            <img
              src={activeUrl}
              alt={fileName}
              className="max-h-72 rounded-lg object-contain"
            />
          )}

          {isVideo && (
            <div className="relative w-full">
              <video
                src={activeUrl}
                className="max-h-72 rounded-lg w-full object-contain"
                controls
                muted={isMuted}
              />

              <button
                onClick={toggleMute}
                className="absolute bottom-3 right-3 p-2 rounded-full bg-black/50 text-white"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          )}

          {isAudio && (
            <audio src={activeUrl} className="w-full" controls muted={isMuted} />
          )}

          {!isImage && !isVideo && !isAudio && (
            <div className="flex items-center gap-3">
              <FileText size={22} />
              <div>
                <p className="font-medium">{fileName}</p>
                <p className="text-xs text-secondary">{formatBytes(fileSize)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mb-3 px-1">
          <p className="text-sm text-text-main truncate">{fileName}</p>
          <p className="text-xs text-secondary">
            {formatBytes(fileSize)} - {mediaKind.toUpperCase()} - {activeIndex + 1}
            /{files.length}
          </p>
        </div>

        {processing && (
          <div className="mb-3">
            <p className="text-xs text-secondary mb-1">
              {processingLabel || "Uploading media..."}
            </p>
            <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${Math.max(4, Math.min(100, processingProgress || 0))}%`,
                }}
              />
            </div>
          </div>
        )}

        <textarea
          value={caption}
          onChange={handleCaptionChange}
          placeholder="Add a caption..."
          className="w-full bg-surface-hover border border-border rounded-xl p-3 mb-4 resize-none"
          rows={3}
          disabled={processing}
        />

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onAddMore}
            className="px-4 py-2 rounded-lg text-primary hover:bg-primary/10"
            disabled={processing}
          >
            Add more
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg hover:bg-surface-hover text-secondary"
              disabled={processing}
            >
              Cancel
            </button>

            <button
              onClick={handleSend}
              disabled={processing || files.length === 0}
              className="px-5 py-2 rounded-lg bg-primary text-white flex items-center gap-2"
            >
              {processing ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                getMediaIcon()
              )}
              {processing ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
