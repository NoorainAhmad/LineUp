import api from "../api/axios";
import {
  chatCreateSchema,
  sendMessageSchema,
  type ChatCreateInput,
} from "../validators/chat.validator.js";
import type { MessageAttachment } from "../types";

type UploadTicket = {
  mediaId: string;
  uploadUrl: string | null;
  fileKey: string;
  alreadyUploaded?: boolean;
};

type UploadCandidate = {
  file: File;
  reason?: string;
  checksum?: string;
};

const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "audio/mpeg",
  "audio/wav",
  "audio/webm",
  "audio/mp3",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export type MediaSendProgress = {
  stage:
    | "validating"
    | "requesting"
    | "uploading"
    | "finalizing"
    | "sending";
  message: string;
  totalFiles: number;
  completedFiles: number;
  successfulFiles: number;
  failedFiles: number;
  progressPercent: number;
};

export type MediaSendReport = {
  totalSelected: number;
  uploaded: number;
  skippedFiles: string[];
  failedFiles: string[];
};

type SendMessageOptions = {
  onProgress?: (progress: MediaSendProgress) => void;
};

type SendMessageResult = {
  message: any;
  mediaReport: MediaSendReport;
};

type RawMessageMedia = {
  order?: number;
  media?: {
    id: string;
    fileKey: string;
    originalName?: string;
    mimeType?: string;
    fileSize?: number | null;
  };
};

const getS3FileUrl = (fileKey: string) => {
  const bucket = process.env.VITE_S3_BUCKET || "lineup-v0-s3-bucket";
  const region = process.env.VITE_AWS_REGION || "us-east-1";
  return `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}`;
};

const normalizeMessage = (message: any) => {
  const mediaLinks: RawMessageMedia[] = Array.isArray(message?.medias)
    ? message.medias
    : [];

  const attachments: MessageAttachment[] = mediaLinks
    .map((link, index) => {
      const media = link?.media;
      if (!media?.fileKey) return null;

      return {
        id: media.id,
        fileKey: media.fileKey,
        fileUrl: getS3FileUrl(media.fileKey),
        fileName: media.originalName || "Attachment",
        mimeType: media.mimeType || "application/octet-stream",
        fileSize: media.fileSize ?? undefined,
        order: link.order ?? index,
      };
    })
    .filter(Boolean) as MessageAttachment[];

  const firstAttachment = attachments[0];

  return {
    ...message,
    attachments,
    fileUrl: message.fileUrl ?? firstAttachment?.fileUrl,
    fileName: message.fileName ?? firstAttachment?.fileName,
    mimeType: message.mimeType ?? firstAttachment?.mimeType,
    fileSize:
      message.fileSize ??
      (firstAttachment?.fileSize != null
        ? String(firstAttachment.fileSize)
        : undefined),
  };
};

const normalizeMessagesPayload = (payload: any) => {
  if (Array.isArray(payload)) {
    return payload.map(normalizeMessage);
  }

  if (Array.isArray(payload?.data)) {
    return {
      ...payload,
      data: payload.data.map(normalizeMessage),
    };
  }

  return payload;
};

const toProgressPercent = (completed: number, total: number) => {
  if (total <= 0) return 0;
  const base = Math.min(99, Math.round((completed / total) * 90));
  return base;
};

const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** power;
  const fractionDigits = power === 0 ? 0 : 2;
  return `${value.toFixed(fractionDigits)} ${units[power]}`;
};

const arrayBufferToHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const computeFileChecksum = async (file: File) => {
  try {
    if (!globalThis.crypto?.subtle) return undefined;
    const data = await file.arrayBuffer();
    const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
    return arrayBufferToHex(digest);
  } catch {
    return undefined;
  }
};

export class ChatService {
  // Start a new chat or get an existing DM
  static async createChat(data: ChatCreateInput) {
    const validatedData = chatCreateSchema.parse(data);
    const response = await api.post("/chats", validatedData);
    return response.data;
  }

