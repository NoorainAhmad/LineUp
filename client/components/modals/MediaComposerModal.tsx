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
} from "lucide-react";

interface MediaComposerModalProps {
  file: File | null;
  processing: boolean;
  onClose: () => void;
  onSend: (options?: { isMuted?: boolean; caption?: string }) => void;
  onAddMore: () => void;
}

const formatBytes = (bytes: number, decimals = 1) => {
  if (!+bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const MediaComposerModal: React.FC<MediaComposerModalProps> = ({
  file,
  processing,
  onClose,
  onSend,
  onAddMore,
}) => { 
  const [isMuted, setIsMuted] = useState(false);
  const [caption, setCaption] = useState("");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
 
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setObjectUrl(null);
      };
    }
  }, [file]);
 
  const fileInfo = useMemo(() => {
    if (!file)
      return {
        isImage: false,
        isVideo: false,
        isAudio: false,
        fileName: "",
        fileSize: 0,
      };
    return {
      isImage: file.type.startsWith("image/"),
      isVideo: file.type.startsWith("video/"),
      isAudio: file.type.startsWith("audio/"),
      fileName: file.name,
      fileSize: file.size,
    };
  }, [file]);
 
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

  const getMediaIcon = useCallback(() => {
    const { isImage, isVideo, isAudio } = fileInfo;
    if (isImage) return null;
    if (isVideo) return isMuted ? <VideoOff size={18} /> : <Video size={18} />;
    if (isAudio) return isMuted ? <MicOff size={18} /> : <Mic size={18} />;
    return <FileText size={18} />;
  }, [fileInfo, isMuted]);

  const getMediaTypeText = useCallback(() => {
    const { isImage, isVideo, isAudio } = fileInfo;
    if (isImage) return "an image";
    if (isVideo) return "a video";
    if (isAudio) return "an audio";
    return "a file";
  }, [fileInfo]);

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);
 
  if (!file || !objectUrl) {
    return null;
  }

  const { isImage, isVideo, isAudio, fileName, fileSize } = fileInfo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-420px max-w-[95vw] bg-surface rounded-2xl shadow-2xl border border-border p-4 animate-in zoom-in-95"
        onClick={handleContainerClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-text-main">
            Send {getMediaTypeText()}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Preview */}
        <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 mb-4 flex items-center justify-center relative">
          {isImage ? (
            <img
              src={objectUrl}
              alt={fileName}
              className="max-h-72 rounded-lg object-contain"
            />
          ) : isVideo ? (
            <div className="relative w-full">
              <video
                src={objectUrl}
                className="max-h-72 rounded-lg w-full object-contain"
                controls
                muted={isMuted}
              />
              {/* Mute/Unmute overlay button */}
              <button
                onClick={toggleMute}
                className="absolute bottom-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          ) : isAudio ? (
            <div className="w-full">
              <div className="flex items-center gap-4 p-4 bg-surface-hover rounded-lg">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {isMuted ? (
                    <MicOff size={24} className="text-primary" />
                  ) : (
                    <Mic size={24} className="text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium truncate">{fileName}</p>
                  <p className="text-xs text-secondary">
                    {formatBytes(fileSize)}
                  </p>
                </div>
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full hover:bg-surface transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX size={20} className="text-primary" />
                  ) : (
                    <Volume2 size={20} className="text-primary" />
                  )}
                </button>
              </div> 
              <audio
                src={objectUrl}
                className="w-full mt-3"
                controls
                muted={isMuted}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-surface-hover flex items-center justify-center">
                <FileText size={22} />
              </div>
              <div>
                <p className="font-medium">{fileName}</p>
                <p className="text-xs text-secondary">
                  {formatBytes(fileSize)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="mb-4">
          <label className="text-sm text-secondary mb-1 block">Caption</label>
          <textarea
            value={caption}
            onChange={handleCaptionChange}
            placeholder="Add a caption..."
            className="w-full bg-surface-hover border border-border rounded-xl p-3 focus:outline-none focus:border-primary resize-none"
            rows={3}
          />
        </div>

        {/* Mute Status Indicator for Video/Audio */}
        {(isVideo || isAudio) && (
          <div className="mb-4 px-3 py-2 bg-primary/5 rounded-lg flex items-center gap-2">
            {isMuted ? (
              <>
                <VolumeX size={16} className="text-primary" />
                <span className="text-xs text-primary">
                  Audio will be muted
                </span>
              </>
            ) : (
              <>
                <Volume2 size={16} className="text-primary" />
                <span className="text-xs text-primary">
                  Audio will be played
                </span>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          {/* Add Button */}
          <button
            onClick={onAddMore}
            className="px-4 py-2 rounded-lg text-primary font-medium hover:bg-primary/10 transition-colors"
          >
            Add
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg hover:bg-surface-hover text-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={processing}
              className={`px-5 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:bg-primary/50 transition-colors flex items-center gap-2`}
            >
              <span>
                {processing ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  getMediaIcon()
                )}
              </span>
              <span>{processing ? "Processing..." : "Send"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
