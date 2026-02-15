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

  // Get User's stats
  static async getUserStats(userId: string) {
    console.log(userId);
    return null;
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
        avatarUrl: permanentFileUrl
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
}
