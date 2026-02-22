import { Router } from "express";
import { StatusController } from "../controllers/status.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { UserRole } from "@/generated/prisma/index.js";
import { checkRole } from "@/middlewares/role.middleware.js";

const router = Router();
router.use(authMiddleware); // Apply Auth Guard - WhatsApp statuses are private to the authenticated circle

// Individual: Get my own active statuses
router.get("/me", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), StatusController.getStatusesByUserId);

// List: All statuses (The "Feed" list)
router.get("/", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), StatusController.getAllStatuses);

// Feed: Grouped statuses from all users (The "Stories" list)
router.get("/feed", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), StatusController.getFeed);

// Create: Post a new TEXT, IMAGE, or VIDEO status
router.post("/", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), StatusController.createStatus);

// Action: Mark a specific status as viewed (Seen By)
router.post("/:id/view", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), StatusController.markAsViewed);

// Detail: Get who viewed a specific status (Seen By list)
router.get("/:id/viewers", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), StatusController.getViewers);

// Action: Reply to a status (sends a DM to status owner)
router.post("/:id/reply", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), StatusController.replyToStatus);

// Delete: Remove a status (Handled by author)
router.delete("/:id", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), StatusController.deleteStatus);

// Health check: High-end SaaS standard
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LineUp Status Service is active",
    timestamp: new Date().toISOString(),
  });
});

export default router;
