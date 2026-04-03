import { useState, useEffect, useCallback } from "react";
import { getSocket } from "@/utils/socket";
import { UserStatus } from "../types";

export interface PresenceInfo {
  status: UserStatus;
  lastSeen?: string;
}

/**
 * Hook that listens to real-time `user_status_changed` socket events
 * and maintains a live presence map of userId → { status, lastSeen }.
 *
 * The map is cleared on every new socket `connect` so that stale data
 * from a previous user session (logout → login on the same tab) doesn't
 * bleed through.
 */
export function usePresence() {
  const [presenceMap, setPresenceMap] = useState<Map<string, PresenceInfo>>(
    () => new Map()
  );

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleStatusChanged = (data: {
      userId: string;
      status: string;
      lastSeen?: string;
      chatId?: string; // typing events include chatId – ignore those for presence
    }) => {
      // Only handle ONLINE / OFFLINE presence events (not typing/idle)
      if (data.status !== "ONLINE" && data.status !== "OFFLINE") return;

      setPresenceMap((prev) => {
        const next = new Map(prev);
        next.set(data.userId, {
          status: data.status as UserStatus,
          lastSeen: data.lastSeen,
        });
        return next;
      });
    };

    // Clear stale presence data whenever the socket (re)connects.
    // This covers logout → login on the same tab without closing it.
    const handleConnect = () => {
      setPresenceMap(new Map());
    };

    socket.on("connect", handleConnect);
    socket.on("user_status_changed", handleStatusChanged);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("user_status_changed", handleStatusChanged);
    };
  }, []);

  /**
   * Get the real-time presence for a user.
   * Falls back to the data passed as `fallback` if no real-time update
   * has been received for that user yet.
   */
  const getUserPresence = useCallback(
    (
      userId: string,
      fallbackStatus?: UserStatus,
      fallbackLastSeen?: string
    ): PresenceInfo => {
      const live = presenceMap.get(userId);
      if (live) return live;

      return {
        status: fallbackStatus ?? UserStatus.OFFLINE,
        lastSeen: fallbackLastSeen,
      };
    },
    [presenceMap]
  );

  return { getUserPresence };
}
