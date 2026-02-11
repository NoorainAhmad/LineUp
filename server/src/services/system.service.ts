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
  };

  // Get a system settings
  static async getSystemSettings() {
    try {
      return prisma.system.findFirst({
        select: this.systemSelection,
      });
    } catch (error) {
      console.log(`[System] Error: ${error}`);
      throw new Error("System settings not found: " + (error as Error).message);
    }
  }

  // Update a canned
  static async updateSystemSettings(data: z.infer<typeof systemSchema>) {
    try {
      const updateData: any = { ...data };
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key],
      );
      const system = await prisma.system.findFirst({
        select: this.systemSelection,
      });
      if (!system) {
        throw new Error("System settings not found");
      }
      return prisma.system.update({
        where: { id: system.id },
        data: updateData,
        select: this.systemSelection,
      });
    } catch (error) {
      console.log(`[System] Error: ${error}`);
      throw new Error(
        "System settings not updated: " + (error as Error).message,
      );
    }
  }
}
