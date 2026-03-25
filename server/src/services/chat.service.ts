import { file, z } from "zod";
import { prisma } from "../config/db.js";
import {
  sendMessageSchema,
  chatCreateSchema,
  forwardMessageSchema,
} from "../validators/chat.validator.js";
import { UserRole } from "@/generated/prisma/index.js";
import { HierarchyService } from "@/utils/hierarchy.service.js";
import { KafkaEventService } from "@/services/kafka.service.js";

export class ChatService {
  private static liveMessageInclude = {
    sender: {
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    },
    medias: {
      include: {
        media: {
          select: {
            id: true,
            fileKey: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
          },
        },
      },
      orderBy: { order: "asc" as const },
    },
  };

  private static async hydrateMessagesForRealtime(messageIds: bigint[]) {
    if (messageIds.length === 0) return [];

    return prisma.message.findMany({
      where: { id: { in: messageIds } },
      include: this.liveMessageInclude,
      orderBy: { id: "asc" as const },
    });
  }

  private static chatSelection = {
    id: true,
    isGroup: true,
    groupName: true,
    groupImage: true,
    messages: {
      select: {
        id: true,
        type: true,
        content: true,
        replyToId: true,
        forwardedFromId: true,
        originalSenderId: true,
        isEdited: true,
        isDeleted: true,
        reactions: true,
        medias: {
  select: {
    order: true,
    media: {
      select: {
        id: true,
        fileKey: true,
        originalName: true,
        mimeType: true,
        fileSize: true,
      },
    },
  },
},
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        createdAt: true,
      },
    },
    members: {
      select: {
        unreadCount: true,
        isPinned: true,
        isMuted: true,
        isArchived: true,
        joinedAt: true,
        lastDeliveredSeq: true,  // ← ADD
        lastReadSeq: true,  
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            status: true,
            lastSeen: true,
            parentId: true,
          },
        },
      },
    },
    lastMessage: {
      select: {
        id: true,
        type: true,
        content: true,
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        createdAt: true,
      },
    },
    createdAt: true,
    updatedAt: true,
  };

  // Create a new chat
  static async createChat(
    userId: string,
    data: z.infer<typeof chatCreateSchema>,
  ) {
    try {
      const { isGroup, groupName, groupImage, memberIds } = data;
      const allIds = [...new Set([...memberIds, userId])];
      if (!isGroup && allIds.length === 2) {
        const existing = await prisma.chat.findFirst({
          where: {
            isGroup: false,
            AND: [
              { members: { some: { userId: allIds[0] } } },
              { members: { some: { userId: allIds[1] } } },
            ],
          },
          select: this.chatSelection,
        });
        if (existing) return existing;
      }
      return prisma.chat.create({
        data: {
          isGroup,
          groupName,
          groupImage,
          members: {
            create: allIds.map((id) => ({ userId: id })),
          },
        },
        select: this.chatSelection,
      });
    } catch (error) {
      console.log(`[Chat Creation] Error: ${error}`);
      throw new Error("Chat creation failed: " + (error as Error).message);
    }
  }

  // Send a message
  static async sendMessage(
    senderId: string,
    data: z.infer<typeof sendMessageSchema>,
  ) {
    try {
      const { chatId, content, type, replyToId, mediaIds } = data;
      // 🔒 CRITICAL: Check membership
  const membership = await prisma.chatMember.findUnique({
    where: {
      userId_chatId: {
        userId: senderId,
        chatId: chatId,
      },
    },
  });

  if (!membership) {
    throw new Error("You are not a member of this chat. Read-only access only.");
  }
console.log("Send message data", data)
console.log(" Media IDs", mediaIds)
      const createdMessageIds = await prisma.$transaction(async (tx) => {
        const messageIds: bigint[] = [];

if (mediaIds?.length) {
  for (const mediaId of mediaIds) {
    const msg = await tx.message.create({
      data: {
        type,
        content,
        senderId,
        chatId,
        replyToId,
      },
    });

    await tx.messageMedia.create({
      data: {
        messageId: msg.id,
        mediaId,
        order: 0,
      },
    });

    messageIds.push(msg.id);
  }
} else {
  const msg = await tx.message.create({
    data: {
      type,
      content,
      senderId,
      chatId,
      replyToId,
    },
  });

  messageIds.push(msg.id);
}
const lastMessageId = messageIds[messageIds.length - 1];
        await tx.chat.update({
          where: { id: chatId },
          data: {
            lastMessageId,
            updatedAt: new Date(),
          },
        });
        await tx.chatMember.updateMany({
          where: { chatId, userId: { not: senderId } },
          data: { unreadCount: { increment: messageIds.length } },
        });
        return messageIds;
      });

      const createdMessages = await this.hydrateMessagesForRealtime(createdMessageIds);

      // Publish events to Kafka for async Socket.io delivery
      try {
        const chatRoom = `chat:${chatId}`;

        // Fetch all member userIds for fan-out to personal rooms
        const members = await prisma.chatMember.findMany({
          where: { chatId },
          select: { userId: true },
        });
        const memberUserIds = members.map((m) => m.userId);

        // Find ALL supervisors (up the hierarchy chain) for each member
        const allSupervisorIds = new Set<string>();
        for (const uid of memberUserIds) {
          const supervisorIds = await HierarchyService.getAllSupervisorIds(uid);
          supervisorIds.forEach((id) => allSupervisorIds.add(id));
        }

        const allRelevantUserIds = [...new Set([...memberUserIds, ...Array.from(allSupervisorIds)])];

        console.log(`[Kafka] Publishing new_message for chat ${chatId} to ${allRelevantUserIds.length} users`);

        for (const message of createdMessages) {
          const messageData = {
            id: String(message.id),
            type: message.type,
            content: message.content,
            senderId: message.senderId,
            chatId: message.chatId,
            replyToId: message.replyToId ? String(message.replyToId) : null,
            sender: message.sender,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
            isEdited: message.isEdited,
            isDeleted: message.isDeleted,
            medias: message.medias,
          };

          await KafkaEventService.publishNewMessage({
            chatId,
            messageData,
            targetRooms: [chatRoom],
            targetUserIds: allRelevantUserIds,
          });
        }

        const chatUpdateData = { chatId, updatedAt: new Date() };
        await KafkaEventService.publishChatUpdated({
          chatId,
          updateData: chatUpdateData,
          targetRooms: [chatRoom],
          targetUserIds: allRelevantUserIds,
        });

        console.log(`[Kafka] Finished publishing events for chat ${chatId}`);
      } catch (emitError) {
        console.error(`[Kafka Publish Error] sendMessage:`, emitError);
        console.error(`[Kafka Publish Error] Stack:`, (emitError as Error).stack);
      }

      return createdMessages;
    } catch (error) {
      console.log(`[Message Creation] Error: ${error}`);
      throw new Error("Message creation failed: " + (error as Error).message);
    }
  }

  // Edit a message content
  static async editMessage(
    userId: string,
    messageId: bigint,
    newContent: string,
  ) {
    try {
      // Verify the message exists and belongs to the user
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          senderId: userId,
          isDeleted: false, // Can't edit deleted messages
        },
      });

      if (!message) {
        throw new Error(
          "Message not found or you don't have permission to edit it",
        );
      }

      // Check if message is too old to edit (optional - 1 hour limit)
      // const messageAge = Date.now() - new Date(message.createdAt).getTime();
      // const oneHourInMs = 60 * 60 * 1000;
      // if (messageAge > oneHourInMs) {
      //   throw new Error("Messages older than 1 hour cannot be edited");
      // }

      // Update the message
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          content: newContent,
          isEdited: true,
        },
        include: {
          chat: { select: { id: true } },
          sender: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      // Publish edit event to Kafka
      try {
        const room = `chat:${updatedMessage.chat.id}`;
        await KafkaEventService.publishMessageUpdated({
          chatId: updatedMessage.chat.id,
          room,
          updateData: {
            id: String(updatedMessage.id),
            chatId: updatedMessage.chat.id,
            content: updatedMessage.content,
            isEdited: updatedMessage.isEdited,
            updatedAt: updatedMessage.updatedAt,
          },
        });
      } catch (emitError) {
        console.error(`[Kafka Publish Error] editMessage: ${emitError}`);
      }

      return updatedMessage;
    } catch (error) {
      console.log(`[Edit Message] Error: ${error}`);
      throw new Error("Message edit failed: " + (error as Error).message);
    }
  }

  // Reaction logic for a message
  static async toggleReaction(
    messageId: bigint,
    userId: string,
    emoji: string,
  ) {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId, isDeleted: false, chat: { members: { some: { userId } } } },
      });
      if (!message) throw new Error("Message not found");
      let reactions = (message.reactions as Record<string, string[]>) || {};
      // If user already has this same emoji => remove it (toggle off)
    const hadSameEmoji = reactions[emoji]?.includes(userId) ?? false;
    // Remove user's reaction from all emojis first (single reaction rule)
    for (const key of Object.keys(reactions)) {
      reactions[key] = reactions[key].filter((id) => id !== userId);
      if (reactions[key].length === 0) delete reactions[key];
    }
    // If it was a different/new emoji, add it
    if (!hadSameEmoji) {
      if (!reactions[emoji]) reactions[emoji] = [];
      reactions[emoji].push(userId);
    }
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { reactions },
        include: { chat: { select: { id: true } } },
      });

      // Publish reaction event to Kafka
      try {
        const room = `chat:${updatedMessage.chat.id}`;
        await KafkaEventService.publishMessageUpdated({
          chatId: updatedMessage.chat.id,
          room,
          updateData: {
            id: String(updatedMessage.id),
            chatId: updatedMessage.chat.id,
            reactions: updatedMessage.reactions,
          },
        });
      } catch (emitError) {
        console.error(`[Kafka Publish Error] toggleReaction: ${emitError}`);
      }

      return updatedMessage;
    } catch (error) {
      console.log(`[Reaction Toggle] Error: ${error}`);
      throw new Error("Reaction toggle failed: " + (error as Error).message);
    }
  }

  // Get inbox chats for a user
  static async getInbox(userId: string) {
    try {
      return prisma.chat.findMany({
        where: { members: { some: { userId } } },
        orderBy: { updatedAt: "desc" },
        select: this.chatSelection,
      });
    } catch (error) {
      console.log(`[Inbox] Error: ${error}`);
      throw new Error("Inbox not found: " + (error as Error).message);
    }
  }

  // Get inbox chats for a user with role-based visibility
  static async getInboxRoleBased(userId: string) {
    try {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
      });

      if (!currentUser) {
        throw new Error("User not found");
      }

      const visibleUserIds = await HierarchyService.getVisibleUserIds(
        currentUser.id,
      );

      // Fetch chats with the constructed condition
      const chats = await prisma.chat.findMany({
        where: {
          members: {
            some: {
              userId: { in: visibleUserIds },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          isGroup: true,
          groupName: true,
          groupImage: true,
          createdAt: true,
          updatedAt: true,
          lastMessageId: true,
          lastMessage: {
            select: {
              id: true,
              content: true,
              type: true,
              createdAt: true,
              senderId: true,
              sender: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
          members: {
            select: {
              id: true,
              userId: true,
              unreadCount: true,
              isPinned: true,
              isMuted: true,
              isArchived: true,
              joinedAt: true,
              lastDeliveredSeq: true,
              lastReadSeq: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  status: true,
                  lastSeen: true,
                  role: true,
                  parentId: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
      });

      const chatsNeedingDeliveredAdvance = chats.filter((chat) => {
        if (!chat.lastMessageId) return false;

        const membership = chat.members.find((member) => member.userId === userId);
        return (
          !!membership &&
          (membership.lastDeliveredSeq === null ||
            membership.lastDeliveredSeq < chat.lastMessageId)
        );
      });

      if (chatsNeedingDeliveredAdvance.length > 0) {
        await prisma.$transaction(
          chatsNeedingDeliveredAdvance.map((chat) =>
            prisma.chatMember.updateMany({
              where: {
                userId,
                chatId: chat.id,
                OR: [
                  { lastDeliveredSeq: null },
                  { lastDeliveredSeq: { lt: chat.lastMessageId! } },
                ],
              },
              data: { lastDeliveredSeq: chat.lastMessageId! },
            }),
          ),
        );

        chatsNeedingDeliveredAdvance.forEach((chat) => {
          const membership = chat.members.find((member) => member.userId === userId);
          if (membership) {
            membership.lastDeliveredSeq = chat.lastMessageId;
          }
        });
      }

      return chats;
    } catch (error) {
      console.error(`[Inbox] Error for user ${userId}:`, error);
      throw new Error("Failed to fetch inbox: " + (error as Error).message);
    }
  }

  // Get messages for a specific chat with role-based access control
  static async getMessages(userId: string, userRole: string, chatId: string, limit = 50, after?: bigint) {
    try {
      if (!chatId) return [];
      // Verify user has access to the chat based on role
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
      });
      if (!currentUser) {
        return [];
      }
      const relevantUserIds = await HierarchyService.getVisibleUserIds(
        currentUser.id,
      );
      // 3️⃣ CRITICAL SECURITY CHECK: Verify chat belongs to hierarchy
    const isAuthorizedChat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        members: {
          some: {
            userId: { in: relevantUserIds },
          },
        },
      },
      select: { id: true },
    });

    if (!isAuthorizedChat) {
      console.warn(
        `[SECURITY] Unauthorized chat access blocked | user=${userId} role=${userRole} chat=${chatId}`
      );
      return []; // or throw 403
    }
     // 4️⃣ Only fetch messages AFTER authorization passes
    const messages = await prisma.message.findMany({
      where: { chatId, ...(after !== undefined && { id: { gt: after } }), },
      take: limit,
      orderBy: { id: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
        medias: {
          include: {
            media: true,
          },
          orderBy: { order: "asc" },
        },
        asLastMessage: { select: { id: true } },
      },
    });
    // ── Advance lastDeliveredSeq (side effect, best-effort) ──
      //
      // We only advance — never move the pointer backwards.
      // Using updateMany with a condition is safe and index-backed.
      // Runs even when messages[] is empty (pointer was already up to date).
      if (messages.length > 0) {
        const maxSeq = messages[messages.length - 1].id; // messages ordered asc

        await prisma.chatMember.updateMany({
          where: {
            userId,
            chatId,
            // Only update if the new seq is actually higher.
            // Prisma doesn't support "update if new value > old value" directly,
            // so we use a raw conditional. This avoids unnecessary writes.
            OR: [
              { lastDeliveredSeq: null },
              { lastDeliveredSeq: { lt: maxSeq } },
            ],
          },
          data: { lastDeliveredSeq: maxSeq },
        });
      }

      return messages;
    } catch (error) {
      console.log(`[Messages] Error: ${error}`);
      throw new Error("Messages not found: " + (error as Error).message);
    }
  }

  // Forward a message to one or more chats
  static async forwardMessage(
    senderId: string,
    data: z.infer<typeof forwardMessageSchema>,
  ) {
    try {
      const { originalMessageId, targetChatIds } = data;
      // Kafka will handle socket emission

      // Find original message
      const original = await prisma.message.findUnique({
        where: { id: originalMessageId },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } },
          chat: { select: { id: true } },
        },
      });

      if (!original) throw new Error("Original message not found");
      if (original.isDeleted) throw new Error("Cannot forward a deleted message");

      const forwardedMessages = [];

      for (const targetChatId of targetChatIds) {
        // Verify sender is a member of the target chat
        const membership = await prisma.chatMember.findUnique({
          where: { userId_chatId: { userId: senderId, chatId: targetChatId } },
        });
        if (!membership) {
          console.log(`[Forward] User ${senderId} is not a member of chat ${targetChatId}, skipping.`);
          continue;
        }

        const message = await prisma.$transaction(async (tx) => {
          const msg = await tx.message.create({
            data: {
              type: original.type,
              content: original.content,
              senderId,
              chatId: targetChatId,
              forwardedFromId: original.id,
              originalSenderId: original.senderId,
            },
            include: {
              sender: { select: { id: true, name: true, avatarUrl: true } },
            },
          });

          await tx.chat.update({
            where: { id: targetChatId },
            data: {
              lastMessageId: msg.id,
              updatedAt: new Date(),
            },
          });

          await tx.chatMember.updateMany({
            where: { chatId: targetChatId, userId: { not: senderId } },
            data: { unreadCount: { increment: 1 } },
          });

          return msg;
        });

        forwardedMessages.push({
          ...message,
          originalSenderName: original.sender.name,
        });

        // Publish forwarded message events to Kafka
        try {
          const messageData = {
            id: String(message.id),
            type: message.type,
            content: message.content,
            chatId: targetChatId,
            senderId: message.senderId,
            replyToId: message.replyToId ? String(message.replyToId) : null,
            sender: message.sender,
            createdAt: message.createdAt,
            isEdited: message.isEdited,
            isDeleted: message.isDeleted,
            forwardedFromId: message.forwardedFromId ? String(message.forwardedFromId) : null,
            originalSenderId: message.originalSenderId,
          };

          const chatRoom = `chat:${targetChatId}`;

          // Get all members of the target chat and include supervisors
          const targetChat = await prisma.chat.findUnique({
            where: { id: targetChatId },
            select: { members: { select: { userId: true } } },
          });

          let allRelevantUserIds: string[] = [];
          if (targetChat) {
            const memberUserIds = targetChat.members.map((m) => m.userId);
            const allSupervisorIds = new Set<string>();
            for (const uid of memberUserIds) {
              const supervisorIds = await HierarchyService.getAllSupervisorIds(uid);
              supervisorIds.forEach((id) => allSupervisorIds.add(id));
            }
            allRelevantUserIds = [...new Set([...memberUserIds, ...Array.from(allSupervisorIds)])];
          }

          await KafkaEventService.publishNewMessage({
            chatId: targetChatId,
            messageData,
            targetRooms: [chatRoom],
            targetUserIds: allRelevantUserIds,
          });

          const chatUpdateData = { chatId: targetChatId, updatedAt: new Date() };
          await KafkaEventService.publishChatUpdated({
            chatId: targetChatId,
            updateData: chatUpdateData,
            targetRooms: [chatRoom],
            targetUserIds: allRelevantUserIds,
          });

          console.log(`[Kafka] Forwarded message published for chat ${targetChatId}`);
        } catch (emitError) {
          console.error(`[Kafka Publish Error] forwardMessage:`, emitError);
        }
      }

      return forwardedMessages;
    } catch (error) {
      console.log(`[Forward Message] Error: ${error}`);
      throw new Error("Message forwarding failed: " + (error as Error).message);
    }
  }

  // Mark a chat as read
  // Advances lastReadSeq to the latest message in chat.
  // Called when the user opens a chat.
  static async markAsRead(chatId: string, userId: string) {
    try {
      // FIX: Verify the caller is actually a member of this chat before
      // attempting any writes. Supervisors/admins can VIEW chats they don't
      // belong to, but they have no ChatMember row — so update() throws
      // "record not found". We silently no-op for non-members since
      // marking-as-read is meaningless for read-only viewers.
      const membership = await prisma.chatMember.findUnique({
        where: { userId_chatId: { userId, chatId } },
        select: { userId: true },
      });

      if (!membership) {
        console.log(
          `[Mark As Read] User ${userId} is not a member of chat ${chatId} — skipping (read-only access).`
        );
        return null;
      }

      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        select: { lastMessageId: true },
      });

      let result;
      if (!chat?.lastMessageId) {
        result = await prisma.chatMember.update({
          where: { userId_chatId: { userId, chatId } },
          data: { unreadCount: 0 },
        });
      } else {
        result = await prisma.chatMember.update({
          where: { userId_chatId: { userId, chatId } },
          data: {
            unreadCount: 0,
            lastReadSeq: chat.lastMessageId,
            lastDeliveredSeq: chat.lastMessageId,
          },
        });
      }

      // Publish read event to Kafka
      try {
        const room = `chat:${chatId}`;
        await KafkaEventService.publishMessagesRead({
          chatId,
          room,
          readData: {
            chatId,
            userId,
            lastReadSeq: chat?.lastMessageId ? String(chat.lastMessageId) : null,
          },
        });
      } catch (emitError) {
        console.error(`[Kafka Publish Error] markAsRead: ${emitError}`);
      }

      return result;
    } catch (error) {
      console.log(`[Mark As Read] Error: ${error}`);
      throw new Error("Mark as read failed");
    }
  }


  // Toggle archive status for a chat
  static async toggleArchive(chatId: string, userId: string) {
    try {
      const member = await prisma.chatMember.findUnique({
        where: { userId_chatId: { userId, chatId } },
      });
      if (!member) throw new Error("Chat member not found");
      
      const updated = await prisma.chatMember.update({
        where: { userId_chatId: { userId, chatId } },
        data: { isArchived: !member.isArchived },
      });

      // Publish archive event to Kafka
      try {
        await KafkaEventService.publishChatUpdated({
          chatId,
          updateData: {
            chatId,
            isArchived: updated.isArchived,
            updatedAt: new Date(),
          },
          targetRooms: [],
          targetUserIds: [userId],
        });
        console.log(`[Kafka] toggleArchive published for user ${userId}, chat ${chatId}`);
      } catch (emitError) {
        console.error(`[Kafka Publish Error] toggleArchive:`, emitError);
      }

      return updated;
    } catch (error) {
      console.log(`[Toggle Archive] Error: ${error}`);
      throw new Error("Toggle archive failed: " + (error as Error).message);
    }
  }

  // Delete a message
  static async deleteMessage(messageId: bigint, userId: string) {
    try {
      const message = await prisma.message.findFirst({
        where: { id: messageId, senderId: userId },
        include: { chat: { select: { id: true } } },
      });
      if (!message) throw new Error("Unauthorized or message not found");

      const updated = await prisma.message.update({
        where: { id: messageId },
        data: {
          isDeleted: true,
          content: "This message has been deleted",
        },
      });

      // Publish deletion as message_updated event to Kafka
      try {
        const room = `chat:${message.chat.id}`;
        await KafkaEventService.publishMessageUpdated({
          chatId: message.chat.id,
          room,
          updateData: {
            id: String(updated.id),
            chatId: message.chat.id,
            isDeleted: true,
            content: "This message has been deleted",
          },
        });
      } catch (emitError) {
        console.error(`[Kafka Publish Error] deleteMessage: ${emitError}`);
      }

      return updated;
    } catch (error) {
      console.log(`[Delete Message] Error: ${error}`);
      throw new Error("Delete message failed: " + (error as Error).message);
    }
  }

  //Pin a chat
  static async pinChat(chatId: string, userId: string) {
    try {
      const member = await prisma.chatMember.findFirst({
        where: { userId, chatId },
      });

      if (!member) throw new Error("No such chat exists");

      const updated = await prisma.chatMember.update({
        where: { id: member.id },
        data: {
          isPinned: !member.isPinned, // 🔥 toggle instead of always true
        },
      });

      // Publish pin event to Kafka
      try {
        await KafkaEventService.publishChatUpdated({
          chatId,
          updateData: {
            chatId,
            isPinned: updated.isPinned,
            updatedAt: new Date(),
          },
          targetRooms: [],
          targetUserIds: [userId],
        });
        console.log(`[Kafka] pinChat published for user ${userId}, chat ${chatId}`);
      } catch (emitError) {
        console.error(`[Kafka Publish Error] pinChat:`, emitError);
      }

      return updated;
    } catch (error) {
      console.log(`[Pin Chat] Error: ${error}`);
      throw new Error("Pin chat failed: " + (error as Error).message);
    }
  }
}
