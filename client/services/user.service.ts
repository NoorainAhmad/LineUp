import { DashboardStats } from "@/types";
import api from "../api/axios";
import {
  userCreateSchema,
  userUpdateSchema,
  type UserCreateInput,
  type UserUpdateInput,
} from "../validators/user.validator";

export class UserService {
  // Get a single user
  static async getUserById(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  // Get all users
  static async getAllUsers() {
    const response = await api.get("/users");
    return response.data;
  }

  // Get User's subordinates
  static async getUserSubordinates(userId: string) {
    const response = await api.get(`/users/${userId}/subordinates`);
    return response.data;
  }

  // Search users
  static async searchUsers(query: string) {
    const response = await api.get(`/users/search?q=${query}`);
    return response.data;
  }

  // Search team members
  static async searchTeamMembers(query: string) {
    const response = await api.get(`/users/team/search?q=${query}`); 
    return response.data;
  }

  // Get dashboard stats for current user
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get("/users/dashboard/stats");
      return response.data.data; // The API returns { success: true, data: stats }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  // Get stats for a specific user (admin only)
  static async getUserStats(userId: string): Promise<DashboardStats> {
    try {
      const response = await api.get(`/users/stats/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching stats for user ${userId}:`, error);
      throw error;
    }
  }

  // Create a new user
  static async createUser(data: UserCreateInput) {
    const validatedData = userCreateSchema.parse(data);
    const response = await api.post("/users", validatedData);
    return response.data;
  }

  // Update a user
  static async updateUser(id: string, data: UserUpdateInput) {
    const validatedData = userUpdateSchema.parse(data);
    const response = await api.patch(`/users/${id}`, validatedData);
    return response.data;
  }

  static async updateProfilePhoto(userId: string, file: File) {
    try {
      const ticketResponse = await api.post("/media/upload-url", {
        fileName: `profile_${userId}_${Date.now()}.${file.name.split(".").pop()}`,
        fileType: file.type,
      });

      const { uploadUrl, fileKey } = ticketResponse.data.data;

      await api.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        transformRequest: [
          (rawData, headers) => {
            if (headers) {
              delete headers.common?.["Authorization"];
              delete headers?.["Authorization"];
            }
            return rawData;
          },
        ],
      });

      const finalizeResponse = await api.post("/media/finalize", {
        fileKey,
        fileSize: file.size,
      });

      const permanentFileUrl = finalizeResponse.data.data.publicUrl;

      const response = await api.patch(`/users/${userId}/profile-photo`, {
        avatarUrl: permanentFileUrl,
      });

      return response.data;
    } catch (error) {
      console.error("Error updating profile photo:", error);
      throw error;
    }
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const response = await api.post(`/users/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  // Delete a user
  static async deleteUser(id: string) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }

  // Helper: Format relative time (same as backend for consistency)
  static formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  // Helper: Get greeting based on time
  static getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }

  // Helper: Calculate trend percentage
  static calculateTrend(current: number, previous: number): number {
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Helper: Format storage bytes to human readable
  static formatStorage(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}
