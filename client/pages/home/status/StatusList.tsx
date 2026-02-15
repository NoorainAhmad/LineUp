import React, { useMemo } from "react";
import { Plus, Eye, Clock, Image as ImageIcon } from "lucide-react";
import {
  Status,
  UserRole,
  UserStatus as UserStatusType,
  Media,
} from "../../../types";
import { Avatar } from "../../../components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";

interface StatusListProps {
  statuses: Status[];
  onSelectStatus: (statusId: string) => void;
  onCreateStatus: () => void;
}

interface GroupedStatus {
  userId: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
    status: UserStatusType;
    role?: UserRole;
  };
  statuses: Status[];
  hasUnseen: boolean;
  latestTimestamp: string;
  viewerCount: number;
}

export const StatusList: React.FC<StatusListProps> = ({
  statuses,
  onSelectStatus,
  onCreateStatus,
}) => {
  const { user: currentUser } = useAuth();

  // Helper to format ISO date to relative time
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Just now";

      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "Just now";

      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;

      return date.toLocaleDateString();
    } catch {
      return "Just now";
    }
  };

  // Get status preview text/icon
  const getStatusPreview = (status: Status) => {
    if (status.type === "IMAGE") {
      return status.media?.mimeType?.startsWith("video/")
        ? "🎥 Video"
        : "📷 Photo";
    } else {
      return (
        status.content?.substring(0, 30) +
          (status.content && status.content.length > 30 ? "..." : "") ||
        "Status update"
      );
    }
  };

  // Grouping and Filtering logic
  const { myStatuses, recentUpdates, viewedUpdates, allGroups } =
    useMemo(() => {
      if (!statuses || statuses.length === 0) {
        return {
          myStatuses: [],
          recentUpdates: [],
          viewedUpdates: [],
          allGroups: [],
        };
      }

      // Filter out expired statuses (older than 24 hours)
      const now = new Date();
      const validStatuses = statuses.filter((status) => {
        const createdAt = new Date(status.createdAt);
        const diffInHours =
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        return diffInHours < 24;
      });

      // Group statuses by user
      const groupedByUser = validStatuses.reduce(
        (acc, status) => {
          const userId = status.user?.id || status.userId;

          if (!userId) return acc;

          if (!acc[userId]) {
            acc[userId] = {
              userId,
              user: {
                id: userId,
                name: status.user?.name || "Unknown User",
                avatarUrl: status.user?.avatarUrl,
                status: status.user?.status || UserStatusType.OFFLINE,
                role: status.user?.role,
              },
              statuses: [],
              hasUnseen: false,
              latestTimestamp: "",
              viewerCount: 0,
            };
          }

          acc[userId].statuses.push(status);

          // Update latest timestamp
          const statusTime = new Date(status.createdAt).getTime();
          const currentLatest = acc[userId].latestTimestamp
            ? new Date(acc[userId].latestTimestamp).getTime()
            : 0;

          if (statusTime > currentLatest) {
            acc[userId].latestTimestamp = status.createdAt;
          }

          // Check if current user has viewed this status
          if (currentUser) {
            const viewers = status.viewers || [];
            const hasViewed = viewers.some(
              (viewer: any) =>
                (viewer.userId && viewer.userId === currentUser.id) ||
                (viewer.user && viewer.user.id === currentUser.id),
            );

            if (!hasViewed) {
              acc[userId].hasUnseen = true;
            }
          }

          // Track viewer count (unique viewers across all statuses)
          const uniqueViewers = new Set();
          acc[userId].statuses.forEach((s) => {
            (s.viewers || []).forEach((v: any) => {
              const viewerId = v.userId || v.user?.id;
              if (viewerId) uniqueViewers.add(viewerId);
            });
          });
          acc[userId].viewerCount = uniqueViewers.size;

          return acc;
        },
        {} as Record<string, GroupedStatus>,
      );

      const myId = currentUser?.id || "";
      const myGroup = groupedByUser[myId];
      const myStatuses = myGroup?.statuses || [];

      // Convert grouped object to array and remove current user
      const otherGroups = Object.values(groupedByUser)
        .filter((group) => group.userId !== myId)
        .map((group) => ({
          ...group,
          formattedTime: formatTime(group.latestTimestamp),
          latestStatus: group.statuses[group.statuses.length - 1],
        }))
        .sort(
          (a, b) =>
            new Date(b.latestTimestamp).getTime() -
            new Date(a.latestTimestamp).getTime(),
        );

      // Separate recent (unseen) and viewed updates
      const recentUpdates = otherGroups.filter((group) => group.hasUnseen);
      const viewedUpdates = otherGroups.filter((group) => !group.hasUnseen);

      return {
        myStatuses,
        recentUpdates,
        viewedUpdates,
        allGroups: [...recentUpdates, ...viewedUpdates],
      };
    }, [statuses, currentUser]);

  const hasMyStatus = myStatuses.length > 0;
  const canCreateStatus = currentUser?.role !== UserRole.USER;

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border w-full md:w-95 lg:w-105 relative z-20">
      {/* Header */}
      <div className="h-20 px-6 flex items-center justify-between shrink-0 bg-surface border-b border-border/50">
        <h1 className="text-2xl font-black text-text-main tracking-tight">
          Status
        </h1>
        {canCreateStatus && (
          <button
            onClick={onCreateStatus}
            className="p-2 hover:bg-surface-hover rounded-full transition-colors text-primary bg-primary/5"
            aria-label="Create new status"
          >
            <Plus size={22} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 bg-surface">
        {/* My Status Card - Only show if user can create status */}
        {canCreateStatus && (
          <>
            <div
              onClick={() =>
                hasMyStatus
                  ? onSelectStatus(myStatuses[0].id)
                  : onCreateStatus()
              }
              className="flex items-center gap-4 cursor-pointer group p-3 rounded-2xl transition-all border border-transparent hover:bg-surface-hover hover:border-border active:scale-[0.98]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  hasMyStatus
                    ? onSelectStatus(myStatuses[0].id)
                    : onCreateStatus();
                }
              }}
            >
              <div className="relative">
                <div
                  className={`p-0.5 rounded-full ${
                    hasMyStatus
                      ? "ring-3 ring-primary ring-offset-1 ring-offset-surface"
                      : "ring-2 ring-border ring-offset-1 ring-offset-surface"
                  }`}
                >
                  <Avatar
                    user={currentUser || undefined}
                    size="lg"
                    showStatus={true}
                  />
                </div>
                {!hasMyStatus && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 border-2 border-surface shadow-sm">
                    <Plus size={14} strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-text-main">My Status</h3>
                <p className="text-secondary text-sm truncate">
                  {hasMyStatus
                    ? `${myStatuses.length} ${myStatuses.length === 1 ? "update" : "updates"} • ${formatTime(myStatuses[myStatuses.length - 1].createdAt)}`
                    : "Tap to add status update"}
                </p>
                {hasMyStatus && (
                  <p className="text-xs text-secondary mt-1">
                    {getStatusPreview(myStatuses[myStatuses.length - 1])}
                  </p>
                )}
              </div>
            </div>
            <div className="h-px bg-border/50 mx-2"></div>
          </>
        )}

        {/* Recent Updates */}
        {recentUpdates.length > 0 && (
          <div>
            <h4 className="text-secondary font-bold text-xs uppercase tracking-wider mb-3 px-2">
              Recent updates
            </h4>
            <div className="space-y-1">
              {recentUpdates.map((item) => (
                <div
                  key={item.userId}
                  onClick={() => onSelectStatus(item.statuses[0].id)}
                  className="flex items-center gap-4 cursor-pointer hover:bg-surface-hover p-3 rounded-2xl transition-colors group active:scale-[0.98]"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectStatus(item.statuses[0].id);
                    }
                  }}
                >
                  <div className="relative">
                    <div className="absolute -inset-0.75 rounded-full bg-linear-to-tr from-primary to-green-400 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-surface rounded-full p-0.5">
                      <Avatar user={item.user} size="lg" showStatus={true} />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-surface flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">
                          NEW
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-bold text-text-main truncate">
                        {item.user.name}
                      </h3>
                      <span className="text-xs text-secondary font-medium">
                        {item.formattedTime}
                      </span>
                    </div>
                    <p className="text-secondary text-sm truncate">
                      {getStatusPreview(
                        item.statuses[item.statuses.length - 1],
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.viewerCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-secondary">
                          <Eye size={10} />
                          {item.viewerCount}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-secondary">
                        <Clock size={10} />
                        {item.statuses.length}{" "}
                        {item.statuses.length === 1 ? "update" : "updates"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Viewed Updates */}
        {viewedUpdates.length > 0 && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-secondary font-bold text-xs uppercase tracking-wider mb-3 px-2">
              Viewed updates
            </h4>
            <div className="space-y-1">
              {viewedUpdates.map((item) => (
                <div
                  key={item.userId}
                  onClick={() => onSelectStatus(item.statuses[0].id)}
                  className="flex items-center gap-4 cursor-pointer hover:bg-surface-hover p-3 rounded-2xl transition-colors opacity-70 hover:opacity-100 active:scale-[0.98]"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectStatus(item.statuses[0].id);
                    }
                  }}
                >
                  <div className="relative">
                    <div className="absolute -inset-0.5 rounded-full border-2 border-border opacity-50"></div>
                    <div className="relative p-0.5">
                      <Avatar user={item.user} size="lg" showStatus={true} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-bold text-text-main truncate">
                        {item.user.name}
                      </h3>
                      <span className="text-xs text-secondary font-medium">
                        {item.formattedTime}
                      </span>
                    </div>
                    <p className="text-secondary text-sm truncate">
                      {getStatusPreview(
                        item.statuses[item.statuses.length - 1],
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.viewerCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-secondary">
                          <Eye size={10} />
                          {item.viewerCount}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-secondary">
                        {item.statuses.length}{" "}
                        {item.statuses.length === 1 ? "update" : "updates"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when no statuses at all */}
        {allGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-hover flex items-center justify-center mb-4 border-2 border-dashed border-border">
              <ImageIcon size={32} className="text-secondary opacity-50" />
            </div>
            <h3 className="font-bold text-text-main mb-2">No Status Updates</h3>
            {(canCreateStatus && !hasMyStatus) ? (
              <>
                <p className="text-secondary text-sm max-w-xs">
                  Share a photo, video, or text update with your contacts
                </p>
                <button
                  onClick={onCreateStatus}
                  className="mt-6 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create Your First Status
                </button>
              </>
            ) : (
              <p className="text-secondary text-sm max-w-xs">
                No status updates available from your contacts
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
