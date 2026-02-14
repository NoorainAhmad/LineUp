import { Response } from "express";
import { ChatService } from "../services/chat.service.js";
import {
  chatCreateSchema,
  sendMessageSchema,
} from "../validators/chat.validator.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export class ChatController {
  // Create a new chat
  static async createChat(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId as string;
      const validatedData = chatCreateSchema.parse(req.body);
      const chat = await ChatService.createChat(userId, validatedData);
      return res.status(201).json(chat);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Send a message
  static async sendMessage(req: AuthRequest, res: Response) {
    try {
      const senderId = req.userId as string;
      const validatedData = sendMessageSchema.parse(req.body);
      const message = await ChatService.sendMessage(senderId, validatedData);
      return res.status(201).json(message);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // React to a message
  static async toggleReaction(req: AuthRequest, res: Response) {
    try {
      const { messageId } = req.params as { messageId: string };
      const { emoji } = req.body;
      const userId = req.userId as string;
      const updatedMessage = await ChatService.toggleReaction(
        messageId,
        userId,
        emoji,
      );
      return res.status(200).json(updatedMessage);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get inbox chats for a user
  static async getInbox(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId as string;
      const chats = await ChatService.getInboxRoleBased(userId);
      return res.status(200).json(chats);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get messages for a chat
  static async getMessages(req: AuthRequest, res: Response) {
    try {
      const { chatId } = req.params as { chatId: string };
      const { limit, cursor } = req.query;
      const messages = await ChatService.getMessages(
        chatId,
        limit ? parseInt(limit as string) : 50,
        cursor as string,
      );
      return res.status(200).json(messages);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Mark a chat as read
  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const { chatId } = req.params as { chatId: string };
      const userId = req.userId as string;
      await ChatService.markAsRead(chatId, userId);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Delete a message
  static async deleteMessage(req: AuthRequest, res: Response) {
    try {
      const { messageId } = req.params as { messageId: string };
      const userId = req.userId as string;
      const deletedMessage = await ChatService.deleteMessage(messageId, userId);
      return res.status(200).json(deletedMessage);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
