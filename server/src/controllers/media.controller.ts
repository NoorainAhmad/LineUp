import { Request, Response } from "express";
import { MediaService } from "../services/media.service.js";
import { AuthRequest } from "@/middlewares/auth.middleware.js";
import { prisma } from "@/config/db.js";
import { MediaStatus } from "@/generated/prisma/index.js";

export class MediaController {
  // Request an upload ticket
  static async getUploadUrl(req: AuthRequest, res: Response) {
    try {
      const { fileName, fileType } = req.body;
      const userId = req.userId as string;
      if (!fileName || !fileType) {
        return res.status(400).json({
          success: false,
          message: "fileName and fileType are required",
        });
      }
      const ticket = await MediaService.generateUploadTicket(
        fileName,
        fileType,
        userId,
      );
      return res.status(200).json({
        success: true,
        message: "Upload ticket generated successfully",
        data: ticket,
      });
    } catch (error) {
      console.error("Upload Ticket Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  // Handle Storage Webhook
  static async handleStorageWebhook(req: Request, res: Response) {
    try {
      // MinIO body structure: { Records: [ { s3: { object: { key: '...', size: ... } } } ] }
      const { Records } = req.body;
      if (!Records || !Array.isArray(Records)) {
        console.log("⚠️ Webhook received but no Records found.");
        return res.status(200).send("No records to process");
      }
      for (const record of Records) {
        // Decode the key (Crucial: MinIO encodes special characters)
        const rawKey = record.s3.object.key;
        const fileKey = decodeURIComponent(rawKey.replace(/\+/g, " "));
        const fileSize = record.s3.object.size;
        console.log(`Processing Webhook for: ${fileKey} (${fileSize} bytes)`);
        // Update the record
        // We use updateMany if we aren't 100% sure the key is unique,
        // or update if we have a @unique constraint on fileKey.
        const updated = await prisma.media.update({
          where: { fileKey: fileKey },
          data: {
            mediaStatus: MediaStatus.COMPLETED,
            fileSize: fileSize,
          },
        });
        if (updated) {
          console.log(`✅ Media ID ${updated.id} marked as COMPLETED`);
        }
      }
      // Always return 200 to MinIO so it stops retrying the event
      return res.status(200).send("OK");
    } catch (error) {
      // Detailed error logging to fix that 500
      console.error("❌ Webhook Internal Crash:");
      console.error(error);
      // Even if it fails, returning 200 prevents MinIO from flooding your logs with retries
      // while you debug the logic.
      return res.status(500).json({ error: "Failed to process webhook" });
    }
  }

  // Get my gallery for authenticated users
  static async getMyGallery(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId as string;
      const gallery = await MediaService.getUserMedia(userId);
      return res.status(200).json({
        success: true,
        data: gallery,
      });
    } catch (error) {
      console.error("Gallery Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch gallery" });
    }
  }
}
