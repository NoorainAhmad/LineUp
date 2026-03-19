// src/services/hierarchy.service.ts
import { prisma } from "../config/db.js";
import { UserRole } from "@/generated/prisma/index.js";

// Simple in-memory cache for hierarchy lookups (cleared on each request cycle)
const supervisorCache = new Map<string, string[]>();
const subordinateCache = new Map<string, string[]>();

export class HierarchyService {
  /**
   * Get all subordinate IDs (entire tree)
   * Optimized: single query + in-memory traversal
   */
  static async getAllSubordinateIds(userId: string): Promise<string[]> {
    // Check cache first
    if (subordinateCache.has(userId)) {
      return subordinateCache.get(userId)!;
    }

    // Get user's role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    const role = user?.role;

     // 🔹 Fast path for BRANCH
  if (role === UserRole.BRANCH) {
    const users = await prisma.user.findMany({
      where: { parentId: userId },
      select: { id: true }
    });

    const result = users.map(u => u.id);
    subordinateCache.set(userId, result);
    return result;
  }
    const allUsers = await prisma.user.findMany({
      select: { id: true, parentId: true },
    });

    // Build parent -> children map
    const parentToChildren = new Map<string, string[]>();
    for (const userItem of allUsers) {
      if (userItem.parentId) {
        if (!parentToChildren.has(userItem.parentId)) {
          parentToChildren.set(userItem.parentId, []);
        }
        parentToChildren.get(userItem.parentId)!.push(userItem.id);
      }
    }

    // DFS traversal with cycle protection
    const subordinateIds: string[] = [];
    const visited = new Set<string>();
    const stack = [userId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      const children = parentToChildren.get(current) || [];

      for (const childId of children) {
        if (!visited.has(childId)) {
          visited.add(childId);
          subordinateIds.push(childId);
          stack.push(childId);
        }
      }
    }

    subordinateCache.set(userId, subordinateIds);
    return subordinateIds;
  }

  /**
   * Get all supervisor IDs up the hierarchy chain
   * Walks up the parent chain until reaching a user with no parent
   */
  static async getAllSupervisorIds(userId: string): Promise<string[]> {
    // Check cache first
    if (supervisorCache.has(userId)) {
      return supervisorCache.get(userId)!;
    }

    const supervisorIds: string[] = [];
    const visited = new Set<string>();
    let currentId: string | null = userId;

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      
      const result: { parentId: string | null } | null = await prisma.user.findUnique({
        where: { id: currentId },
        select: { parentId: true }
      });

      if (result && result.parentId) {
        supervisorIds.push(result.parentId);
        currentId = result.parentId;
      } else {
        currentId = null;
      }
    }

    supervisorCache.set(userId, supervisorIds);
    return supervisorIds;
  }

  /**
   * Get visible user IDs based on hierarchy (for RBAC)
   * Includes self + subordinates
   */
  static async getVisibleUserIds(userId: string): Promise<string[]> {
    const subordinateIds = await this.getAllSubordinateIds(userId);
    return [userId, ...subordinateIds];
  }

  /**
   * Clear caches - call this at the end of each request cycle
   */
  static clearCache(): void {
    supervisorCache.clear();
    subordinateCache.clear();
  }
}