import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { AuthRequest } from "@/middlewares/auth.middleware.js";

export class AuthController {
  // Register a new user
  static async register(req: Request, res: Response) {
    try {
      req.body.ipAddress = req.ip;
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Verify user registration
  static async verifyRegistration(req: Request, res: Response) {
    try {
      const result = await AuthService.verifyRegistration(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Login a user and generate JWT
  static async login(req: Request, res: Response) {
    try {
      req.body.ipAddress = req.ip;
      const result = await AuthService.login(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  //Refresh Access Token ================---------------------=========================
  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken)
        return res.status(400).json({ message: "Refresh token required" });
      const result = await AuthService.refresh(refreshToken);
      res.json(result);
    } catch (e) {
      res.status(401).json({ success: false, message: (e as Error).message });
    }
  }
  //Logout from single device =======================------------------------===========
  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken)
        return res.status(400).json({ message: "Refresh token required" });
      const result = await AuthService.logout(refreshToken);
      res.json(result);
    } catch (e) {
      res.status(400).json({ success: false, message: (e as Error).message });
    }
  }

  // Logout From All Devices ====================------------------------===========================
  static async logoutAllDevices(req: AuthRequest, res: Response) {
    try {
      const user = req.userId;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await AuthService.logoutAllDevices(user);

      res.status(200).json(result);
    } catch (error: any) {
      console.log(`[LogoutAll Controller] Error: ${error}`);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Request OTP
  static async requestOtp(req: Request, res: Response) {
    try {
      const result = await AuthService.requestPasswordReset(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Verify OTP
  static async verifyOtp(req: Request, res: Response) {
    try {
      const result = await AuthService.verifyPasswordReset(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Reset Password
  static async resetPassword(req: Request, res: Response) {
    try {
      const result = await AuthService.resetPassword(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
