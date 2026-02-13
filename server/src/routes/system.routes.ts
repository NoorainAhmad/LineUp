import { Router } from "express";
import { SystemController } from "../controllers/system.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware); // All routes below this line require a valid JWT 

// Get: System Settings
router.get("/", SystemController.getSystemSettings);

// Update: System Settings
router.post("/", SystemController.updateSystemSettings);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LineUp System Service is active",
    timestamp: new Date().toISOString(),
  });
});

export default router;
