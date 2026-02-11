import z from "zod";
import { prisma } from "../config/db.js";
import type { systemSchema } from "../validators/system.validator.js";

export class SystemService {
  private static systemSelection = {
    id: true,
    activeBranchId: true,
    activeBranch: true,
    workspaceName: true,
    systemEmail: true,
    systemPhone: true,
    systemTimezone: true,
    systemLanguage: true,
    systemMaintenance: true,
    updatedAt: true,
  } as const;

  // Get system settings
  static async getSystemSettings() {
    try {
      const system = await prisma.system.findFirst({
        select: this.systemSelection,
      });
      if (!system) {
        return await this.createDefaultSystemSettings();
      }
      return system;
    } catch (error) {
      console.error(`[System] Error getting settings:`, error);
      return await this.createDefaultSystemSettings(); 
    }
  }

  // Create default system settings
  private static async createDefaultSystemSettings() {
    try {
      return await prisma.system.create({
        data: {
          workspaceName: "My Workspace",
          activeBranchId: null,
          systemVersion: "1.0.0",
          systemEmail: "admin@example.com",
          systemPhone: "+1234567890",
          systemTimezone: "UTC",
          systemLanguage: "en",
          systemMaintenance: false,
        },
        select: this.systemSelection,
      });
    } catch (error) {
      console.error(`[System] Error creating default settings:`, error);
      throw new Error(
        `Failed to create default system settings: ${(error as Error).message}`,
      );
    }
  }
  // Update system settings
  static async updateSystemSettings(data: z.infer<typeof systemSchema>) {
    try {
      // Remove undefined values
      const updateData: any = { ...data };
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key],
      );

      // Get existing system or create default one
      let system = await prisma.system.findFirst();

      if (!system) {
        return await this.createDefaultSystemSettings();
      }

      // Update the system settings
      return await prisma.system.update({
        where: { id: system.id },
        data: updateData,
        select: this.systemSelection,
      });
    } catch (error: any) {
      console.error(`[System] Error updating settings:`, error);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      throw new Error(
        `System settings not updated: ${(error as Error).message}`,
      );
    }
  }
}
