import z from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";
import type {
  userCreateSchema,
  userUpdateSchema,
} from "../validators/user.validator.js";

export class UserService {
  private static userSelection = {
    id: true,
    guid: true,
    name: true,
    phone: true,
    email: true,
    location: true,
    avatarUrl: true,
    status: true,
    lastSeen: true,
    ipAddress: true,
    isActive: true,
    role: true,
    permission: true,
    parentId: true,
    parent: true,
    children: true,
    createdAt: true,
    updatedAt: true,
  };

  // Get a single user by ID
  static async getUserById(id: string) {
    try {
      return prisma.user.findUnique({
        where: { id },
        select: this.userSelection,
      });
    } catch (error) {
      console.log(`[User] Error: ${error}`);
      throw new Error("User not found: " + (error as Error).message);
    }
  }

  // Get all users
  static async getAllUsers() {
    try {
      return prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: this.userSelection,
      });
    } catch (error) {
      console.log(`[Users] Error: ${error}`);
      throw new Error("Users not found: " + (error as Error).message);
    }
  }

  // Get User's subordinates
  static async getUserSubordinates(userId: string) {
    try {
      return prisma.user.findMany({
        where: { parentId: userId },
        orderBy: { createdAt: "desc" },
        select: this.userSelection,
      });
    } catch (error) {
      console.log(`[Subordinates] Error: ${error}`);
      throw new Error("Subordinates not found: " + (error as Error).message);
    }
  }

  // Search Users
  static async searchUsers(query: string) {
    query = query.trim();
    console.log(query);
    try {
      return prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { guid: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        select: this.userSelection,
      });
    } catch (error) {
      console.log(`[Search Users] Error: ${error}`);
      throw new Error("Search users failed: " + (error as Error).message);
    }
  }

  // Create a new user
  static async createUser(data: z.infer<typeof userCreateSchema>) {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { guid: data.guid },
            { phone: data.phone }
          ]
        },
        select: {
          id:true,
          guid: true,
          phone: true,
          isActive: true
        }
      });
      if (existingUser && existingUser.isActive) {
        if (existingUser.guid === data.guid) {
          throw new Error("ID is already taken. Try another ID.");
        }
        if (existingUser.phone === data.phone) {
          throw new Error("Phone number is already registered.");
        }
      }
      if (existingUser && !existingUser.isActive) {
        await prisma.user.delete({ where: { id: existingUser.id } });
      }
      const hashedPassword = await bcrypt.hash(data.password!, 12);
      const { password, ...rest } = data;
      return prisma.user.create({
        data: {
          ...rest,
          isActive: true,
          passwordHash: hashedPassword,
        },
        select: this.userSelection,
      });
    } catch (error) {
      console.log(`[User Creation] Error: ${error}`);
      throw new Error("User creation failed: " + (error as Error).message);
    }
  }

  // Update a user
  static async updateUser(id: string, data: z.infer<typeof userUpdateSchema>) {
    try {
      const { password, ...rest } = data;
      const updateData: any = { ...rest };
      if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 12);
      }
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key],
      );
      return prisma.user.update({
        where: { id },
        data: updateData,
        select: this.userSelection,
      });
    } catch (error) {
      console.log(`[User Update] Error: ${error}`);
      throw new Error("User update failed: " + (error as Error).message);
    }
  }

  // Update user profile photo
  static async updateProfilePhoto(userId: string, avatarUrl: string) {
    try {
      return prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
        select: this.userSelection,
      });
    } catch (error) {
      console.log(`[Update Profile Photo] Error: ${error}`);
      throw new Error(
        "Profile photo update failed: " + (error as Error).message,
      );
    }
  }

  // Change a user's password
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    try {
      // Get user with password hash
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      return prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
        select: this.userSelection,
      });
    } catch (error) {
      console.log(`[Change Password] Error: ${error}`);
      throw new Error("Password change failed: " + (error as Error).message);
    }
  }

  // Delete a user by ID
  static async deleteUser(id: string) {
    try {
      return prisma.user.delete({ where: { id } });
    } catch (error) {
      console.log(`[User Deletion] Error: ${error}`);
      throw new Error("User deletion failed: " + (error as Error).message);
    }
  }
}
