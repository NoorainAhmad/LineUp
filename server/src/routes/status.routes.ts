import { Router } from "express";
import { StatusController } from "../controllers/status.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware); // Apply Auth Guard - WhatsApp statuses are private to the authenticated circle

// Individual: Get my own active statuses
router.get("/me", StatusController.getStatusesByUserId);

// List: All statuses (The "Feed" list)
router.get("/", StatusController.getAllStatuses);

// Feed: Grouped statuses from all users (The "Stories" list)
router.get("/feed", StatusController.getFeed);

// Create: Post a new TEXT, IMAGE, or VIDEO status
router.post("/", StatusController.createStatus);

// Action: Mark a specific status as viewed (Seen By)
router.post("/:id/view", StatusController.markAsViewed);

// Action: Reply to a status (sends a DM to status owner)
router.post("/:id/reply", StatusController.replyToStatus);

// Delete: Remove a status (Handled by author)
router.delete("/:id", StatusController.deleteStatus);

// Health check: High-end SaaS standard
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LineUp Status Service is active",
    timestamp: new Date().toISOString(),
  });
});

export default router;
