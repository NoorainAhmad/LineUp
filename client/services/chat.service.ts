import api from "../api/axios";
import {
  chatCreateSchema,
  sendMessageSchema,
  type ChatCreateInput,
  type SendMessageInput,
} from "../validators/chat.validator.js";

export class ChatService {
  // Start a new chat or get an existing DM
  static async createChat(data: ChatCreateInput) {
    const validatedData = chatCreateSchema.parse(data);
    const response = await api.post("/chats", validatedData);
    return response.data;
  }

  // Send a message (Handles Media Handshake if file is provided)
  static async sendMessage(data: any, file?: File) {
    let mediaPayload = {};

    if (file) {
      // Step 1: Get pre-signed URL from your backend
      const ticketResponse = await api.post("/media/upload-url", {
        fileName: file.name.replace(/[^a-zA-Z0-9.]/g, "_"),
        fileType: file.type,
      });

      const { uploadUrl, mediaId, fileKey } = ticketResponse.data.data;

      // Step 2: Upload directly to S3
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

      // Step 3: Finalize and get permanent URL from backend
      const finalizeResponse = await api.post("/media/finalize", {
        fileKey,
        fileSize: file.size,
      });

      // Backend returns the permanent S3 URL
      const permanentFileUrl = finalizeResponse.data.data.publicUrl;

      mediaPayload = {
        fileUrl: permanentFileUrl,
        fileName: file.name,
        fileSize: file.size.toString(),
        mimeType: file.type,
        mediaId,
      };
    }

    const validatedData = sendMessageSchema.parse({
      ...data,
      ...mediaPayload,
    });

    const response = await api.post("/chats/messages", validatedData);
    return response.data;
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
    return response.data;
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
}
