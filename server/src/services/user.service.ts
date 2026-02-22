import z from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";
import type {
  userCreateSchema,
  userUpdateSchema,
} from "../validators/user.validator.js";
import { MessageType, UserRole, UserStatus } from "@/generated/prisma/index.js";

interface DashboardStats {
  // Greeting & User Info
  user: {
    id: string;
    name: string;
    role: UserRole;
    unreadMessages: number;
  };

  // Metrics Cards
  metrics: {
    activeChats: number;
    onlineTeamMembers: number;
    messagesToday: number;
    totalMessages: number;
    unreadMessages: number;
    pinnedChatsCount: number;
  };

  // Message Volume Chart Data
  messageVolume: {
    labels: string[];
    data: number[];
    total: number;
    trend: number;
  };

  // Pinned Conversations - FIXED TYPES
  pinnedChats: Array<{
    id: string;
    name: string; // Required, will use "Unknown" fallback
    isGroup: boolean;
    avatar?: any; // Keep as any for flexibility
    lastMessage?: {
      content: string;
      sender: string;
      time: string;
      isMe: boolean;
    };
    unreadCount: number;
    members?: Array<any>;
  }>;

  // Recent Status Updates
  recentStatuses: Array<{
    id: string;
    user: {
      id: string;
      name: string; // Required
      avatarUrl?: string | null;
    };
    type: string;
    content?: string;
    time: string;
  }>;

  // Online Team Members
  onlineTeam: Array<{
    id: string;
    name: string; // Required
    avatarUrl?: string | null;
    role: UserRole;
    status: UserStatus;
  }>;

  // Message Type Breakdown
  messageTypes: {
    text: number;
    images: number;
    audio: number;
    files: number;
    total: number;
  };

