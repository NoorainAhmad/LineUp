// routes/media.routes.ts
import { Router } from "express";
import { MediaController } from "../controllers/media.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateMediaTypes } from "../middlewares/media.middleware.js";

const router = Router();

/**
 * @route   POST /api/v1/media/upload-url
 * @desc    Generate pre-signed URL for direct S3 upload
 * @access  Private
 */
router.post(
  "/upload-url",
  authMiddleware,
  validateMediaTypes,
  MediaController.getUploadUrl
);

/**
 * @route   POST /api/v1/media/finalize
 * @desc    Finalize upload after S3 upload is complete
 * @access  Private
 */
router.post(
  "/finalize",
  authMiddleware,
  MediaController.finalizeUpload
);

/**
 * @route   GET /api/v1/media/my-gallery
 * @desc    Get authenticated user's media gallery
 * @access  Private
 */
router.get(
  "/my-gallery",
  authMiddleware,
  MediaController.getMyGallery
);

/**
 * @route   GET /api/v1/media/health
 * @desc    Health check
 * @access  Public
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Media Service",
    provider: "AWS S3",
    timestamp: new Date().toISOString()
  });
});

export default router;