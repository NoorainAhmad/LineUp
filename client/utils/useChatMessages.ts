import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { ChatService, mergeMessages } from "@/services/chat.service";
import type { Message, Chat } from "@/types";
import { getSocket } from "./socket";

const PAGE_SIZE = 50;

export function useChatMessages(chat: Chat | null) {
  const queryClient = useQueryClient();
  const queryKey = ["chat-messages", chat?.id];

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,   // we use "next" to mean "older" (going back in time)
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      if (!chat?.id) return [];

      // pageParam is the oldest message ID we have — fetch messages before it
      // On first load, pageParam is undefined → fetch the latest PAGE_SIZE messages
      const response = await ChatService.getMessages(
        chat.id,
        PAGE_SIZE,
        undefined,          // after
        pageParam           // before (undefined on first load = get latest)
      );

      const newMessages: Message[] = Array.isArray(response.data)
        ? response.data
        : response;

      return newMessages;
    },

    initialPageParam: undefined as string | undefined,

    // getNextPageParam returns the cursor for the NEXT older page.
    // It receives the FIRST page loaded (oldest page so far).
    // If that page returned fewer messages than PAGE_SIZE, we've
    // reached the beginning — return undefined to stop.
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
      // Return the ID of the oldest message as the next `before` cursor
      return String(lastPage[0]?.id);
    },

    enabled: !!chat?.id,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  // Flatten all pages into a single sorted array
  const messages: Message[] = data
    ? mergeMessages([], data.pages.flat())
    : [];

  // Socket event handlers — patch cache directly
  useEffect(() => {
    if (!chat?.id) return;
    const chatId = chat.id;

    const applyMessageToCache = (incomingMessage: Message) => {
      // Append to the LAST page (most recent)
      queryClient.setQueryData<any>(queryKey, (old: any) => {
        if (!old) return old;
        const pages = [...old.pages];
        const lastPage = [...(pages[pages.length - 1] ?? [])];
        const idStr = String(incomingMessage.id);
        if (lastPage.some((m: Message) => String(m.id) === idStr)) return old;
        lastPage.push(incomingMessage);
        pages[pages.length - 1] = lastPage;
        return { ...old, pages };
      });
    };

    const patchMessageInCache = (patch: Partial<Message> & { id: string }) => {
      queryClient.setQueryData<any>(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: Message[]) =>
            page.map((m) =>
              String(m.id) === String(patch.id) ? { ...m, ...patch } : m
            )
          ),
        };
      });
    };

    const handleNewMessage = (data: any) => {
      console.log(`[useChatMessages] new_message received:`, data);
      if (String(data.chatId) !== String(chatId)) return;
      applyMessageToCache(data as Message);
    };

    const handleMessageUpdated = (data: any) => {
      console.log(`[useChatMessages] message_updated received:`, data);
      // Old logic: `if (data.chatId && String(data.chatId) !== String(chatId)) return;`
      // caused events without chatId to be applied to wrong chats
      if (!data.chatId || String(data.chatId) !== String(chatId)) return;
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
    if (socket?.connected) return attachListeners(socket);

    if (socket) {
      let detach = () => {};
      const onConnect = () => {
        detach();
        detach = attachListeners(socket);
      };

      // Case 1: Already connected
      if (socket.connected) {
        onConnect();
      }

      // Case 2: Always listen for reconnections
      socket.on("connect", onConnect);

      return () => {
        socket.off("connect", onConnect);
        detach();
      };
    }

    // Case 3: No socket at all (initSocket() not yet called).
    console.warn(
      `[useChatMessages] No socket instance for chat ${chatId} — listeners NOT attached. ` +
      `Ensure initSocket() is called in AuthContext after login.`
    );

  }, [chat?.id, queryClient, refetch]);

  const resetCursor = useCallback(() => {
    queryClient.removeQueries({ queryKey });
  }, [chat?.id]);

  return {
    messages,
    isLoading,
    error,
    refetch,
    resetCursor,
    fetchOlderMessages: fetchNextPage,   // renamed for clarity at call site
    hasOlderMessages: hasNextPage,
    isFetchingOlder: isFetchingNextPage,
  };
}
