import { Router } from "express";
import { SystemController } from "../controllers/system.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { UserRole } from "@/generated/prisma/index.js";
import { checkRole } from "@/middlewares/role.middleware.js";

const router = Router();
router.use(authMiddleware); // All routes below this line require a valid JWT 

// Get: System Settings
router.get("/", checkRole([UserRole.MASTER, UserRole.DEVELOPER]), SystemController.getSystemSettings);

// Update: System Settings
router.post("/", checkRole([UserRole.MASTER, UserRole.DEVELOPER]), SystemController.updateSystemSettings);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LineUp System Service is active",
    timestamp: new Date().toISOString(),
  });
});

export default router;
