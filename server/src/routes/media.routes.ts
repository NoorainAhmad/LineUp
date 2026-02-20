// routes/media.routes.ts
import { Router } from "express";
import { MediaController } from "../controllers/media.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateMediaTypes } from "../middlewares/media.middleware.js";

const router = Router();
router.use(authMiddleware);
 
router.post("/upload-url", validateMediaTypes, MediaController.getUploadUrl);
 
router.post("/finalize", MediaController.finalizeUpload);
 
router.get("/my-gallery", MediaController.getMyGallery);
 
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Media Service",
    provider: "AWS S3",
    timestamp: new Date().toISOString()
  });
});

export default router;