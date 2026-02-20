import { Router } from "express";
import { ChatController } from "../controllers/chat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { UserRole } from "@/generated/prisma/index.js";
import { checkRole } from "@/middlewares/role.middleware.js";

const router = Router();
router.use(authMiddleware);

// Create a new group chat
router.post("/", checkRole([UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), ChatController.createChat);

// Send a new message
router.post("/messages", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), ChatController.sendMessage);

// Edit a new message
router.patch("/messages/:messageId", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), ChatController.editMessage);

// React to a message
router.post("/messages/:messageId/react", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), ChatController.toggleReaction);

// Fetch all inbox chats
router.get("/", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), ChatController.getInbox);

// Fetch all messages in a chat
router.get("/:chatId/messages", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]),  ChatController.getMessages);

// Mark a chat as read
router.patch("/:chatId/read", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), ChatController.markAsRead);

// Toggle archive status of a chat
router.patch("/:chatId/archive", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), ChatController.toggleArchive);

// Pin a chat member
router.patch("/:chatId/pin", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), ChatController.pinChatMember)

// Forward a message to one or more chats
router.post("/messages/forward", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), ChatController.forwardMessage);

// Delete a message by ID
router.delete("/messages/:messageId", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), ChatController.deleteMessage);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LineUp Chat Service is active",
    timestamp: new Date().toISOString(),
  });
});

export default router;
