import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
  requestOtpSchema,
  logoutSchema,
  refreshTokenSchema
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);

router.post("/verify-registration", validate(verifyOtpSchema), AuthController.verifyRegistration);

router.post("/login", validate(loginSchema), AuthController.login);

// Refresh token comes from cookie → no validator needed
router.post("/refresh", AuthController.refresh);

// Refresh token from cookie → no validator needed
router.post("/logout", AuthController.logout);

router.post("/logout-all", authMiddleware, AuthController.logoutAllDevices);

router.post("/request-otp", validate(requestOtpSchema), AuthController.requestOtp);

router.post("/verify-otp", validate(verifyOtpSchema), AuthController.verifyOtp);

router.post("/reset-password", validate(resetPasswordSchema), AuthController.resetPassword);

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Auth Service is active",
    timestamp: new Date().toISOString(),
  });
});

export default router;
