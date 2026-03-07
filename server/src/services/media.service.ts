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

type UploadRequestFile = {
  fileName: string;
  fileType: string;
  size: number;
  checksum?: string;
};

type UploadTicket = {
  mediaId: string;
  uploadUrl: string | null;
  fileKey: string;
  alreadyUploaded: boolean;
};

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const SHA256_HEX_REGEX = /^[a-f0-9]{64}$/i;

const getCategory = (fileType: string) => fileType.split("/")[0] || "file";

const buildRandomKey = (userId: string, fileType: string, fileName: string) => {
  const extension = fileName.split(".").pop() || "bin";
  const uniqueName = `${uuidv4()}.${extension}`;
  return `users/${userId}/${getCategory(fileType)}/${uniqueName}`;
};

const buildDeterministicKey = (
  userId: string,
  fileType: string,
  checksum?: string,
) => {
  if (!checksum || !SHA256_HEX_REGEX.test(checksum)) {
    return null;
  }

  return `users/${userId}/${getCategory(fileType)}/${checksum.toLowerCase()}`;
};

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
      const key = buildRandomKey(userId, fileType, fileName);

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

  static async generateUploadTickets(
    files: UploadRequestFile[],
    userId: string,
  ): Promise<UploadTicket[]> {
    const MAX_FILES = 10;
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    if (files.length > MAX_FILES) {
      throw new Error("Maximum 10 files allowed per upload");
    }

    const uploads: UploadTicket[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`${file.fileName} exceeds 10MB limit`);
      }

      const deterministicKey = buildDeterministicKey(
        userId,
        file.fileType,
        file.checksum,
      );

      let existingDeterministicMedia:
        | Awaited<ReturnType<typeof prisma.media.findUnique>>
        | null = null;

      if (deterministicKey) {
        existingDeterministicMedia = await prisma.media.findUnique({
          where: { fileKey: deterministicKey },
        });

        if (existingDeterministicMedia && existingDeterministicMedia.userId === userId) {
          const sizeCompatible =
            existingDeterministicMedia.fileSize == null ||
            existingDeterministicMedia.fileSize === file.size;

          if (
            existingDeterministicMedia.mediaStatus === MediaStatus.COMPLETED &&
            existingDeterministicMedia.mimeType === file.fileType &&
            sizeCompatible
          ) {
            uploads.push({
              mediaId: existingDeterministicMedia.id,
              uploadUrl: null,
              fileKey: existingDeterministicMedia.fileKey,
              alreadyUploaded: true,
            });
            continue;
          }

          if (existingDeterministicMedia.mediaStatus !== MediaStatus.COMPLETED) {
            const refreshed = await prisma.media.update({
              where: { id: existingDeterministicMedia.id },
              data: {
                originalName: file.fileName,
                mimeType: file.fileType,
                mediaStatus: MediaStatus.PENDING,
                fileSize: null,
              },
            });

            const retryUploadUrl = await getSignedUrl(
              s3Client,
              new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: deterministicKey,
                ContentType: file.fileType,
              }),
              {
                expiresIn: 300,
              },
            );

            uploads.push({
              mediaId: refreshed.id,
              uploadUrl: retryUploadUrl,
              fileKey: deterministicKey,
              alreadyUploaded: false,
            });
            continue;
          }
        }
      }

      const key =
        deterministicKey && !existingDeterministicMedia
          ? deterministicKey
          : buildRandomKey(userId, file.fileType, file.fileName);

      const media = await prisma.media.create({
        data: {
          fileKey: key,
          originalName: file.fileName,
          mimeType: file.fileType,
          mediaStatus: MediaStatus.PENDING,
          userId,
        },
      });

      const uploadUrl = await getSignedUrl(
        s3Client,
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          ContentType: file.fileType,
        }),
        {
          expiresIn: 300,
        },
      );

      uploads.push({
        mediaId: media.id,
        uploadUrl,
        fileKey: key,
        alreadyUploaded: false,
      });
    }

    return uploads;
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

  static async finalizeUploads(
    uploads: { fileKey: string; fileSize: number }[],
  ) {
    try {
      if (!uploads || uploads.length === 0) return [];

      const finalizedMedia = await prisma.$transaction(
        uploads.map((upload) =>
          prisma.media.update({
            where: { fileKey: upload.fileKey },
            data: {
              mediaStatus: MediaStatus.COMPLETED,
              fileSize: upload.fileSize,
            },
          }),
        ),
      );

      return finalizedMedia;
    } catch (error) {
      console.error(`[MediaService] finalizeUploads error:`, error);
      throw new Error("Failed to finalize uploads");
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
