import { Request, Response } from "express";
import { SystemService } from "../services/system.service.js";
import { systemSchema } from "../validators/system.validator.js";

export class SystemController {
  // Get system settings
  static async getSystemSettings(req: Request, res: Response) {
    try {
      const system = await SystemService.getSystemSettings();
      return res.status(200).json(system);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Update system settings
  static async updateSystemSettings(req: Request, res: Response) {
    try {
      const validatedData = systemSchema.parse(req.body);
      const system = await SystemService.updateSystemSettings(validatedData);
      return res.status(200).json(system);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
