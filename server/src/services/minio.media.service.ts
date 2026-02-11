import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/db.js";
import { MediaStatus } from "../generated/prisma/index.js";

// Create an S3 client
const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
});

// Set the bucket name
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME;

// Media Service
export class MinioMediaService {
  // Generates a "Golden Ticket" (Pre-signed URL) for a client to upload a file directly to MinIO.
  static async generateUploadTicket(
    fileName: string,
    fileType: string,
    userId: string,
  ) {
    try {
      const fileExtension = fileName.split(".").pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      // Categorize by mimeType (e.g., uploads/image/uuid.png)
      const category = fileType.split("/")[0] || "other";
      const key = `uploads/${category}/${uniqueFileName}`;
      // Create a record in Postgres with PENDING status
      const media = await prisma.media.create({
        data: {
          fileKey: key,
          originalName: fileName,
          mimeType: fileType,
          userId: userId,
          mediaStatus: MediaStatus.PENDING,
        },
      });
      // Generate the S3 PutObject Pre-signed URL
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: fileType,
      });
      // URL expires in 5 minutes
      const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 300,
      });
      return {
        mediaId: media.id,
        uploadUrl,
        fileKey: key,
      };
    } catch (error) {
      console.log(`[Media Service] Error: ${error}`);
      throw new Error("Media creation failed: " + (error as Error).message);
    }
  }

  // Finalizes the media record when MinIO confirms the file is stored.
  static async finalizeUpload(fileKey: string, size: number) {
    try {
      return await prisma.media.update({
        where: { fileKey },
        data: {
          mediaStatus: MediaStatus.COMPLETED,
          fileSize: size,
        },
      });
    } catch (error) {
      console.log(`[Media Service] Error: ${error}`);
      throw new Error("Media update failed: " + (error as Error).message);
    }
  }

  // Generates a temporary viewing link for private files.
  static async getViewingUrl(fileKey: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
      });
      // URL valid for 1 hour
      return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (error) {
      console.log(`[Media Service] Error: ${error}`);
      throw new Error("Media update failed: " + (error as Error).message);
    }
  }

  // Fetches all completed media for a user, including temporary view URLs.
  static async getUserMedia(userId: string) {
    try {
      const mediaItems = await prisma.media.findMany({
        where: { userId, mediaStatus: MediaStatus.COMPLETED },
        orderBy: { createdAt: "desc" },
      });
      // Map through items to add temporary viewing URLs
      return Promise.all(
        mediaItems.map(async (item) => ({
          ...item,
          url: await this.getViewingUrl(item.fileKey),
        })),
      );
    } catch (error) {
      console.log(`[Media Service] Error: ${error}`);
      throw new Error("Media update failed: " + (error as Error).message);
    }
  }
}
