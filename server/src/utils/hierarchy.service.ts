// src/services/hierarchy.service.ts
import { prisma } from "../config/db.js";
import { UserRole } from "@/generated/prisma/index.js";

export class HierarchyService {
  /**
   * Get all subordinate IDs (entire tree)
   * Optimized: single query + in-memory traversal
   */
  static async getAllSubordinateIds(userId: string): Promise<string[]> {
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

    return users.map(u => u.id);
  }
    const allUsers = await prisma.user.findMany({
      select: { id: true, parentId: true },
    });

    // Build parent -> children map
    const parentToChildren = new Map<string, string[]>();
    for (const user of allUsers) {
      if (user.parentId) {
        if (!parentToChildren.has(user.parentId)) {
          parentToChildren.set(user.parentId, []);
        }
        parentToChildren.get(user.parentId)!.push(user.id);
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

    return subordinateIds;
  }

  /**
   * Get visible user IDs based on hierarchy (for RBAC)
   * Includes self + subordinates
   */
  static async getVisibleUserIds(userId: string): Promise<string[]> {
    const subordinateIds = await this.getAllSubordinateIds(userId);
    return [userId, ...subordinateIds];
  }
}