import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useCallback, useEffect } from "react";
import { ChatService } from "@/services/chat.service";
import type { Message, Chat } from "@/types";
import { getSocket } from "./socket";

export function useChatMessages(chat: Chat | null) {
  const queryClient = useQueryClient();

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
          return queryClient.getQueryData<Message[]>(queryKey) ?? [];
        }

        const maxSeq = newMessages.reduce<bigint>(
          (max, m) => {
            const curr = BigInt(m.id);
            return curr > max ? curr : max;
          },
          lastKnownSeqRef.current ?? 0n
        );

        lastKnownSeqRef.current = maxSeq;

        const existing = queryClient.getQueryData<Message[]>(queryKey) ?? [];
        const existingIds = new Set(existing.map((m) => String(m.id)));
        const merged = [
          ...existing,
          ...newMessages.filter((m) => !existingIds.has(String(m.id))),
        ].sort((a, b) => Number(BigInt(a.id) - BigInt(b.id)));

        return merged;
      } catch (error) {
        console.error("Error fetching messages:", error);
        return queryClient.getQueryData<Message[]>(queryKey) ?? [];
      }
    },

    enabled: !!chat?.id,
    refetchOnWindowFocus: false,
    staleTime: Infinity,

    select: (data) => {
      const pendingMessages =
        queryClient.getQueryData<Message[]>(["pending-messages", chat?.id]) ?? [];
      return [...data, ...pendingMessages];
    },
  });

  useEffect(() => {
    if (!chat?.id) return;

    const chatId = chat.id;

    const applyMessageToCache = (incomingMessage: Message) => {
      queryClient.setQueryData<Message[]>(
        ["chat-messages", chatId],
        (existing = []) => {
          const idStr = String(incomingMessage.id);
          if (existing.some((m) => String(m.id) === idStr)) return existing;
          return [...existing, incomingMessage].sort(
            (a, b) => Number(BigInt(a.id) - BigInt(b.id))
          );
        }
      );
    };

    const patchMessageInCache = (patch: Partial<Message> & { id: string }) => {
      queryClient.setQueryData<Message[]>(
        ["chat-messages", chatId],
        (existing = []) =>
          existing.map((m) =>
            String(m.id) === String(patch.id) ? { ...m, ...patch } : m
          )
      );
    };

    const handleNewMessage = (data: any) => {
      console.log(`[useChatMessages] new_message received:`, data);
      if (String(data.chatId) !== String(chatId)) return;
      applyMessageToCache(data as Message);
    };

    const handleMessageUpdated = (data: any) => {
      console.log(`[useChatMessages] message_updated received:`, data);
      if (data.chatId && String(data.chatId) !== String(chatId)) return;
      patchMessageInCache(data);
    };

    const handleMessagesRead = (data: any) => {
      console.log(`[useChatMessages] messages_read received:`, data);
      if (String(data.chatId) !== String(chatId)) return;
      refetch();
    };

    const attachListeners = (s: NonNullable<ReturnType<typeof getSocket>>) => {
      console.log(`[useChatMessages] Attaching listeners for chat ${chatId} (socket ${s.id})`);
      s.on("new_message", handleNewMessage);
      s.on("message_updated", handleMessageUpdated);
      s.on("messages_read", handleMessagesRead);
      return () => {
        console.log(`[useChatMessages] Removing listeners for chat ${chatId}`);
        s.off("new_message", handleNewMessage);
        s.off("message_updated", handleMessageUpdated);
        s.off("messages_read", handleMessagesRead);
      };
    };

    const socket = getSocket();

    // Case 1: Socket already connected — attach listeners immediately.
    if (socket?.connected) {
      return attachListeners(socket);
    }

    // Case 2: Socket exists but still connecting (handshake in progress).
    // Defer listener attachment until the 'connect' event fires.
    // THIS is the race condition that was causing missed messages:
    // the effect ran before the WebSocket handshake completed, so
    // socket.connected was false and listeners were never attached.
    if (socket) {
      console.log(`[useChatMessages] Socket connecting — queuing listener attach for chat ${chatId}`);
      let detachListeners = () => {};

      const onConnect = () => {
        detachListeners = attachListeners(socket);
      };

      socket.once("connect", onConnect);

      return () => {
        socket.off("connect", onConnect); // cancel if effect cleans up before connect
        detachListeners();
      };
    }

    // Case 3: No socket at all (initSocket() not yet called).
    console.warn(
      `[useChatMessages] No socket instance for chat ${chatId} — listeners NOT attached. ` +
      `Ensure initSocket() is called in AuthContext after login.`
    );

  }, [chat?.id, queryClient, refetch]);

  const resetCursor = useCallback(() => {
    lastKnownSeqRef.current = undefined;
    queryClient.setQueryData(queryKey, []);
  }, [chat?.id]);

  return { messages, isLoading, error, refetch, resetCursor };
}