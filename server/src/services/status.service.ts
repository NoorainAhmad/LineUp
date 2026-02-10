import { z } from "zod";
import { prisma } from "@/config/db.js";
import { statusCreateSchema } from "@/validators/status.validator.js";

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

  // Get all statuses
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
}
