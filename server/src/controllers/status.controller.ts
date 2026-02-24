import { Response } from "express";
import { StatusService } from "../services/status.service.js";
import { statusCreateSchema, statusReplySchema, statusShareSchema } from "../validators/status.validator.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export class StatusController {
  // Get statuses by User ID
  static async getStatusesByUserId(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId as string;
      const statuses = await StatusService.getStatusesByUserId(userId);
      return res.status(200).json(statuses);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get all statuses based on user hierarchy
  static async getAllStatuses(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId as string;
      const userRole = req.userRole as string;
      const statuses = await StatusService.getStatusesRoleBased(
        userId,
        userRole,
      );
      return res.status(200).json({
        success: true,
        data: statuses,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get feed by User ID
  static async getFeed(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId as string;
      const feed = await StatusService.getFeed(userId);
      return res.status(200).json(feed);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Create a new status
  static async createStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId as string;
      const validatedData = statusCreateSchema.parse(req.body);
      const status = await StatusService.createStatus(userId, validatedData);
      return res.status(201).json(status);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Mark a status as viewed
  static async markAsViewed(req: AuthRequest, res: Response) {
    try {
      const { id: statusId } = req.params as { id: string };
      const viewerId = req.userId as string;
      await StatusService.viewStatus(statusId, viewerId);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Reply to a status
  static async replyToStatus(req: AuthRequest, res: Response) {
    try {
      const { id: statusId } = req.params as { id: string };
      const replierId = req.userId as string;
      const validatedData = statusReplySchema.parse(req.body);
      const result = await StatusService.replyToStatus(
        statusId,
        replierId,
        validatedData,
      );
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get viewers of a status
  static async getViewers(req: AuthRequest, res: Response) {
    try {
      const { id: statusId } = req.params as { id: string };
      const userId = req.userId as string;
      const result = await StatusService.getStatusViewers(statusId, userId);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // Delete a status by ID
  static async deleteStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const userId = req.userId as string;
      await StatusService.deleteStatus(id, userId);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Share a status to one or more chats
  static async shareStatus(req: AuthRequest, res: Response) {
    try {
      const { id: statusId } = req.params as { id: string };
      const sharerId = req.userId as string;
      const validatedData = statusShareSchema.parse(req.body);
      const result = await StatusService.shareStatus(
        statusId,
        sharerId,
        validatedData,
      );
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
