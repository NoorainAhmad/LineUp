import api from "../api/axios";
import {
  statusCreateSchema,
} from "../validators/status.validator.js";

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
    if (file && (data.type === "IMAGE" || data.type === "VIDEO")) {
      const ticketResponse = await api.post("/media/upload-url", {
        fileName: file.name.replace(/[^a-zA-Z0-9]/g, "_"),
        fileType: file.type,
      });
      const { uploadUrl, mediaId } = ticketResponse.data.data;
      await api.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        transformRequest: [
          (rawData, headers) => {
            if (headers) {
              delete headers.common?.["Authorization"];
              delete headers?.["Authorization"];
            }
            return rawData;
          },
        ],
      });
      finalMediaId = mediaId;
    }
    const validatedData = statusCreateSchema.parse({
      ...data,
      mediaId: finalMediaId,
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
}
