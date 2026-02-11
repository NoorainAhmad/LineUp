import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Image as ImageIcon,
  Type,
  Smile,
  Loader2,
  Video,
} from "lucide-react";
import { StatusType, User } from "../../../types";
import { StatusService } from "../../../services/status.service";
import { useAuth } from "@/contexts/AuthContext";

interface StatusCreatorProps {
  onClose: () => void;
  onCreate: () => void;
}

const COLORS = [
  "#00a884",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#54656f",
  "#0b141a",
];

export const StatusCreator: React.FC<StatusCreatorProps> = ({
  onClose,
  onCreate,
}) => {
  const { user: currentUser } = useAuth();
  const [type, setType] = useState<StatusType>(StatusType.TEXT);
  const [content, setContent] = useState("");
  const [caption, setCaption] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto trigger file input when switching to image mode
  useEffect(() => {
    if (type === StatusType.IMAGE && !imagePreview && !isUploading) {
      // Small delay to ensure the input is mounted
      const timer = setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [type, imagePreview, isUploading]);

  const handleSend = async () => {
    if (!currentUser) return;

    if (type === StatusType.TEXT && !content.trim()) {
      alert("Please enter some text for your status");
      return;
    }

    if (type === StatusType.IMAGE && !selectedFile) {
      alert("Please select an image");
      return;
    }

    setIsUploading(true);
    try {
      const statusData = {
        type: type,
        content: type === StatusType.TEXT ? content : caption || "Photo",
        color: type === StatusType.TEXT ? color : undefined,
        userId: currentUser.id,
      };

      await StatusService.createStatus(statusData, selectedFile || undefined);

      onCreate();
      onClose();
    } catch (error: any) {
      console.error("Failed to post status:", error);
      alert(error.message || "Could not post status. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size should be less than 10MB");
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setType(StatusType.IMAGE);
    }
    
    // Clear the input so the same file can be selected again
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setSelectedFile(null);
    setCaption("");
    setType(StatusType.TEXT);
  };

  const handleTypeToggle = (newType: StatusType) => {
    if (isUploading) return;

    if (newType === StatusType.IMAGE) {
      setType(StatusType.IMAGE);
      // The useEffect will trigger file input
    } else {
      handleRemoveImage();
      setType(StatusType.TEXT);
    }
  };

  const renderFontFamily = (selectedColor: string) => {
    const darkColors = ["#54656f", "#0b141a", "#3b82f6", "#8b5cf6"];
    return darkColors.includes(selectedColor)
      ? "font-sans font-black"
      : "font-serif font-black";
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#0b141a] flex flex-col animate-in slide-in-from-bottom-full duration-300">
      {/* Hidden file input - ALWAYS rendered */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isUploading}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center justify-between">
        <button
          onClick={onClose}
          disabled={isUploading}
          className="p-2 text-white hover:bg-white/10 rounded-full backdrop-blur-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close"
        >
          <X size={28} />
        </button>

        <div className="flex gap-4 p-2 rounded-full bg-black/20 backdrop-blur-md">
          <button
            onClick={() => handleTypeToggle(StatusType.IMAGE)}
            disabled={isUploading}
            className={`p-2 rounded-full transition-colors ${
              type === StatusType.IMAGE
                ? "text-white bg-white/10"
                : "text-white/50 hover:text-white hover:bg-white/10"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Add Photo"
            aria-label="Add Photo"
          >
            <ImageIcon size={24} />
          </button>
          <button
            onClick={() => handleTypeToggle(StatusType.TEXT)}
            disabled={isUploading}
            className={`p-2 rounded-full transition-colors ${
              type === StatusType.TEXT
                ? "text-white bg-white/10"
                : "text-white/50 hover:text-white hover:bg-white/10"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Add Text"
            aria-label="Add Text"
          >
            <Type size={24} />
          </button>
        </div>
      </div>

      {/* Floating Toolbar (Right Side) */}
      {type === StatusType.TEXT && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
          <div className="flex flex-col gap-2 bg-black/20 backdrop-blur-md p-2 rounded-full">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                disabled={isUploading}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                  color === c ? "border-white scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
          <button
            className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploading}
            aria-label="Font options"
          >
            <Smile size={24} />
          </button>
        </div>
      )}

      {/* Content Area */}
      <div
        className="flex-1 flex items-center justify-center p-8 relative transition-colors duration-500"
        style={{ backgroundColor: type === StatusType.TEXT ? color : "#000" }}
      >
        {type === StatusType.TEXT ? (
          <div className="w-full max-w-3xl relative">
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className={`w-full bg-transparent text-white text-4xl md:text-6xl text-center placeholder-white/30 focus:outline-none resize-none overflow-hidden leading-tight drop-shadow-md ${renderFontFamily(color)}`}
              rows={5}
              maxLength={500}
              disabled={isUploading}
            />
            <div className="absolute bottom-4 right-4 text-white/50 text-sm">
              {content.length}/500
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {imagePreview ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Remove image"
                >
                  <X size={20} />
                </button>

                <div className="absolute bottom-24 left-0 right-0 px-4">
                  <div className="max-w-xl mx-auto bg-black/40 backdrop-blur-md rounded-full px-4 py-2 flex items-center border border-white/10">
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Add a caption..."
                      className="bg-transparent w-full text-white placeholder-white/60 focus:outline-none text-sm font-medium disabled:opacity-50"
                      maxLength={200}
                      disabled={isUploading}
                    />
                    <div className="text-xs text-white/50 ml-2">
                      {caption.length}/200
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex flex-col items-center gap-6 text-white/50 hover:text-white transition-colors p-12 border-2 border-dashed border-white/20 hover:border-white/50 rounded-3xl group disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Upload photo"
              >
                <div className="p-6 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon size={64} />
                </div>
                <span className="text-2xl font-bold tracking-tight">
                  Upload Photo
                </span>
                <span className="text-sm">Click to browse your files</span>
                <span className="text-xs text-white/30">Max 10MB</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer / Send */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 to-transparent flex justify-between items-end z-20 pointer-events-none">
        <div className="pointer-events-auto" />

        <button
          onClick={handleSend}
          disabled={
            isUploading ||
            (type === StatusType.TEXT ? !content.trim() : !imagePreview)
          }
          className={`w-16 h-16 rounded-full text-white shadow-xl transition-all active:scale-95 flex items-center justify-center pointer-events-auto ${
            isUploading ||
            (type === StatusType.TEXT ? !content.trim() : !imagePreview)
              ? "bg-surface/20 backdrop-blur-md opacity-50 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90 hover:scale-105"
          }`}
          aria-label="Post status"
        >
          {isUploading ? (
            <Loader2 size={28} className="animate-spin" />
          ) : (
            <Send size={28} className="ml-1" />
          )}
        </button>
      </div>

      {/* Loading overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="text-center">
            <Loader2
              size={48}
              className="animate-spin text-white mx-auto mb-4"
            />
            <p className="text-white font-medium">Uploading your status...</p>
          </div>
        </div>
      )}
    </div>
  );
};