import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { AuthRequest } from "@/middlewares/auth.middleware.js";

import dotenv from "dotenv";
dotenv.config();

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.HTTPS === "TRUE" ? true : false, // true in production (HTTPS) and false in development (HTTP)
  sameSite: "lax" as const,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};

export class AuthController { 
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register({
        ...req.body,
        ipAddress: req.ip,
      });

      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
 
  static async verifyRegistration(req: Request, res: Response) {
    try {
      const ipAddress = req.ip || "0.0.0.0";
      const userAgent = req.get("User-Agent") || "Unknown";

      const result = await AuthService.verifyRegistration(
        req.body,
        ipAddress,
        userAgent
      );

      if (result?.data?.refreshToken) {
        res.cookie(
          "refreshToken",
          result.data.refreshToken,
          REFRESH_COOKIE_OPTIONS
        );
      }

      const { refreshToken, ...safeData } = result.data;

      res.status(200).json(safeData);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
 
  static async login(req: Request, res: Response) {
    try {
      const ipAddress = req.ip || "0.0.0.0";
      const userAgent = req.get("User-Agent") || "Unknown";

      const result = await AuthService.login(
        { ...req.body, ipAddress },
        ipAddress,
        userAgent
      );

      res.cookie(
        "refreshToken",
        result.data.refreshToken,
        REFRESH_COOKIE_OPTIONS
      );

      const { refreshToken, ...safeData } = result.data;

      res.status(200).json(safeData);
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }
 
  static async refresh(req: Request, res: Response) {
    try {
      const ipAddress = req.ip || "0.0.0.0";
      const userAgent = req.get("User-Agent") || "Unknown";

      const incomingRefreshToken = req.cookies?.refreshToken;

      if (!incomingRefreshToken) {
        return res
          .status(400)
          .json({ success: false, message: "Refresh token required" });
      }

      const result = await AuthService.refresh(
        incomingRefreshToken,
        ipAddress,
        userAgent
      );

      // Rotate refresh token if new one issued
      if (result?.data?.refreshToken) {
        res.cookie(
          "refreshToken",
          result.data.refreshToken,
          REFRESH_COOKIE_OPTIONS
        );
      }

      const { refreshToken, ...safeData } = result.data;

      res.status(200).json(safeData);
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }
 
  static async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
 
  static async logoutAllDevices(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const result = await AuthService.logoutAllDevices(userId);

      res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
 
  static async requestOtp(req: Request, res: Response) {
    try {
      const result = await AuthService.requestPasswordReset(req.body);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
 
  static async verifyOtp(req: Request, res: Response) {
    try { 
      const result = await AuthService.verifyPasswordReset(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
 
  static async resetPassword(req: Request, res: Response) {
    try {
      const result = await AuthService.resetPassword(req.body);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
