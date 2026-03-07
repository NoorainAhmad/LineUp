import React, { useState, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react'; 

// Simple Avatar fallback if you don't want to import
const SimpleAvatar = ({ user, size }: { user?: any; size?: string }) => {
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  return (
    <div className={`w-${size === 'sm' ? '8' : '10'} h-${size === 'sm' ? '8' : '10'} rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold`}>
      {initials}
    </div>
  );
};

// Use either your actual Avatar or the SimpleAvatar
const Avatar = SimpleAvatar; // Remove this line if using your actual Avatar

const toFiniteDuration = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  return null;
};

const formatDuration = (value: unknown) => {
  const duration = toFiniteDuration(value);
  if (duration === null) return '0:00';

  const totalSeconds = Math.floor(duration);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

interface AudioMessageProps {
  msg: {
    id: string;
    fileUrl?: string;
    fileName?: string;
    duration?: number;
    fileSize?: string;
    createdAt: string;
    sender?: {
      id: string;
      name: string;
      avatarUrl?: string | null;
    };
    content?: string;
  };
  isGroupChat: boolean;
  isMe: boolean;
  senderName?: string;
  playingAudioId: string | null;
  toggleAudio: (id: string, url: string) => void;
  chat?: {
    members?: Array<{
      user: {
        id: string;
        name: string;
        avatarUrl?: string | null;
      };
    }>;
  };
}

const AudioMessage: React.FC<AudioMessageProps> = ({
  msg,
  isGroupChat,
  isMe,
  senderName,
  playingAudioId,
  toggleAudio,
  chat
}) => {
  const [duration, setDuration] = useState<string>(formatDuration(msg.duration));
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Reset state when message changes
    if (toFiniteDuration(msg.duration) !== null) {
      setDuration(formatDuration(msg.duration));
      setIsLoading(false);
      setLoadError(false);
      return;
    }

    if (!msg.fileUrl) {
      setDuration('0:00');
      setIsLoading(false);
      setLoadError(true);
      return;
    }

    // Create a new audio element to get metadata
    const audio = new Audio();
    let durationResolveTimeout: ReturnType<typeof setTimeout> | undefined;
    audio.preload = 'metadata';
    
    // Set up event handlers before setting src
    const applyDuration = (value: unknown) => {
      setDuration(formatDuration(value));
      setIsLoading(false);
      setLoadError(false);
    };

    const clearDurationResolveTimeout = () => {
      if (durationResolveTimeout) {
        clearTimeout(durationResolveTimeout);
        durationResolveTimeout = undefined;
      }
    };

    const resolveDuration = () => {
      const safeDuration = toFiniteDuration(audio.duration);
      if (safeDuration !== null) {
        applyDuration(safeDuration);
        return true;
      }
      return false;
    };

    const attemptResolveInfinityDuration = () => {
      if (resolveDuration()) return;

      durationResolveTimeout = setTimeout(() => {
        if (resolveDuration()) return;
        setDuration('0:00');
        setIsLoading(false);
        setLoadError(false);
      }, 1200);

      try {
        // Recorder-produced WebM can report Infinity until a forced seek.
        audio.currentTime = 1e101;
      } catch {
        // Ignore seek failures while metadata is still warming up.
      }
    };

    const handleLoadedMetadata = () => {
      try {
        if (resolveDuration()) return;

        if (audio.duration === Infinity) {
          setIsLoading(true);
          setLoadError(false);
          attemptResolveInfinityDuration();
          return;
        }

        setDuration('0:00');
        setIsLoading(false);
        setLoadError(false);
      } catch (error) {
        console.error('Error processing audio metadata:', error);
        setDuration('0:00');
        setIsLoading(false);
        setLoadError(true);
      }
    };

    const handleError = (e: ErrorEvent) => {
      console.error('Failed to load audio:', msg.fileUrl, e);
      setDuration('0:00');
      setIsLoading(false);
      setLoadError(true);
    };

    const handleCanPlay = () => {
      if (resolveDuration()) return;
      if (audio.duration === Infinity) {
        attemptResolveInfinityDuration();
      }
    };

    const handleDurationChange = () => {
      resolveDuration();
    };

    const handleTimeUpdate = () => {
      if (!resolveDuration()) return;
      clearDurationResolveTimeout();
      audio.currentTime = 0;
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError as EventListener);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    // Set the source and load
    audio.src = msg.fileUrl;
    audio.load();

    // Cleanup function
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError as EventListener);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      clearDurationResolveTimeout();
      audio.src = ''; // Clear the source
      // Pause if playing and remove from memory
      audio.pause();
    };
  }, [msg.id, msg.fileUrl, msg.duration]); // Re-run if message id, fileUrl, or duration changes

  // Format file size to KB or MB
  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '';
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="p-3 flex items-center gap-3 min-w-50 max-w-full">
      {/* Play/Pause Button */}
      <button
        onClick={() => toggleAudio(msg.id, msg.fileUrl || "")}
        disabled={!msg.fileUrl || loadError}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0 ${
          playingAudioId === msg.id
            ? "bg-primary text-white"
            : msg.fileUrl && !loadError
              ? "bg-surface text-text-main hover:bg-surface-hover cursor-pointer"
              : "bg-surface/50 text-text-main/50 cursor-not-allowed"
        }`}
        title={!msg.fileUrl ? "No audio file" : loadError ? "Failed to load audio" : "Play audio"}
      >
        {playingAudioId === msg.id ? (
          <Pause size={18} />
        ) : (
          <Play size={18} className="ml-0.5" />
        )}
      </button>
      
      {/* Audio Info and Progress */}
      <div className="flex flex-col justify-center gap-1 flex-1 min-w-0">
        {/* Top row: duration/status and sender name */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] opacity-70 flex items-center gap-1 font-mono">
            <Mic size={10} /> 
            {isLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : loadError ? (
              <span className="text-red-500">Failed to load</span>
            ) : (
              duration
            )}
          </span>
          
          {/* Sender name for audio in group chats */}
          {isGroupChat && !isMe && senderName && (
            <span className="text-[10px] text-secondary truncate ml-2">
              {senderName}
            </span>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="h-1.5 bg-black/10 dark:bg-white/20 rounded-full w-full overflow-hidden">
          {playingAudioId === msg.id ? (
            <div 
              className="h-full bg-primary rounded-full animate-pulse" 
              style={{ width: '100%' }}
            />
          ) : (
            <div className="h-full bg-primary/30 rounded-full w-0" />
          )}
        </div>
        
        {/* Bottom row: timestamp and file size */}
        <div className="text-[8px] opacity-50 mt-0.5 flex justify-between"> 
          {msg.fileSize && !loadError && (
            <span>{formatFileSize(msg.fileSize)}</span>
          )}
        </div>
      </div>
      
      {/* Avatar */}
      <div className="flex items-center self-end shrink-0">
        <Avatar
          user={
            isMe
              ? undefined
              : chat?.members?.find((m) => m.user.id === msg.sender?.id)?.user || msg.sender
          }
          size="sm"
        />
      </div>
    </div>
  );
};

export default AudioMessage;
