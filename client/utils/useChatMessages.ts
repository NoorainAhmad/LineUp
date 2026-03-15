import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useCallback, useEffect } from "react";
import { ChatService } from "@/services/chat.service";
import type { Message, Chat } from "@/types";
import { getSocket } from "./socket";

export function useChatMessages(chat: Chat | null) {
  const queryClient = useQueryClient();

  // Tracks the highest message id we've seen for this chat.
  // Persists across re-renders but resets when chat changes (see useEffect below).
  const lastKnownSeqRef = useRef<bigint | undefined>(undefined);

  const queryKey = ["chat-messages", chat?.id];

  const { data: messages = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!chat?.id) return [];

      try {
        const response = await ChatService.getMessages(
          chat.id,
          50,
          lastKnownSeqRef.current?.toString()
        );

        const newMessages: Message[] = Array.isArray(response.data)
          ? response.data
          : response;

        if (newMessages.length === 0) {
          // Nothing new — return existing cache untouched (cheap poll)
          return (
            queryClient.getQueryData<Message[]>(queryKey) ?? []
          );
        }

        // Advance our local cursor to the highest id in this batch
        // Advance our local cursor to the highest id in this batch
        const maxSeq = newMessages.reduce<bigint>(
        (max, m) => {
            const curr = BigInt(m.id);
            return curr > max ? curr : max;
        },
        lastKnownSeqRef.current ?? 0n
        );

        lastKnownSeqRef.current = maxSeq;

        // Merge with existing messages (append-only, deduplicated)
        const existing =
          queryClient.getQueryData<Message[]>(queryKey) ?? [];
        const existingIds = new Set(existing.map((m) => String(m.id)));
        const merged = [
          ...existing,
          ...newMessages.filter((m) => !existingIds.has(String(m.id))),
        ].sort((a, b) => {
          // Sort by id (BIGSERIAL) — safer than createdAt for ordering
          return Number(BigInt(a.id) - BigInt(b.id));
        });

        return merged;
      } catch (error) {
        console.error("Error fetching messages:", error);
        return queryClient.getQueryData<Message[]>(queryKey) ?? [];
      }
    },

    enabled: !!chat?.id,
    refetchOnWindowFocus: false,

    // Don't treat data as stale immediately — we're merging incrementally
    staleTime: Infinity,

    // Merge with pending messages for optimistic display
    select: (data) => {
      const pendingMessages =
        queryClient.getQueryData<Message[]>(["pending-messages", chat?.id]) ??
        [];
      // Pending messages go at the end (they have fake ids like "pending-xxx")
      return [...data, ...pendingMessages];
    },
  });

  useEffect(() => {
    if (!chat?.id) return;

    const socket = getSocket();
    if (!socket) return;

    const handleMessageUpdate = (data: any) => {
      if (data.chatId !== chat.id) return;
      
      // Invalidate the query to force a fresh fetch of messages and statuses
      queryClient.invalidateQueries({ queryKey });
    };

    // Listen for all direct message changes
    socket.on("new_message", handleMessageUpdate);
    socket.on("message_updated", handleMessageUpdate);
    socket.on("messages_read", handleMessageUpdate);

    return () => {
      socket.off("new_message", handleMessageUpdate);
      socket.off("message_updated", handleMessageUpdate);
      socket.off("messages_read", handleMessageUpdate);
    };
  }, [chat?.id, queryClient, queryKey[1]]);

  // Call this when switching chats to reset the cursor
  const resetCursor = useCallback(() => {
    lastKnownSeqRef.current = undefined;
    queryClient.setQueryData(queryKey, []);
  }, [chat?.id]);

  return { messages, isLoading, error, refetch, resetCursor };
}