  // Send a message (supports both single and multi-file uploads)
  static async sendMessage(
    data: any,
    files?: File[] | File,
    options?: SendMessageOptions,
  ): Promise<SendMessageResult> {
    const uploadFiles = Array.isArray(files) ? files : files ? [files] : [];

    try {
      let mediaIds: string[] = [];
      const skippedFiles: string[] = [];
      const failedFiles: string[] = [];

      if (uploadFiles.length > 0) {
        const validFiles: UploadCandidate[] = [];
        const invalidFiles: UploadCandidate[] = [];

        for (const file of uploadFiles) {
          if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
            invalidFiles.push({
              file,
              reason: `Unsupported type (${file.type || "unknown"})`,
            });
            continue;
          }

          if (file.size > MAX_UPLOAD_FILE_SIZE) {
            invalidFiles.push({
              file,
              reason: `Exceeds ${formatFileSize(MAX_UPLOAD_FILE_SIZE)} limit (selected: ${formatFileSize(file.size)})`,
            });
            continue;
          }

          validFiles.push({ file });
        }

        skippedFiles.push(
          ...invalidFiles.map(
            (entry) => `${entry.file.name} - ${entry.reason || "Invalid file"}`,
          ),
        );

        options?.onProgress?.({
          stage: "validating",
          message: `Validating files (${validFiles.length}/${uploadFiles.length})`,
          totalFiles: uploadFiles.length,
          completedFiles: 0,
          successfulFiles: 0,
          failedFiles: invalidFiles.length,
          progressPercent: toProgressPercent(0, uploadFiles.length),
        });

        if (validFiles.length === 0) {
          const invalidDetails = skippedFiles
            .map((entry, index) => `${index + 1}. ${entry}`)
            .join("\n");
          throw new Error(`No valid media files to upload.\n${invalidDetails}`);
        }

        const filesForUpload: UploadCandidate[] = await Promise.all(
          validFiles.map(async ({ file }) => ({
            file,
            checksum: await computeFileChecksum(file),
          })),
        );

        options?.onProgress?.({
          stage: "requesting",
          message: `Preparing upload (${validFiles.length} files)`,
          totalFiles: uploadFiles.length,
          completedFiles: 0,
          successfulFiles: 0,
          failedFiles: invalidFiles.length,
          progressPercent: toProgressPercent(0, uploadFiles.length),
        });

        const ticketResponse = await api.post("/media/upload-urls", {
          files: filesForUpload.map(({ file, checksum }) => ({
            fileName: file.name.replace(/[^a-zA-Z0-9.]/g, "_"),
            fileType: file.type,
            size: file.size,
            checksum,
          })),
        });

        const uploads: UploadTicket[] = ticketResponse?.data?.data;

        if (!Array.isArray(uploads) || uploads.length !== filesForUpload.length) {
          throw new Error("Upload ticket response did not match selected files.");
        }

        let completedFiles = 0;
        let successfulFiles = 0;

        const uploadResults = await Promise.all(
          uploads.map(async (upload, index) => {
            const file = filesForUpload[index].file;

            if (!upload.uploadUrl || upload.alreadyUploaded) {
              successfulFiles += 1;
              completedFiles += 1;
              options?.onProgress?.({
                stage: "uploading",
                message: `Uploading files (${completedFiles}/${validFiles.length})`,
                totalFiles: uploadFiles.length,
                completedFiles,
                successfulFiles,
                failedFiles: invalidFiles.length + failedFiles.length,
                progressPercent: toProgressPercent(
                  completedFiles,
                  filesForUpload.length,
                ),
              });

              return {
                upload,
                file,
                requiresFinalize: false,
              };
            }

            try {
              const uploadResult = await fetch(upload.uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                  "Content-Type": file.type,
                },
              });

              if (!uploadResult.ok) {
                throw new Error(`Upload failed (${uploadResult.status})`);
              }

              successfulFiles += 1;
              return {
                upload,
                file,
                requiresFinalize: true,
              };
            } catch (error) {
              failedFiles.push(`${file.name} - Upload failed`);
              return null;
            } finally {
              completedFiles += 1;
              options?.onProgress?.({
                stage: "uploading",
                message: `Uploading files (${completedFiles}/${validFiles.length})`,
                totalFiles: uploadFiles.length,
                completedFiles,
                successfulFiles,
                failedFiles: invalidFiles.length + failedFiles.length,
                progressPercent: toProgressPercent(
                  completedFiles,
                  filesForUpload.length,
                ),
              });
            }
          }),
        );

        const successfulUploads = uploadResults.filter(Boolean) as {
          upload: UploadTicket;
          file: File;
          requiresFinalize: boolean;
        }[];

