import React from "react";
import { User, UserStatus } from "../../types";
import { Users } from "lucide-react";

interface AvatarProps {
  user?: User; // For individual users
  groupName?: string; // For group chats
  isGroup?: boolean; // Flag for group avatar
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showStatus?: boolean; // Only for individual users
  groupMembers?: User[]; // For generating group avatar collage
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
  "2xl": "w-32 h-32 text-4xl",
};

const iconSizes = {
  sm: 14,
  md: 18,
  lg: 22,
  xl: 28,
  "2xl": 48,
};

export const Avatar: React.FC<AvatarProps> = ({
  user,
  groupName,
  isGroup = false,
  size = "md",
  showStatus = false,
  groupMembers = [],
}) => {
  // 1. Safe Initials Logic
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

  // 3. Generate consistent color based on name/group name
  const getColorFromName = (name: string = "") => {
    const colors = [
      "from-blue-500 to-indigo-600",
      "from-green-500 to-emerald-600",
      "from-orange-500 to-red-600",
      "from-purple-500 to-pink-600",
      "from-yellow-500 to-amber-600",
      "from-teal-500 to-cyan-600",
      "from-pink-500 to-rose-600",
      "from-indigo-500 to-purple-600",
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // 4. Group Avatar with Collage (when multiple members)
  const renderGroupCollage = () => {
    const membersToShow = groupMembers.slice(0, 4);
    const remainingCount = groupMembers.length - 4;
    
    if (size === "sm" || size === "md") {
      // Small sizes - show icon with count
      return (
        <div className={`${sizeClasses[size]} rounded-full bg-linear-to-br ${getColorFromName(groupName || "Group")} flex items-center justify-center text-white font-bold border border-white/5 shadow-inner relative`}>
          <Users size={iconSizes[size] * 0.6} className="text-white" />
          {groupMembers.length > 0 && (
            <span className="absolute -bottom-1 -right-1 bg-surface text-text-main text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-border">
              {groupMembers.length}
            </span>
          )}
        </div>
      );
    }

    // Larger sizes - show collage
    return (
      <div className={`${sizeClasses[size]} relative`}>
        <div className="grid grid-cols-2 gap-0.5 w-full h-full">
          {membersToShow.map((member, index) => (
            <div key={member.id} className="overflow-hidden">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className={`w-full h-full bg-linear-to-br ${getColorFromName(member.name)} flex items-center justify-center text-white font-bold text-[8px]`}>
                  {getInitials(member.name)}
                </div>
              )}
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="bg-surface-hover flex items-center justify-center text-[10px] font-bold text-text-main">
              +{remainingCount}
            </div>
          )}
        </div>
        {groupMembers.length === 0 && (
          <div className="absolute inset-0 bg-linear-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
            <Users size={iconSizes[size] * 0.5} className="text-white" />
          </div>
        )}
      </div>
    );
  };

  // 5. Group Avatar with image or initials
  const renderGroupAvatar = () => {
    // If we have group members and it's a larger size, show collage
    if (groupMembers.length > 0 && (size === "lg" || size === "xl" || size === "2xl")) {
      return renderGroupCollage();
    }

    // Default group avatar
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-linear-to-br ${getColorFromName(groupName || "Group")} flex items-center justify-center text-white font-bold border border-white/5 shadow-inner relative`}>
        {groupName ? (
          getInitials(groupName)
        ) : (
          <Users size={iconSizes[size] * 0.6} className="text-white" />
        )}
        {groupMembers.length > 0 && size !== "2xl" && (
          <span className="absolute -bottom-1 -right-1 bg-surface text-text-main text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-border">
            {groupMembers.length}
          </span>
        )}
      </div>
    );
  };

  // 6. Individual User Avatar
  const renderUserAvatar = () => {
    if (!user) {
      return (
        <div
          className={`${sizeClasses[size]} rounded-full bg-surface-hover animate-pulse border border-border/50`}
        />
      );
    }

    return (
      <>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name || "User Avatar"}
            className={`${sizeClasses[size]} rounded-full object-cover border border-white/5 bg-surface`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement?.classList.add('fallback-active');
            }}
          />
        ) : (
          <div
            className={`${sizeClasses[size]} rounded-full bg-linear-to-br ${getColorFromName(user.name)} flex items-center justify-center text-white font-bold border border-white/5 shadow-inner`}
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
      </>
    );
  };

  // 7. Main render
  return (
    <div className="relative shrink-0">
      {isGroup ? renderGroupAvatar() : renderUserAvatar()}
    </div>
  );
};