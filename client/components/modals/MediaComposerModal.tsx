import React from "react";
import { X, FileText } from "lucide-react";

interface MediaComposerModalProps {
  file: File | null;
  caption: string;
  onCaptionChange: (value: string) => void;
  onClose: () => void;
  onSend: () => void;
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
  caption,
  onCaptionChange,
  onClose,
  onSend,
  onAddMore,
}) => {
  if (!file) return null;

  const isImage = file.type.startsWith("image/");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-420px max-w-[95vw] bg-surface rounded-2xl shadow-2xl border border-border p-4 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-text-main">
            Send {isImage ? "an image" : "a file"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Preview */}
        <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 mb-4 flex items-center justify-center">
          {isImage ? (
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="max-h-72 rounded-lg object-contain"
            />
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-surface-hover flex items-center justify-center">
                <FileText size={22} />
              </div>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-secondary">
                  {formatBytes(file.size)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="mb-4">
          <label className="text-sm text-secondary mb-1 block">
            Caption
          </label>
          <textarea
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="Add a caption..."
            className="w-full bg-surface-hover border border-border rounded-xl p-3 focus:outline-none focus:border-primary resize-none"
            rows={3}
          />
        </div>

        {/* Actions (Telegram Style) */}
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
              onClick={onSend}
              className="px-5 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};