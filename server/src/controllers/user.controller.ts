import { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import {
  userCreateSchema,
  userUpdateSchema,
} from "@/validators/user.validator.js";
import { AuthRequest } from "@/middlewares/auth.middleware.js";
import { UserRole } from "@/generated/prisma/index.js";

export class UserController {
  // Get a single user
  static async getUserById(req: AuthRequest, res: Response) {
    const userId = req.userId;
    const requestedUserId = req.params.id as string;
    const userRole = req.userRole;
    if (userRole == UserRole.USER) {
      if (userId !== requestedUserId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    try {
      const user = await UserService.getUserById(req.params.id as string);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get all users
  static async getAllUsers(_req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get branch info of a User
  static async getBranchInfo(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId as string; 
      const branchInfo = await UserService.getBranchInfo(userId);
      return res.status(200).json(branchInfo);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } 

  // Get user subordinates
  static async getUserSubordinates(req: Request, res: Response) {
    try {
      const subordinates = await UserService.getUserSubordinates(
        req.params.id as string,
      );
      return res.status(200).json(subordinates);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Search users
  static async searchUsers(req: Request, res: Response) {
    if (!req.query.q) return res.status(400).json({ error: "Missing query" });
    try {
      const users = await UserService.searchUsers(req.query.q as string);
      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

    // Team members
  static async teamMembers(req: AuthRequest, res: Response) {
    try {
      const currentUserId = req.userId as string; 
      const userRole = req.userRole; 

      if (!currentUserId && !(userRole == UserRole.USER)) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      } 

      const results = await UserService.teamMembers(currentUserId);

      return res.status(200).json(results);
    } catch (error: any) {
      console.error("Team error:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Search team members
  static async searchTeamMembers(req: AuthRequest, res: Response) {
    try {
      const currentUserId = req.userId as string;
      const query = req.query.q as string;

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      if (!query) {
        return res.status(400).json({
          success: false,
          error: "Missing search query",
        });
      }

      const results = await UserService.searchTeamMembers(currentUserId, query);

      return res.status(200).json(results);
    } catch (error: any) {
      console.error("Team search error:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Create a new user
  static async createUser(req: Request, res: Response) {
    try {
      const validatedData = userCreateSchema.parse(req.body);
      const user = await UserService.createUser(validatedData);
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // Update a user
  static async updateUser(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const requestedUserId = req.params.id as string;
      const userRole = req.userRole;
      if (userRole == UserRole.USER) {
        if (userId !== requestedUserId) {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      const validatedData = userUpdateSchema.parse(req.body);
      const user = await UserService.updateUser(
        req.params.id as string,
        validatedData,
      );
      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Change password
  static async changePassword(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const requestedUserId = req.params.id as string;
      const userRole = req.userRole;
      if (userRole == UserRole.USER) {
        if (userId !== requestedUserId) {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ error: "Current password and new password are required" });
      }

      const user = await UserService.changePassword(
        req.params.id as string,
        currentPassword,
        newPassword,
      );

      return res.status(200).json({
        message: "Password changed successfully",
        user,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // Update profile photo
  static async updateProfilePhoto(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const requestedUserId = req.params.id as string;
      const userRole = req.userRole;
      if (userRole == UserRole.USER) {
        if (userId !== requestedUserId) {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      const { avatarUrl } = req.body;
      if (!avatarUrl) {
        return res.status(400).json({ error: "Avatar URL is required" });
      }
      const user = await UserService.updateProfilePhoto(
        req.params.id as string,
        avatarUrl,
      );
      return res.status(200).json({
        message: "Profile photo updated successfully",
        user,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // Delete a user
  static async deleteUser(req: Request, res: Response) {
    try {
      await UserService.deleteUser(req.params.id as string);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get dashboard stats
  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId; // From auth middleware

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized - User not authenticated",
        });
      }

      const stats = await UserService.getDashboardStats(userId);

      return res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(`[Dashboard Stats Controller] Error:`, error);

      // Handle specific errors
      if (error.message.includes("User not found")) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to fetch dashboard statistics",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Get stats for a specific user (admin only)
  static async getUserStats(req: AuthRequest, res: Response) {
    try {
      const targetUserId = req.params.id as string;
      const requestingUserId = req.userId;

      if (!requestingUserId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      // Optional: Add permission check here
      // Check if requesting user has permission to view stats of target user

      const stats = await UserService.getDashboardStats(targetUserId);

      return res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(`[User Stats Controller] Error:`, error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
