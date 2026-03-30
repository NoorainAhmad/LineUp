import { z } from "zod";
import { prisma } from "../config/db.js";
import {
  sendMessageSchema,
  chatCreateSchema,
  forwardMessageSchema,
} from "../validators/chat.validator.js";
import { HierarchyService } from "@/utils/hierarchy.service.js";
import { KafkaEventService } from "@/services/kafka.service.js";

export class ChatService {
  private static liveMessageInclude = {
    sender: {
      select: {
        id: true,
        name: true,
        role: true,
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
            role: true,
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
        lastDeliveredSeq: true,
        lastReadSeq: true,
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            avatarUrl: true,
            status: true,
            lastSeen: true,
            parentId: true, 
          },
        },
      },
    },
    lastMessageId: true,
    lastMessage: {
      select: {
        id: true,
        type: true,
        content: true,
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
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

      } catch (emitError) {
        console.error(`[Kafka Publish Error] sendMessage:`, emitError);
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
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          senderId: userId,
          isDeleted: false,
        },
      });

      if (!message) {
        throw new Error("Message not found or you don't have permission to edit it");
      }

      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          content: newContent,
          isEdited: true,
        },
        include: {
          chat: { select: { id: true } },
          sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
        },
      });

      // Publish edit event to Kafka
      try {
        const room = `chat:${updatedMessage.chat.id}`;
        
        const members = await prisma.chatMember.findMany({
          where: { chatId: updatedMessage.chat.id },
          select: { userId: true },
        });
        const memberUserIds = members.map((m) => m.userId);
        const allSupervisorIds = new Set<string>();
        for (const uid of memberUserIds) {
          const supervisorIds = await HierarchyService.getAllSupervisorIds(uid);
          supervisorIds.forEach((id) => allSupervisorIds.add(id));
        }
        const allRelevantUserIds = [...new Set([...memberUserIds, ...Array.from(allSupervisorIds)])];

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
          targetUserIds: allRelevantUserIds,
        });
      } catch (emitError) {
        console.error(`[Kafka Publish Error] editMessage: ${emitError}`);
      }

      return updatedMessage;
    } catch (error) {
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
      const hadSameEmoji = reactions[emoji]?.includes(userId) ?? false;
      
      for (const key of Object.keys(reactions)) {
        reactions[key] = reactions[key].filter((id) => id !== userId);
        if (reactions[key].length === 0) delete reactions[key];
      }
      
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
        
        const members = await prisma.chatMember.findMany({
          where: { chatId: updatedMessage.chat.id },
          select: { userId: true },
        });
        const memberUserIds = members.map((m) => m.userId);
        const allSupervisorIds = new Set<string>();
        for (const uid of memberUserIds) {
          const supervisorIds = await HierarchyService.getAllSupervisorIds(uid);
          supervisorIds.forEach((id) => allSupervisorIds.add(id));
        }
        const allRelevantUserIds = [...new Set([...memberUserIds, ...Array.from(allSupervisorIds)])];

        await KafkaEventService.publishMessageUpdated({
          chatId: updatedMessage.chat.id,
          room,
          updateData: {
            id: String(updatedMessage.id),
            chatId: updatedMessage.chat.id,
            reactions: updatedMessage.reactions,
          },
          targetUserIds: allRelevantUserIds,
        });
      } catch (emitError) {
        console.error(`[Kafka Publish Error] toggleReaction: ${emitError}`);
      }

      return updatedMessage;
    } catch (error) {
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

      if (!currentUser) throw new Error("User not found");

      const visibleUserIds = await HierarchyService.getVisibleUserIds(currentUser.id);

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
          ...this.chatSelection,
          _count: {
            select: {
              messages: true,
            },
          },
        },
      });

      const chatsNeedingDeliveredAdvance = chats.filter((chat) => {
        if (!chat.lastMessageId) return false;
        const membership = chat.members.find((member) => member.user.id === userId);
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
      }

      return chats;
    } catch (error) {
      throw new Error("Failed to fetch inbox: " + (error as Error).message);
    }
  }

  // Get messages for a specific chat with role-based access control
  static async getMessages(userId: string, userRole: string, chatId: string, limit = 50, after?: bigint, before?: bigint) {
    try {
      if (!chatId) return [];
      
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!currentUser) return [];

      const relevantUserIds = await HierarchyService.getVisibleUserIds(currentUser.id);

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

      if (!isAuthorizedChat) return [];

      const messages = await prisma.message.findMany({
        where: { chatId, ...(after !== undefined && { id: { gt: after } }),
                ...(before !== undefined && { id: { lt: before } }), },
        take: limit,
        // Older-page fetches use a descending slice so we can reverse it back
        // to oldest -> newest. Initial loads use desc to grab the latest page.
        orderBy: {
          id: before !== undefined ? "desc" : after !== undefined ? "asc" : "desc",
        },
        include: {
          sender: {
            select: { id: true, name: true, avatarUrl: true, role: true },
          },
          medias: {
            include: {
              media: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });
      // If we fetched backwards, reverse so array is always oldest→newest
    const ordered =
      before !== undefined || after === undefined ? messages.reverse() : messages;
        // Advance lastDeliveredSeq (only for forward fetches)
    if (ordered.length > 0 && before === undefined) {
      const maxSeq = ordered[ordered.length - 1].id;
        await prisma.chatMember.updateMany({
          where: {
            userId,
            chatId,
            OR: [
              { lastDeliveredSeq: null },
              { lastDeliveredSeq: { lt: maxSeq } },
            ],
          },
          data: { lastDeliveredSeq: maxSeq },
        });
      }

      return ordered;
    } catch (error) {
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
      const original = await prisma.message.findUnique({
        where: { id: originalMessageId },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
           medias: { select: { mediaId: true, order: true, }},
        },
      });

      if (!original) throw new Error("Original message not found");
      if (original.isDeleted) throw new Error("Cannot forward a deleted message");

      const forwardedMessages = [];

      for (const targetChatId of targetChatIds) {
        const membership = await prisma.chatMember.findUnique({
          where: { userId_chatId: { userId: senderId, chatId: targetChatId } },
        });
        if (!membership) continue;

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
              sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
            },
          });
          if (original.medias.length > 0) {
            await tx.messageMedia.createMany({
              data: original.medias.map((m) => ({
                messageId: msg.id,
                mediaId: m.mediaId,
                order: m.order,
              })),
            });
          }

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

        forwardedMessages.push(message);

        // Publish forwarded message events to Kafka
        try {
          const chatRoom = `chat:${targetChatId}`;
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
            messageData: {
              ...message,
              id: String(message.id),
              replyToId: null,
              forwardedFromId: String(message.forwardedFromId),
            },
            targetRooms: [chatRoom],
            targetUserIds: allRelevantUserIds,
          });

          await KafkaEventService.publishChatUpdated({
            chatId: targetChatId,
            updateData: { chatId: targetChatId, updatedAt: new Date() },
            targetRooms: [chatRoom],
            targetUserIds: allRelevantUserIds,
          });
        } catch (emitError) {
          console.error(`[Kafka Publish Error] forwardMessage:`, emitError);
        }
      }

      return forwardedMessages;
    } catch (error) {
      throw new Error("Message forwarding failed: " + (error as Error).message);
    }
  }

  // Mark a chat as read
  static async markAsRead(chatId: string, userId: string) {
    try {
      const membership = await prisma.chatMember.findUnique({
        where: { userId_chatId: { userId, chatId } },
      });

      if (!membership) return null;

      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        select: { lastMessageId: true },
      });

      const updateData = {
        unreadCount: 0,
        ...(chat?.lastMessageId && {
          lastReadSeq: chat.lastMessageId,
          lastDeliveredSeq: chat.lastMessageId,
        }),
      };

      const result = await prisma.chatMember.update({
        where: { userId_chatId: { userId, chatId } },
        data: updateData,
      });

      try {
        await KafkaEventService.publishMessagesRead({
          chatId,
          room: `chat:${chatId}`,
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
      
      const updated = await prisma.chatMember.update({
        where: { userId_chatId: { userId, chatId } },
        data: { isArchived: !member.isArchived },
      });

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
      } catch (emitError) {
        console.error(`[Kafka Publish Error] toggleArchive:`, emitError);
      }

      return updated;
    } catch (error) {
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

      try {
        const members = await prisma.chatMember.findMany({
          where: { chatId: message.chat.id },
          select: { userId: true },
        });
        const memberUserIds = members.map((m) => m.userId);
        const allSupervisorIds = new Set<string>();
        for (const uid of memberUserIds) {
          const supervisorIds = await HierarchyService.getAllSupervisorIds(uid);
          supervisorIds.forEach((id) => allSupervisorIds.add(id));
        }
        const allRelevantUserIds = [...new Set([...memberUserIds, ...Array.from(allSupervisorIds)])];

        await KafkaEventService.publishMessageUpdated({
          chatId: message.chat.id,
          room: `chat:${message.chat.id}`,
          updateData: {
            id: String(updated.id),
            chatId: message.chat.id,
            isDeleted: true,
            content: "This message has been deleted",
          },
          targetUserIds: allRelevantUserIds,
        });
      } catch (emitError) {
        console.error(`[Kafka Publish Error] deleteMessage: ${emitError}`);
      }

      return updated;
    } catch (error) {
      throw new Error("Delete message failed: " + (error as Error).message);
    }
  }

  // Pin a chat
  static async pinChat(chatId: string, userId: string) {
    try {
      const member = await prisma.chatMember.findUnique({
        where: { userId_chatId: { userId, chatId } },
      });

      if (!member) throw new Error("No such chat exists");

      const updated = await prisma.chatMember.update({
        where: { id: member.id },
        data: { isPinned: !member.isPinned },
      });

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
      } catch (emitError) {
        console.error(`[Kafka Publish Error] pinChat:`, emitError);
      }

      return updated;
    } catch (error) {
      throw new Error("Pin chat failed: " + (error as Error).message);
    }
  }
}
