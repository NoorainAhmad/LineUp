import { Router } from "express";
import { CannedResponseController } from "../controllers/canned.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "@/middlewares/role.middleware.js";
import { UserRole } from "@/generated/prisma/index.js";

const router = Router();
router.use(authMiddleware); // All routes below this line require a valid JWT

// Individual: Specific Canned Response
router.get("/:id", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), CannedResponseController.getCannedResponseById);

// List: All Canned Responses by User ID
router.get("/user/:userId", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), CannedResponseController.getCannedResponsesByUserId);

// List: All Canned Responses
router.get("/", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), CannedResponseController.getAllCannedResponses);

// Create: New Canned Response
router.post("/", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), CannedResponseController.createCannedResponse);

// Update: Canned Response
router.patch("/:id", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), CannedResponseController.updateCannedResponse);

// Delete: Canned Response
router.delete("/:id", checkRole([UserRole.MASTER, UserRole.DEVELOPER]), CannedResponseController.deleteCannedResponse);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LineUp Canned Response Service is active",
    timestamp: new Date().toISOString(),
  });
});

export default router;
