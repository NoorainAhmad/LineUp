// routes/media.routes.ts
import { Router } from "express";
import { MediaController } from "../controllers/media.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateMediaTypes } from "../middlewares/media.middleware.js";
import { checkRole } from "@/middlewares/role.middleware.js";

const router = Router();
router.use(authMiddleware);
 
router.post("/upload-url", checkRole(["USER", "BRANCH", "ADMIN", "MASTER", "DEVELOPER"]), validateMediaTypes, MediaController.getUploadUrl);
 
router.post("/upload-urls", checkRole(["USER", "BRANCH", "ADMIN", "MASTER", "DEVELOPER"]), validateMediaTypes, MediaController.getUploadUrls);
 
router.post("/finalize", checkRole(["USER", "BRANCH", "ADMIN", "MASTER", "DEVELOPER"]), MediaController.finalizeUpload);
router.post("/finalize-bulk", checkRole(["USER", "BRANCH", "ADMIN", "MASTER", "DEVELOPER"]), MediaController.finalizeUploads);
 
router.get("/my-gallery", checkRole(["USER", "BRANCH", "ADMIN", "MASTER", "DEVELOPER"]), MediaController.getMyGallery);
 
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Media Service",
    provider: "AWS S3",
    timestamp: new Date().toISOString()
  });
});

export default router;
