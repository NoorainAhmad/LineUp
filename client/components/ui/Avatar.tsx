import React from "react";
import { User, UserStatus } from "../../types";

interface AvatarProps {
  user?: User; // Made optional to prevent crash
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showStatus?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
  "2xl": "w-32 h-32 text-4xl",
};

export const Avatar: React.FC<AvatarProps> = ({
  user,
  size = "md",
  showStatus = false,
}) => {
  // 1. Safe Initial Logic
  const getInitials = (name?: string) => {
    if (!name || typeof name !== "string") return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0][0] && parts[1][0]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0] ? parts[0][0].toUpperCase() : "??";
  };

  // 2. Safe Status Color Logic
  const getStatusColor = (status?: UserStatus) => {
    switch (status) {
      case UserStatus.ONLINE:
        return "bg-green-500";
      case UserStatus.BUSY:
        return "bg-amber-500";
      case UserStatus.OFFLINE:
      default:
        return "bg-gray-500";
    }
  };

  // 3. Fallback UI if user is missing entirely
  if (!user) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-surface-hover animate-pulse border border-border/50`}
      />
    );
  }

  return (
    <div className="relative shrink-0">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name || "User Avatar"}
          className={`${sizeClasses[size]} rounded-full object-cover border border-white/5 bg-surface`}
          onError={(e) => {
            // Handle broken image links by removing the img element
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold border border-white/5 shadow-inner`}
        >
          {getInitials(user.name)}
        </div>
      )}

      {showStatus && user.status && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
          {user.status === UserStatus.ONLINE && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-background ${getStatusColor(user.status)}`}
          ></span>
        </span>
      )}
    </div>
  );
};
