import { Request, Response } from "express";
import { CannedResponseService } from "../services/canned.service.js";
import { cannedResponseCreateSchema } from "../validators/canned.validator.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export class CannedResponseController {
  // Get a canned response by ID
  static async getCannedResponseById(req: Request, res: Response) {
    try {
      const cannedResponse = await CannedResponseService.getCannedResponseById(
        req.params.id as string,
      );
      if (!cannedResponse)
        return res.status(404).json({ error: "Canned response not found" });
      return res.status(200).json(cannedResponse);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get all canned responses by User ID
  static async getCannedResponsesByUserId(req: Request, res: Response) {
    try {
      const canned_responses =
        await CannedResponseService.getCannedResponsesByUserId(
          req.params.userId as string,
        );
      return res.status(200).json(canned_responses);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get all canned responses
  static async getAllCannedResponses(_req: Request, res: Response) {
    try {
      const canned_responses =
        await CannedResponseService.getAllCannedResponses();
      return res.status(200).json(canned_responses);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Create a new canned response
  static async createCannedResponse(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId as string;
      const validatedData = cannedResponseCreateSchema.parse(req.body);
      const cannedResponse = await CannedResponseService.createCannedResponse(
        userId,
        validatedData,
      );
      return res.status(201).json(cannedResponse);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Update a canned response
  static async updateCannedResponse(req: Request, res: Response) {
    try {
      const validatedData = cannedResponseCreateSchema.parse(req.body);
      const cannedResponse = await CannedResponseService.updateCannedResponse(
        req.params.id as string,
        validatedData,
      );
      return res.status(200).json(cannedResponse);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Delete a canned response
  static async deleteCannedResponse(req: Request, res: Response) {
    try {
      await CannedResponseService.deleteCannedResponse(req.params.id as string);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
