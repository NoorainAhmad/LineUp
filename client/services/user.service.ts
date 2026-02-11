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

  // Delete a user
  static async deleteUser(id: string) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
}