        if (successfulUploads.length > 0) {
          const uploadsNeedingFinalize = successfulUploads.filter(
            (entry) => entry.requiresFinalize,
          );

          mediaIds = successfulUploads
            .filter((entry) => !entry.requiresFinalize)
            .map((entry) => entry.upload.mediaId);

          if (uploadsNeedingFinalize.length > 0) {
            options?.onProgress?.({
              stage: "finalizing",
              message: `Finalizing media (${uploadsNeedingFinalize.length} files)`,
              totalFiles: uploadFiles.length,
              completedFiles: successfulUploads.length,
              successfulFiles: successfulUploads.length,
              failedFiles: invalidFiles.length + failedFiles.length,
              progressPercent: 95,
            });

            try {
              const finalizeResponse = await api.post("/media/finalize-bulk", {
                uploads: uploadsNeedingFinalize.map((entry) => ({
                  fileKey: entry.upload.fileKey,
                  fileSize: entry.file.size,
                })),
              });

              const finalizedKeys = new Set<string>(
                finalizeResponse?.data?.data?.fileKeys ??
                  uploadsNeedingFinalize.map((entry) => entry.upload.fileKey),
              );

              mediaIds.push(
                ...uploadsNeedingFinalize
                  .filter((entry) => finalizedKeys.has(entry.upload.fileKey))
                  .map((entry) => entry.upload.mediaId),
              );
            } catch {
              const finalizeResults = await Promise.allSettled(
                uploadsNeedingFinalize.map((entry) =>
                  api.post("/media/finalize", {
                    fileKey: entry.upload.fileKey,
                    fileSize: entry.file.size,
                  }),
                ),
              );

              finalizeResults.forEach((result, index) => {
                if (result.status === "fulfilled") {
                  mediaIds.push(uploadsNeedingFinalize[index].upload.mediaId);
                  return;
                }

                failedFiles.push(
                  `${uploadsNeedingFinalize[index].file.name} - Finalize failed`,
                );
              });
            }
          }
        } else {
          mediaIds = [];
        }

        mediaIds = Array.from(new Set(mediaIds));

        if (mediaIds.length === 0) {
          throw new Error("No media files could be uploaded successfully.");
        }
      }

      const payload = sendMessageSchema.parse({
        ...data,
        mediaIds,
      });

      options?.onProgress?.({
        stage: "sending",
        message: "Sending message...",
        totalFiles: uploadFiles.length,
        completedFiles: uploadFiles.length,
        successfulFiles: mediaIds.length,
        failedFiles: skippedFiles.length + failedFiles.length,
        progressPercent: 100,
      });

      const response = await api.post("/chats/messages", payload);

      return {
        message: response.data,
        mediaReport: {
          totalSelected: uploadFiles.length,
          uploaded: mediaIds.length,
          skippedFiles,
          failedFiles,
        },
      };
    } catch (error) {
      console.error("ChatService.sendMessage failed:", error);
      throw error;
    }
  }

  // Edit a message
  static async editMessage(messageId: string, data: any) {
    const response = await api.patch(`/chats/messages/${messageId}`, data);
    return response.data;
  }

  // Toggle an emoji reaction on a message
  static async toggleReaction(messageId: string, emoji: string) {
    const response = await api.post(`/chats/messages/${messageId}/react`, {
      emoji,
    });
    return response.data;
  }

  // Fetch all conversations for the inbox sidebar
  static async getInbox() {
    const response = await api.get("/chats");
    return response.data;
  }

  // Fetch messages for a specific chat with optional pagination
  static async getMessages(chatId: string, limit = 50, cursor?: string) {
    const response = await api.get(`/chats/${chatId}/messages`, {
      params: { limit, cursor },
    });
    return normalizeMessagesPayload(response.data);
  }

  // Mark a conversation as read
  static async markAsRead(chatId: string) {
    const response = await api.patch(`/chats/${chatId}/read`);
    return response.data;
  }

  // Toggle archive status of a chat
  static async toggleArchive(chatId: string) {
    const response = await api.patch(`/chats/${chatId}/archive`);
    return response.data;
  }

  // Soft-delete a message
  static async deleteMessage(messageId: string) {
    const response = await api.delete(`/chats/messages/${messageId}`);
    return response.data;
  }

  // Pin a chat
  static async pinChatMember(chatId: string) {
    const response = await api.patch(`/chats/${chatId}/pin`);
    return response.data;
  }

  // Forward a message to one or more chats
  static async forwardMessage(
    originalMessageId: string,
    targetChatIds: string[],
  ) {
    const response = await api.post("/chats/messages/forward", {
      originalMessageId,
      targetChatIds,
    });
    return response.data;
  }
}
