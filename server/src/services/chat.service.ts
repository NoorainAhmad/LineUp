import { file, z } from "zod";
import { prisma } from "../config/db.js";
import {
  sendMessageSchema,
  chatCreateSchema,
  forwardMessageSchema,
} from "../validators/chat.validator.js";
import { UserRole } from "@/generated/prisma/index.js";
import { HierarchyService } from "@/utils/hierarchy.service.js";

export class ChatService {
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
      return prisma.$transaction(async (tx) => {
        const message = await tx.message.create({
          data: {
            type,
            content,
            senderId,
            chatId,
            replyToId,
          },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } },
          },
        });
        if (mediaIds?.length) {
    await tx.messageMedia.createMany({
      data: mediaIds.map((id: string, index: number) => ({
        messageId: message.id,
        mediaId: id,
        order: index,
      })),
    });
  }
        await tx.chat.update({
          where: { id: chatId },
          data: {
            lastMessageId: message.id,
            updatedAt: new Date(),
          },
        });
        await tx.chatMember.updateMany({
          where: { chatId, userId: { not: senderId } },
          data: { unreadCount: { increment: 1 } },
        });
        return message;
      });
    } catch (error) {
      console.log(`[Message Creation] Error: ${error}`);
      throw new Error("Message creation failed: " + (error as Error).message);
    }
  }

  // Edit a message content
  static async editMessage(
    userId: string,
    messageId: string,
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
          sender: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      return updatedMessage;
    } catch (error) {
      console.log(`[Edit Message] Error: ${error}`);
      throw new Error("Message edit failed: " + (error as Error).message);
    }
  }

  // Reaction logic for a message
  static async toggleReaction(
    messageId: string,
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
      return prisma.message.update({
        where: { id: messageId },
        data: { reactions },
      });
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

      return chats;
    } catch (error) {
      console.error(`[Inbox] Error for user ${userId}:`, error);
      throw new Error("Failed to fetch inbox: " + (error as Error).message);
    }
  }

  // Get messages for a specific chat with role-based access control
  static async getMessages(userId: string, userRole: string, chatId: string, limit = 50, cursor?: string) {
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
    return await prisma.message.findMany({
      where: { chatId },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
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

      // Find original message
      const original = await prisma.message.findUnique({
        where: { id: originalMessageId },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } },
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
      }

      return forwardedMessages;
    } catch (error) {
      console.log(`[Forward Message] Error: ${error}`);
      throw new Error("Message forwarding failed: " + (error as Error).message);
    }
  }

  // Mark a chat as read
  static async markAsRead(chatId: string, userId: string) {
    try {
      return prisma.chatMember.update({
        where: { userId_chatId: { userId, chatId } },
        data: { unreadCount: 0 },
      });
    } catch (error) {
      console.log(`[Mark As Read] Error: ${error}`);
      throw new Error("Mark as read failed: " + (error as Error).message);
    }
  }

  // Toggle archive status for a chat
  static async toggleArchive(chatId: string, userId: string) {
    try {
      const member = await prisma.chatMember.findUnique({
        where: { userId_chatId: { userId, chatId } },
      });
      if (!member) throw new Error("Chat member not found");
      return prisma.chatMember.update({
        where: { userId_chatId: { userId, chatId } },
        data: { isArchived: !member.isArchived },
      });
    } catch (error) {
      console.log(`[Toggle Archive] Error: ${error}`);
      throw new Error("Toggle archive failed: " + (error as Error).message);
    }
  }

  // Delete a message
  static async deleteMessage(messageId: string, userId: string) {
    try {
      const message = await prisma.message.findFirst({
        where: { id: messageId, senderId: userId },
      });
      if (!message) throw new Error("Unauthorized or message not found");
      return prisma.message.update({
        where: { id: messageId },
        data: {
          isDeleted: true,
          content: "This message has been deleted",
        },
      });
    } catch (error) {
      console.log(`[Delete Message] Error: ${error}`);
      throw new Error("Delete message failed: " + (error as Error).message);
    }
  }

  //Pin a message
  static async pinChat(chatId: string, userId: string) {
    const member = await prisma.chatMember.findFirst({
      where: { userId, chatId },
    });

    if (!member) throw new Error("No such chat exists");

    return prisma.chatMember.update({
      where: { id: member.id },
      data: {
        isPinned: !member.isPinned, // 🔥 toggle instead of always true
      },
    });
  }
}