  // Quick Stats for Admins
  adminStats?: {
    totalUsers: number;
    byRole: Record<UserRole, number>;
    activeUsers: number;
    inactiveUsers: number;
    newUsersToday: number;
    totalChats: number;
    totalGroups: number;
    storageUsed: string;
  };
}

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

  // Get my branch info
  static async getBranchInfo(id: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new Error("User not found");
      }
      if (user.parentId) {
        return prisma.user.findUnique({
          where: { id: user.parentId },
          select: {
            id: true,
            guid: true,
            name: true, 
            email: true,
            location: true,
            avatarUrl: true,
            status: true,
            lastSeen: true,  
            role: true 
          },
        });
      } 
    } catch (error) {
      console.log(`[User] Error: ${error}`);
      throw new Error("User not found: " + (error as Error).message);
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

    // Team hierarchy (all subordinates at all levels)
  static async teamMembers(userId: string) {
    try {  
      // First, get all subordinate IDs recursively
      const allTeamIds = await this.getAllSubordinateIds(userId);

      // Add the current user to the list
      allTeamIds.push(userId); 

      // Search for users that match the query AND are in the team
      const results = await prisma.user.findMany({
        where: {
          AND: [
            {
              id: { in: allTeamIds }, // Only search within team
            } 
          ],
        },
        orderBy: [
          { role: "asc" }, // Sort by role first (DEVELOPER first, then MASTER, etc.)
          { name: "asc" },
        ],
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          isActive: true,
          avatarUrl: true,
          location: true,
          createdAt: true,
          parentId: true,
          parent: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

      // Enhance results with hierarchy info
      const enhancedResults = results.map((user) => ({
        ...user,
        hierarchy: {
          level: this.getHierarchyLevel(user.role),
          hasChildren: user.children && user.children.length > 0,
          parentName: user.parent?.name || null,
          childCount: user.children?.length || 0,
        },
      })); 

      return enhancedResults;
    } catch (error) {
      console.error(`[Team] Error: ${error}`);
      throw new Error("Team failed: " + (error as Error).message);
    }
  }

  // Search through entire team hierarchy (all subordinates at all levels)
  static async searchTeamMembers(userId: string, query: string) {
    try {
      query = query.trim(); 

      // First, get all subordinate IDs recursively
      const allTeamIds = await this.getAllSubordinateIds(userId);

      // Add the current user to the list
      allTeamIds.push(userId); 

      // Search for users that match the query AND are in the team
      const results = await prisma.user.findMany({
        where: {
          AND: [
            {
              id: { in: allTeamIds }, // Only search within team
            },
            {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
                { phone: { contains: query, mode: "insensitive" } },
                { guid: { contains: query, mode: "insensitive" } },
              ],
            },
          ],
        },
        orderBy: [
          { role: "asc" }, // Sort by role first (DEVELOPER first, then MASTER, etc.)
          { name: "asc" },
        ],
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          isActive: true,
          avatarUrl: true,
          location: true,
          createdAt: true,
          parentId: true,
          parent: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

      // Enhance results with hierarchy info
      const enhancedResults = results.map((user) => ({
        ...user,
        hierarchy: {
          level: this.getHierarchyLevel(user.role),
          hasChildren: user.children && user.children.length > 0,
          parentName: user.parent?.name || null,
          childCount: user.children?.length || 0,
        },
      })); 

      return enhancedResults;
    } catch (error) {
      console.error(`[Team Search] Error: ${error}`);
      throw new Error("Team search failed: " + (error as Error).message);
    }
  }

  // Helper: Get all subordinate IDs recursively (existing method)
  private static async getAllSubordinateIds(userId: string): Promise<string[]> {
    const directSubs = await prisma.user.findMany({
      where: { parentId: userId },
      select: { id: true },
    });

    const subordinateIds: string[] = [];

    for (const sub of directSubs) {
      subordinateIds.push(sub.id);
      // Recursively get children of this subordinate
      const deeperIds = await this.getAllSubordinateIds(sub.id);
      subordinateIds.push(...deeperIds);
    }

    return subordinateIds;
  }

  // Helper: Get hierarchy level based on role
  private static getHierarchyLevel(role: string): number {
    const levels: Record<string, number> = {
      DEVELOPER: 5,
      MASTER: 4,
      ADMIN: 3,
      BRANCH: 2,
      USER: 1,
    };
    return levels[role] || 0;
  }

  // Create a new user
  static async createUser(data: z.infer<typeof userCreateSchema>) {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ guid: data.guid }, { phone: data.phone }],
        },
        select: {
          id: true,
          guid: true,
          phone: true,
          isActive: true,
        },
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

  // 📊 Get Dashboard Stats
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      // Get current user with role
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          role: true,
          avatarUrl: true,
        },
      });

      if (!currentUser) {
        throw new Error("User not found");
      }

      // Get all chats where user is a member
      const userChats = await prisma.chat.findMany({
        where: {
          members: {
            some: {
              userId: currentUser.id,
              isArchived: false, // Exclude archived chats
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  status: true,
                  role: true,
                  lastSeen: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 50, // Recent messages for stats
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
          lastMessage: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Get statuses from users in visible scope (based on role)
      const visibleUserIds = await this.getVisibleUserIds(
        currentUser.id,
        currentUser.role,
      );

      const recentStatuses = await prisma.status.findMany({
        where: {
          userId: { in: visibleUserIds },
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Calculate metrics
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Unread messages count
      const unreadMessages = userChats.reduce((total, chat) => {
        const member = chat.members.find((m) => m.userId === currentUser.id);
        return total + (member?.unreadCount || 0);
      }, 0);

      // Messages today
      let messagesToday = 0;
      let messagesByType = { text: 0, images: 0, audio: 0, files: 0 };

      userChats.forEach((chat) => {
        chat.messages.forEach((msg) => {
          if (new Date(msg.createdAt) >= last24h) {
            messagesToday++;

            // Count by type
            if (msg.type === MessageType.TEXT) messagesByType.text++;
            else if (msg.type === MessageType.IMAGE) messagesByType.images++;
            else if (msg.type === MessageType.AUDIO) messagesByType.audio++;
            else if (msg.type === MessageType.FILE) messagesByType.files++;
          }
        });
      });

      // Message volume for chart (last 24 hours, hourly)
      const hourlyData = await this.getHourlyMessageVolume(
        currentUser.id,
        visibleUserIds,
      );

      // Pinned chats
      const pinnedChats = userChats
        .filter((chat) => {
          const member = chat.members.find((m) => m.userId === currentUser.id);
          return member?.isPinned && !member.isArchived;
        })
        .slice(0, 5)
        .map((chat) => {
          const otherMembers = chat.members.filter(
            (m) => m.userId !== currentUser.id,
          );
          const myMember = chat.members.find(
            (m) => m.userId === currentUser.id,
          );

          // Get chat name with proper null handling
          let chatName = "Unknown";
          if (chat.isGroup) {
            chatName = chat.groupName || "Group";
          } else {
            chatName = otherMembers[0]?.user?.name || "Unknown";
          }

          return {
            id: chat.id,
            name: chatName, // Always string, never null
            isGroup: chat.isGroup,
            avatar: chat.isGroup ? null : otherMembers[0]?.user || null,
            lastMessage: chat.lastMessage
              ? {
                  content: chat.lastMessage.content || "Attachment",
                  sender: chat.lastMessage.sender?.name || "Unknown",
                  time: this.formatRelativeTime(chat.lastMessage.createdAt),
                  isMe: chat.lastMessage.senderId === currentUser.id,
                }
              : undefined,
            unreadCount: myMember?.unreadCount || 0,
            members: otherMembers.slice(0, 3).map((m) => m.user),
          };
        });

      // Online team members (users in visible scope who are online)
      const onlineTeam = await prisma.user.findMany({
        where: {
          id: { in: visibleUserIds, not: currentUser.id },
          status: UserStatus.ONLINE,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
          status: true,
        },
        take: 20,
      });

      // Admin stats if user is DEVELOPER or MASTER
      let adminStats;
      if (
        currentUser.role === UserRole.DEVELOPER ||
        currentUser.role === UserRole.MASTER
      ) {
        const allUsers = await prisma.user.findMany({
          where:
            currentUser.role === UserRole.MASTER
              ? {
                  OR: [
                    { id: currentUser.id },
                    { parentId: currentUser.id },
                    { parent: { parentId: currentUser.id } },
                    { parent: { parent: { parentId: currentUser.id } } },
                  ],
                }
              : undefined, // DEVELOPER sees all
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const roleCounts: Record<UserRole, number> = {
          [UserRole.DEVELOPER]: 0,
          [UserRole.MASTER]: 0,
          [UserRole.ADMIN]: 0,
          [UserRole.BRANCH]: 0,
          [UserRole.USER]: 0,
        };

        allUsers.forEach((u) => {
          roleCounts[u.role as UserRole]++;
        });

        adminStats = {
          totalUsers: allUsers.length,
          byRole: roleCounts,
          activeUsers: allUsers.filter((u) => u.isActive).length,
          inactiveUsers: allUsers.filter((u) => !u.isActive).length,
          newUsersToday: allUsers.filter((u) => new Date(u.createdAt) >= today)
            .length,
          totalChats: await prisma.chat.count({
            where: {
              members: {
                some: {
                  userId: { in: allUsers.map((u) => u.id) },
                },
              },
            },
          }),
          totalGroups: await prisma.chat.count({
            where: {
              isGroup: true,
              members: {
                some: {
                  userId: { in: allUsers.map((u) => u.id) },
                },
              },
            },
          }),
          storageUsed: this.formatStorage(await this.getTotalStorageUsed()),
        };
      }

      // Build final response
      return {
        user: {
          id: currentUser.id,
          name: currentUser.name || "Unknown",
          role: currentUser.role,
          unreadMessages,
        },
        metrics: {
          activeChats: userChats.length,
          onlineTeamMembers: onlineTeam.length,
          messagesToday,
          totalMessages: userChats.reduce(
            (total, chat) => total + chat.messages.length,
            0,
          ),
          unreadMessages,
          pinnedChatsCount: pinnedChats.length,
        },
        messageVolume: hourlyData,
        pinnedChats,
        recentStatuses: recentStatuses.slice(0, 5).map((status) => ({
          id: status.id,
          user: {
            id: status.user.id,
            name: status.user.name || "Unknown",
            avatarUrl: status.user.avatarUrl,
          },
          type: status.type,
          content: status.content || undefined,
          time: this.formatRelativeTime(status.createdAt),
        })),
        onlineTeam,
        messageTypes: {
          text: messagesByType.text,
          images: messagesByType.images,
          audio: messagesByType.audio,
          files: messagesByType.files,
          total: messagesToday,
        },
        ...(adminStats && { adminStats }),
      };
    } catch (error) {
      console.error(`[Dashboard Stats] Error:`, error);
      throw new Error("Failed to fetch dashboard stats");
    }
  }

  // Helper: Get visible user IDs based on role
  private static async getVisibleUserIds(
    userId: string,
    role: UserRole,
  ): Promise<string[]> {
    const userIds = [userId];

    if (role === UserRole.DEVELOPER) {
      // Developer sees all users
      const allUsers = await prisma.user.findMany({ select: { id: true } });
      return allUsers.map((u) => u.id);
    }

    if (role === UserRole.MASTER) {
      // Master sees: themselves + all admins under them + all branches under those admins + all users under those branches
      const subordinates = await prisma.user.findMany({
        where: {
          OR: [
            { parentId: userId },
            { parent: { parentId: userId } },
            { parent: { parent: { parentId: userId } } },
          ],
        },
        select: { id: true },
      });
      userIds.push(...subordinates.map((s) => s.id));
    }

    if (role === UserRole.ADMIN) {
      // Admin sees: themselves + all branches under them + all users under those branches
      const subordinates = await prisma.user.findMany({
        where: {
          OR: [{ parentId: userId }, { parent: { parentId: userId } }],
        },
        select: { id: true },
      });
      userIds.push(...subordinates.map((s) => s.id));
    }

    if (role === UserRole.BRANCH) {
      // Branch sees: themselves + all users under them
      const subordinates = await prisma.user.findMany({
        where: { parentId: userId },
        select: { id: true },
      });
      userIds.push(...subordinates.map((s) => s.id));
    }

    // Remove duplicates
    return [...new Set(userIds)];
  }

  // Helper: Get hourly message volume for chart
  private static async getHourlyMessageVolume(
    userId: string,
    visibleUserIds: string[],
  ) {
    const now = new Date();
    const hours = [];
    const counts = [];

    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now);
      hour.setHours(now.getHours() - i, 0, 0, 0);
      const hourEnd = new Date(hour);
      hourEnd.setHours(hour.getHours() + 1);

      const count = await prisma.message.count({
        where: {
          chat: {
            members: {
              some: {
                userId: { in: visibleUserIds },
              },
            },
          },
          createdAt: {
            gte: hour,
            lt: hourEnd,
          },
        },
      });

      hours.push(
        hour.toLocaleTimeString([], { hour: "2-digit", hour12: true }),
      );
      counts.push(count);
    }

    // Calculate trend (compare last hour with previous hour)
    const trend =
      counts.length > 1 && counts[counts.length - 2] > 0
        ? Math.round(
            ((counts[counts.length - 1] - counts[counts.length - 2]) /
              counts[counts.length - 2]) *
              100,
          )
        : 12; // Default 12% if no data

    return {
      labels: hours,
      data: counts,
      total: counts.reduce((a, b) => a + b, 0),
      trend,
    };
  }

  // Helper: Format relative time (e.g., "2h ago", "Yesterday")
  private static formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  // Helper: Format storage
  private static formatStorage(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  // Helper: Get total storage used (from media)
  private static async getTotalStorageUsed(): Promise<number> {
    const media = await prisma.media.findMany({
      select: { fileSize: true },
    });
    return media.reduce((total, m) => total + (m.fileSize || 0), 0);
  }
}
