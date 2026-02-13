// controllers/media.controller.ts
import { Request, Response } from "express";
import { MediaService } from "../services/media.service.js";
import { AuthRequest } from "@/middlewares/auth.middleware.js";

export class MediaController {
  /**
   * Generate pre-signed URL for direct S3 upload
   * POST /api/v1/media/upload-url
   */
  static async getUploadUrl(req: AuthRequest, res: Response) {
    try {
      const { fileName, fileType } = req.body;
      const userId = req.userId as string;

      const result = await MediaService.generateUploadTicket(
        fileName,
        fileType,
        userId,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("[MediaController] getUploadUrl error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate upload URL",
      });
    }
  }

  /**
   * Finalize upload after successful S3 upload
   * POST /api/v1/media/finalize
   */
  static async finalizeUpload(req: AuthRequest, res: Response) {
    try {
      const { fileKey, fileSize } = req.body; 

      const media = await MediaService.finalizeUpload(fileKey, fileSize);

      // Generate permanent S3 URL
      const region = process.env.AWS_REGION || "us-east-1";
      const bucket = process.env.S3_BUCKET_NAME;
      const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}`;

      return res.status(200).json({
        success: true,
        message: "Upload completed successfully",
        data: {
          id: media.id,
          fileKey: media.fileKey,
          publicUrl, // 👈 Return this to client
        },
      });
    } catch (error) {
      console.error("[MediaController] finalizeUpload error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to finalize upload",
      });
    }
  }

  /**
   * Get user's media gallery
   * GET /api/v1/media/my-gallery
   */
  static async getMyGallery(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId as string;

      const gallery = await MediaService.getUserMedia(userId);

      return res.status(200).json({
        success: true,
        data: gallery,
      });
    } catch (error) {
      console.error("[MediaController] getMyGallery error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch gallery",
      });
    }
  }
}
