import api from "../api/axios";
import { statusCreateSchema } from "../validators/status.validator.js";

export class StatusService {
  // Get my status
  static async getMyStatus() {
    const response = await api.get("/statuses/me");
    return response.data;
  }

  // Get all statuses
  static async getAllStatuses() {
    const response = await api.get("/statuses");
    return response.data;
  }

  // Get the status feed
  static async getFeed() {
    const response = await api.get("/statuses/feed");
    return response.data;
  }

  // Create a status
  static async createStatus(data: any, file?: File) {
    let finalMediaId = data.mediaId;
    let mediaPayload = {};

    if (file && (data.type === "IMAGE" || data.type === "VIDEO")) {
      try {
        // Step 1: Get pre-signed URL for upload + public URL
        const ticketResponse = await api.post("/media/upload-url", {
          fileName: file.name.replace(/[^a-zA-Z0-9.]/g, "_"),
          fileType: file.type,
        });

        const { uploadUrl, mediaId, publicUrl, fileKey } =
          ticketResponse.data.data;

        // Step 2: Upload directly to S3 using pre-signed URL
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        // Step 3: Finalize upload in database
        await api.post("/media/finalize", {
          fileKey,
          fileSize: file.size,
        });

        finalMediaId = mediaId;

        // Store the public URL for immediate use
        mediaPayload = {
          mediaUrl: publicUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        };
      } catch (error) {
        console.error("❌ Status media upload failed:", error);
        throw new Error("Failed to upload status media");
      }
    }

    // Validate and create status
    const validatedData = statusCreateSchema.parse({
      ...data,
      mediaId: finalMediaId,
      ...mediaPayload,
    });

    const response = await api.post("/statuses", validatedData);
    return response.data;
  }

  // Mark a specific status slide as viewed
  static async markAsViewed(statusId: string) {
    const response = await api.post(`/statuses/${statusId}/view`);
    return response.data;
  }

  // Delete a status
  static async deleteStatus(id: string) {
    const response = await api.delete(`/statuses/${id}`);
    return response.data;
  }

  // Get viewers of a status (who viewed and when)
  static async getStatusViewers(statusId: string) {
    const response = await api.get(`/statuses/${statusId}/viewers`);
    return response.data;
  }

  // Reply to a status (sends a DM to the status owner)
  static async replyToStatus(statusId: string, message: string) {
    const response = await api.post(`/statuses/${statusId}/reply`, { message });
    return response.data;
  }

  // Share a status to one or more chats
  static async shareStatus(statusId: string, targetChatIds: string[]) {
    const response = await api.post(`/statuses/${statusId}/share`, {
      targetChatIds,
    });
    return response.data;
  }
}
