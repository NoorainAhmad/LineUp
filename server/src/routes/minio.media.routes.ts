import { Router } from "express";
import { MinioMediaController } from "../controllers/minio.media.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateMediaTypes } from "../middlewares/media.middleware.js";

const router = Router(); 

// Upload routes for authenticated users
router.post("/upload-url", authMiddleware, validateMediaTypes, MinioMediaController.getUploadUrl,);

// Get user gallery for authenticated users
router.get("/my-gallery", authMiddleware, MinioMediaController.getMyGallery);

// Storage webhook to update database
router.post("/webhook", MinioMediaController.handleStorageWebhook);

// Health check: High-end SaaS standard
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LineUp Media Service is active",
    timestamp: new Date().toISOString(),
  });
});

export default router;
