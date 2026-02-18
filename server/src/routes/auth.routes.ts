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

// Register: New User
router.post("/register", validate(registerSchema), AuthController.register);

// Verify: Registration OTP
router.post("/verify-registration", validate(verifyOtpSchema), AuthController.verifyRegistration);

// Login: User
router.post("/login", validate(loginSchema), AuthController.login);

// 🔥 NEW: Refresh Access Token
router.post("/refresh",validate(refreshTokenSchema), AuthController.refresh);

// 🔥 NEW: Logout (Single Device)
router.post("/logout", validate(logoutSchema),AuthController.logout);

// 🔥 NEW: Logout from All Devices (Protected)
router.post("/logout-all", authMiddleware, AuthController.logoutAllDevices);

// Request: OTP for password reset
router.post("/request-otp", validate(requestOtpSchema), AuthController.requestOtp);

// Verify: OTP for password reset
router.post("/verify-otp", validate(verifyOtpSchema), AuthController.verifyOtp);

// Reset: User password
router.post("/reset-password", validate(resetPasswordSchema), AuthController.resetPassword);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LineUp Auth Service is active",
    timestamp: new Date().toISOString(),
  });
});

export default router;
