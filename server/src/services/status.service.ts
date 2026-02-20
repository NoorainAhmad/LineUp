import { z } from "zod";
import { prisma } from "../config/db.js";
import { statusCreateSchema, statusReplySchema } from "../validators/status.validator.js";
import { UserRole } from "@/generated/prisma/index.js";

export class StatusService {
  private static statusSelection = {
    id: true,
    type: true,
    content: true,
    color: true,
    media: {
      select: {
        id: true,
        fileKey: true,
        mimeType: true,
        mediaStatus: true,
      },
    },
    user: {
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        phone: true,
      },
    },
    expiresAt: true,
    createdAt: true,
    _count: {
      select: { viewers: true },
    },
  };

  // Get statuses by User ID
  static async getStatusesByUserId(userId: string) {
    try {
      return prisma.status.findMany({
        where: {
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "asc" },
        select: this.statusSelection,
      });
    } catch (error) {
      console.log(`[My Statuses] Error: ${error}`);
      throw new Error("My statuses not found: " + (error as Error).message);
    }
  }

  // Get all statuses (deprecated - use getStatusesRoleBased instead)
  static async getAllStatuses() {
    try {
      return prisma.status.findMany({
        orderBy: { createdAt: "desc" },
        select: this.statusSelection,
      });
    } catch (error) {
      console.log(`[All Statuses] Error: ${error}`);
      throw new Error("All statuses not found: " + (error as Error).message);
    }
  }

  // Get statuses based on user role and hierarchy
  static async getStatusesRoleBased(userId: string, userRole: string) {
    try {
      // First get the current user with their role and relationships
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true,
          parentId: true,
        },
      });

      if (!currentUser) {
        throw new Error("User not found");
      }

      let userIdsToFetch: string[] = [currentUser.id]; // include own statuses

      // Role-based filtering to determine which users' statuses to include
      switch (currentUser.role) {
        case UserRole.DEVELOPER:
          // Developer can see ALL statuses - fetch all users with statuses
          const allUsers = await prisma.user.findMany({
            where: {
              statuses: {
                some: {}, // Has at least one status
              },
            },
            select: { id: true },
          });
          userIdsToFetch = allUsers.map((u) => u.id);
          break;

        case UserRole.MASTER:
          // Master can see statuses from:
          // 1. Direct ADMIN subordinates
          // 2. BRANCH subordinates under those ADMINs
          // 3. USER subordinates under those BRANCHes
          const masterSubordinates = await prisma.user.findMany({
            where: {
              OR: [
                { parentId: currentUser.id }, // Direct ADMINs
                { parent: { parentId: currentUser.id } }, // BRANCHes under ADMINs
                { parent: { parent: { parentId: currentUser.id } } }, // USERs under BRANCHes
              ],
            },
            select: { id: true },
          });
          userIdsToFetch = [currentUser.id, ...masterSubordinates.map((u) => u.id)];
          break;

        case UserRole.ADMIN:
          // Admin can see statuses from:
          // 1. Direct BRANCH subordinates
          // 2. USER subordinates under those BRANCHes
          // 3. Immediate superior (MASTER)
          const adminSubordinates = await prisma.user.findMany({
            where: {
              OR: [
                { parentId: currentUser.id }, // Direct BRANCHes
                { parent: { parentId: currentUser.id } }, // USERs under BRANCHes
              ],
            },
            select: { id: true },
          });
          userIdsToFetch = [currentUser.id, ...adminSubordinates.map((u) => u.id)];
          // Add immediate superior (MASTER)
          if (currentUser.parentId) {
            userIdsToFetch.push(currentUser.parentId);
          }
          break;

        case UserRole.BRANCH:
          // Branch can see statuses from:
          // 1. Direct USER subordinates
          // 2. Immediate superior (ADMIN)
          const branchSubordinates = await prisma.user.findMany({
            where: {
              parentId: currentUser.id, // Direct USERs
            },
            select: { id: true },
          });
          userIdsToFetch = [currentUser.id, ...branchSubordinates.map((u) => u.id)];
          // Add immediate superior (ADMIN)
          if (currentUser.parentId) {
            userIdsToFetch.push(currentUser.parentId);
          }
          break;

        case UserRole.USER:
          // Regular user can only see:
          // 1. Their own status
          // 2. Immediate superior's status (BRANCH)
          if (currentUser.parentId) {
            userIdsToFetch.push(currentUser.parentId);
          }
          break;

        default:
          // Fallback: only user's own statuses
          userIdsToFetch = [currentUser.id];
      }

      // Fetch statuses for the determined users
      return prisma.status.findMany({
        where: {
          userId: { in: userIdsToFetch },
          expiresAt: { gt: new Date() }, // Only non-expired statuses
        },
        orderBy: { createdAt: "desc" },
        select: this.statusSelection,
      });
    } catch (error) {
      console.log(`[Statuses by Role] Error: ${error}`);
      throw new Error(
        "Failed to fetch statuses: " + (error as Error).message,
      );
    }
  }

  // Get feed by user ID
  static async getFeed(userId: string) {
    try {
      const usersWithStatus = await prisma.user.findMany({
        where: {
          statuses: {
            some: {
              expiresAt: { gt: new Date() },
            },
          },
          id: { not: userId },
        },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          statuses: {
            where: { expiresAt: { gt: new Date() } },
            orderBy: { createdAt: "asc" },
            select: this.statusSelection,
          },
        },
      });
      return usersWithStatus;
    } catch (error) {
      console.log(`[Status Feed] Error: ${error}`);
      throw new Error("Status feed not found: " + (error as Error).message);
    }
  }

  // Create a new status
  static async createStatus(
    userId: string,
    data: z.infer<typeof statusCreateSchema>,
  ) {
    try {
      const { mediaId, ...rest } = data;
      const createData: any = { ...rest };
      createData.user = { connect: { id: userId } };
      if (mediaId && (data.type === "IMAGE" || data.type === "VIDEO")) {
        createData.media = { connect: { id: mediaId } };
      }
      return prisma.status.create({
        data: createData,
        select: this.statusSelection,
      });
    } catch (error) {
      console.log(`[Status Creation] Error: ${error}`);
      throw new Error("Status creation failed: " + (error as Error).message);
    }
  }

  // Mark a status as viewed
  static async viewStatus(statusId: string, viewerId: string) {
    try {
      const existingView = await prisma.statusView.findUnique({
        where: {
          statusId_userId: {
            statusId,
            userId: viewerId,
          },
        },
      });
      if (existingView) return existingView;
      return prisma.statusView.create({
        data: {
          statusId,
          userId: viewerId,
        },
      });
    } catch (error) {
      console.log(`[Status View] Error: ${error}`);
      throw new Error("Status view failed: " + (error as Error).message);
    }
  }

  // Delete a status by ID
  static async deleteStatus(id: string, userId: string) {
    try {
      const status = await prisma.status.findUnique({ where: { id } });
      if (!status) throw new Error("Status not found");
      if (status.userId !== userId) throw new Error("Unauthorized delete");
      return prisma.status.delete({
        where: { id },
      });
    } catch (error) {
      console.log(`[Status Deletion] Error: ${error}`);
      throw new Error("Status deletion failed: " + (error as Error).message);
    }
  }

  // Reply to a status — sends a DM to the status owner
  static async replyToStatus(
    statusId: string,
    replierId: string,
    data: z.infer<typeof statusReplySchema>,
  ) {
    try {
      // 1. Get the status with owner info
      const status = await prisma.status.findUnique({
        where: { id: statusId },
        select: {
          id: true,
          type: true,
          content: true,
          userId: true,
          user: { select: { id: true, name: true } },
        },
      });
      if (!status) throw new Error("Status not found");
      if (status.userId === replierId)
        throw new Error("Cannot reply to your own status");

      const statusOwnerId = status.userId;

      // 2. Find or create a DM chat between replier and status owner
      return prisma.$transaction(async (tx) => {
        let chat = await tx.chat.findFirst({
          where: {
            isGroup: false,
            AND: [
              { members: { some: { userId: replierId } } },
              { members: { some: { userId: statusOwnerId } } },
            ],
          },
          select: { id: true },
        });

        if (!chat) {
          chat = await tx.chat.create({
            data: {
              isGroup: false,
              members: {
                create: [
                  { userId: replierId },
                  { userId: statusOwnerId },
                ],
              },
            },
            select: { id: true },
          });
        }

        // 3. Build status context for the message
        const statusPreview =
          status.type === "TEXT"
            ? (status.content?.substring(0, 100) || "Text status").replace(/\n/g, " ")
            : status.type === "IMAGE"
              ? "📷 Photo status"
              : "🎥 Video status";

        const messageContent = `[Status Reply|${statusId}: ${statusPreview}]\n${data.message}`;

        // 4. Send the reply message
        const message = await tx.message.create({
          data: {
            type: "TEXT",
            content: messageContent,
            senderId: replierId,
            chatId: chat.id,
          },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } },
          },
        });

        // 5. Update chat's last message and unread counts
        await tx.chat.update({
          where: { id: chat.id },
          data: {
            lastMessageId: message.id,
            updatedAt: new Date(),
          },
        });

        await tx.chatMember.updateMany({
          where: { chatId: chat.id, userId: { not: replierId } },
          data: { unreadCount: { increment: 1 } },
        });

        return { chatId: chat.id, message };
      });
    } catch (error) {
      console.log(`[Status Reply] Error: ${error}`);
      throw new Error("Status reply failed: " + (error as Error).message);
    }
  }
}
