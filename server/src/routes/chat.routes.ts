import { Router } from "express";
import { ChatController } from "@/controllers/chat.controller.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

// Create a new group chat
router.post("/", ChatController.createChat);

// Send a new message
router.post("/messages", ChatController.sendMessage);

// React to a message
router.post("/messages/:messageId/react", ChatController.toggleReaction);

// Fetch all inbox chats
router.get("/", ChatController.getInbox);

// Fetch all messages in a chat
router.get("/:chatId/messages", ChatController.getMessages);

// Mark a chat as read
router.patch("/:chatId/read", ChatController.markAsRead);

// Delete a message by ID
router.delete("/messages/:messageId", ChatController.deleteMessage);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LineUp Chat Service is active",
    timestamp: new Date().toISOString(),
  });
});

export default router;
