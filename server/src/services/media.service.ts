// services/media.service.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/db.js";
import { MediaStatus } from "../generated/prisma/index.js";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export class MediaService {
  /**
   * Generate pre-signed URL for direct S3 upload
   * POST /api/v1/media/upload-url
   */
  static async generateUploadTicket(
    fileName: string,
    fileType: string,
    userId: string,
  ) {
    try {
      // Generate unique file key
      const fileExtension = fileName.split(".").pop() || "bin";
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const category = fileType.split("/")[0]; // 'image', 'video', 'audio', 'application'

      // Simple, clean key structure
      const key = `users/${userId}/${category}/${uniqueFileName}`;

      // Create media record
      const media = await prisma.media.create({
        data: {
          fileKey: key,
          originalName: fileName,
          mimeType: fileType,
          mediaStatus: MediaStatus.PENDING,
          user: {
            connect: { id: userId },
          },
        },
      });

      // Generate pre-signed URL
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 300, // 5 minutes
      });

      return {
        mediaId: media.id,
        uploadUrl,
        fileKey: key,
      };
    } catch (error) {
      console.error(`[MediaService] generateUploadTicket error:`, error);
      throw new Error("Failed to generate upload URL");
    }
  }

  /**
   * Finalize upload after file is in S3
   * POST /api/v1/media/finalize
   */
  static async finalizeUpload(fileKey: string, fileSize: number) {
    try {
      const media = await prisma.media.update({
        where: { fileKey },
        data: {
          mediaStatus: MediaStatus.COMPLETED,
          fileSize,
        },
      });

      return media;
    } catch (error) {
      console.error(`[MediaService] finalizeUpload error:`, error);
      throw new Error("Failed to finalize upload");
    }
  }

  /**
   * Generate temporary viewing URL
   */
  static async getViewingUrl(fileKey: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        ResponseContentDisposition: "inline",
      });

      return await getSignedUrl(s3Client, command, {
        expiresIn: 3600, // 1 hour
      });
    } catch (error) {
      console.error(`[MediaService] getViewingUrl error:`, error);
      return null;
    }
  }

  /**
   * Get user's media gallery
   * GET /api/v1/media/my-gallery
   */
  static async getUserMedia(userId: string) {
    try {
      const mediaItems = await prisma.media.findMany({
        where: {
          userId,
          mediaStatus: MediaStatus.COMPLETED,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Generate URLs for each media item
      const itemsWithUrls = await Promise.all(
        mediaItems.map(async (item) => ({
          id: item.id,
          name: item.originalName,
          type: item.mimeType,
          size: item.fileSize,
          createdAt: item.createdAt,
          url: await this.getViewingUrl(item.fileKey),
        })),
      );

      return itemsWithUrls;
    } catch (error) {
      console.error(`[MediaService] getUserMedia error:`, error);
      throw new Error("Failed to fetch gallery");
    }
  }
}
