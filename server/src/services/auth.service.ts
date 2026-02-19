import z from "zod";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../config/db.js";
import { jwtUtil } from "../utils/jwt.js";
import {
  loginSchema,
  registerSchema,
  requestOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "@/validators/auth.validator.js";
import { OtpService } from "./otp.service.js";

export class AuthService {
  private static userSelection = {
    id: true,
    guid: true,
    name: true,
    phone: true,
    email: true,
    location: true,
    avatarUrl: true,
    status: true,
    lastSeen: true,
    ipAddress: true,
    isActive: true,
    role: true,
    permission: true,
    parentId: true,
    parent: true,
    children: true,
    createdAt: true,
    updatedAt: true,
  };

  // REGISTER A NEW USER
  static async register(data: z.infer<typeof registerSchema>) {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ guid: data.guid }, { phone: data.phone }],
        },
        select: {
          id: true,
          guid: true,
          phone: true,
          isActive: true,
        },
      });
      if (existingUser && existingUser.isActive) {
        if (existingUser.guid === data.guid) {
          throw new Error("ID is already taken. Try another ID.");
        }
        if (existingUser.phone === data.phone) {
          throw new Error("Phone number is already registered.");
        }
      }
      if (existingUser && !existingUser.isActive) {
        await prisma.user.delete({ where: { id: existingUser.id } });
      }
      const hashedPassword = await bcrypt.hash(data.password, 12);
      let activeBranchId = null;
      try {
        const activeBranch = await prisma.system.findFirst({
          select: { activeBranchId: true },
        });
        activeBranchId = activeBranch?.activeBranchId;
      } catch (error) {
        console.log(`[Registration] Error: ${error}`);
      }
      let requestedBranchId = data.parentId;
      if (requestedBranchId) {
        const requestedBranch = await prisma.user.findFirst({
          where: { id: requestedBranchId },
        });
        if (!requestedBranch) {
          console.log(
            `[Registration] Error: Branch not found assigning to active branch!`,
          );
          requestedBranchId = activeBranchId;
        } else {
          requestedBranchId = requestedBranch.id;
        }
      }
      await prisma.user.create({
        data: {
          guid: data.guid,
          name: data.name,
          phone: data.phone,
          passwordHash: hashedPassword,
          parentId: requestedBranchId || activeBranchId,
        },
      });
      const otpRecord = await OtpService.generate(data.phone);
      console.log(`[Registration] OTP for ${data.phone}: ${otpRecord.code}`);
      return {
        success: true,
        message: "Verification code sent successfully",
        data: { phone: data.phone },
      };
    } catch (error: any) {
      console.log(`[Registration] Error: ${error}`);

      // Prisma Unique Constraint Error (SAFE CHECK - NO IMPORT NEEDED)
      if (error?.code === "P2002") {
        console.log("[Registration] Raw Error:", error);
        console.log("[Registration] Error Code:", error?.code);
        console.log("[Registration] Error Message:", error?.message);

        if (error?.message.includes("guid")) {
          throw new Error("ID is already taken; try another ID name.");
        }

        if (error?.message.includes("phone")) {
          throw new Error(
            "Phone number already exists; try another phone number.",
          );
        }

        throw new Error("User already exists with this information.");
      }

      // fallback error
      throw new Error(error.message || "Registration failed.");
    }
  }

  // VERIFY REGISTRATION
  static async verifyRegistration(data: z.infer<typeof verifyOtpSchema>, ipAddress: string, userAgent: string) {
    try {
      const requestedUser = await prisma.user.findFirst({
        where: { phone: data.phone },
      });
      if (!requestedUser)
        throw new Error("No account found with that phone number");
      const isValid = await OtpService.verify(data.phone, data.otp);
      if (!isValid) throw new Error("Invalid or expired verification code");
      const user = await prisma.user.update({
        where: { phone: data.phone },
        data: { isActive: true },
        select: this.userSelection,
      });
      const parentId = user.parentId;
      if (parentId) {
        await prisma.chat.create({
          data: {
            isGroup: false,
            groupName: null,
            groupImage: null,
            members: { create: [{ userId: user.id }, { userId: parentId }] },
          },
        });
      }
      const tokens = await this.issueTokenPair(user.id, user.role, userAgent, ipAddress);

      console.log(`[Verification] Account for ${user.phone} verified`);
      return {
        success: true,
        message: "Account verified successfully",
        data: { user, ...tokens },
      };
    } catch (error) {
      console.log(`[Verification] Error: ${error}`);
      throw new Error("Verification failed: " + (error as Error).message);
    }
  }

  // LOGIN A USER
  static async login(data: z.infer<typeof loginSchema>, ipAddress: string, userAgent: string) {
    try {
      const requestedUser = await prisma.user.findFirst({
        where: {
          OR: [{ guid: data.identity }, { phone: data.identity }],
        },
      });

      if (!requestedUser) throw new Error("No such user exists");

      if (!requestedUser.isActive) {
        throw new Error(
          "Account not verified. Please verify your phone number.",
        );
      }

      const isPasswordValid = await bcrypt.compare(
        data.password,
        requestedUser.passwordHash,
      );

      if (!isPasswordValid) throw new Error("Invalid credentials");

      const tokens = await this.issueTokenPair(
        requestedUser.id,
        requestedUser.role,
        userAgent,
        ipAddress
      );

      const { passwordHash, ...user } = requestedUser;
      console.log(`[Login] User ${user.phone} logged in`);
      return {
        success: true,
        message: "Login successful",
        data: { user, ...tokens },
      };
    } catch (error) {
      console.log(`[Login] Error: ${error}`);
      throw new Error("Login failed: " + (error as Error).message);
    }
  }

  //  Refresh ---------------------------------------------------------------------
  static async refresh(incomingRefreshToken: string, ipAddress: string, userAgent: string) {
    const dotIdx = incomingRefreshToken.indexOf(".");
    if (dotIdx === -1) {
      throw new Error("Invalid refresh token format");
    }
    const id = incomingRefreshToken.substring(0, dotIdx);
    const rawToken = incomingRefreshToken.substring(dotIdx + 1);
    const stored = await prisma.refreshToken.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new Error("Invalid or expired refresh token");
    }
    const isValid = await bcrypt.compare(rawToken, stored.token);
    if (!isValid) {
      throw new Error("Invalid refresh token");
    }

    // Rotate: revoke old, issue new pair
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await AuthService.issueTokenPair(
      stored.userId,
      stored.user.role,
      userAgent, ipAddress
    );
    return { success: true, data: tokens };
  }

  //  Logout (single device) ----------------------------------
  static async logout(incomingRefreshToken: string) {
    const dotIdx = incomingRefreshToken.indexOf(".");
    if (dotIdx === -1) {
      throw new Error("Invalid refresh token format");
    }
    const id = incomingRefreshToken.substring(0, dotIdx);
    const rawToken = incomingRefreshToken.substring(dotIdx + 1);
    const stored = await prisma.refreshToken.findUnique({
      where: { id },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new Error("Invalid or expired refresh token");
    }
    const isValid = await bcrypt.compare(rawToken, stored.token);
    if (!isValid) {
      throw new Error("Invalid refresh token");
    }
    await prisma.refreshToken.updateMany({
      where: { id },
      data: { revokedAt: new Date(), expiresAt: new Date() },  
    });
    console.log(`[Auth] One sessions revoked for user`);
    return { success: true, message: "Logged out" };
  }

  //  Logout from ALL devices ----------------------------------------------
  static async logoutAllDevices(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date(), expiresAt: new Date() },
    });
    console.log(`[Auth] All sessions revoked for user ${userId}`);
    return { success: true, message: "Logged out from all devices" };
  }

  // REQUEST PASSWORD RESET
  static async requestPasswordReset(data: z.infer<typeof requestOtpSchema>) {
    try {
      const user = await prisma.user.findFirst({
        where: { phone: data.phone },
      });
      if (!user) throw new Error("No account found with that phone number");
      const otpRecord = await OtpService.generate(user.phone!);
      console.log(`[Password Reset] OTP for ${user.phone}: ${otpRecord.code}`);
      return {
        success: true,
        message: "Verification code sent successfully",
        data: { phone: user.phone },
      };
    } catch (error) {
      console.log(`[Password Reset] Error: ${error}`);
      throw new Error("Password reset failed: " + (error as Error).message);
    }
  }

  // VERIFY PASSWORD RESET
  static async verifyPasswordReset(data: z.infer<typeof verifyOtpSchema>, ipAddress: string, userAgent: string) {
    try {
      const requestedUser = await prisma.user.findFirst({
        where: { phone: data.phone },
      });

      if (!requestedUser)
        throw new Error("No account found with that phone number");

      const isValid = await OtpService.verify(data.phone, data.otp);

      if (!isValid) throw new Error("Invalid or expired verification code");

      console.log(`[Password Reset] OTP for ${requestedUser.phone} verified`);

      const user = await prisma.user.findFirst({
        where: { phone: data.phone },
        select: this.userSelection,
      });

      if (!user) throw new Error("No account found with that phone number");
      //Remove all existing sessions
      await this.logoutAllDevices(user.id);

      // Issue fresh token pair
      const tokens = await this.issueTokenPair(user.id, user.role, userAgent, ipAddress);

      return {
        success: true,
        message: "Verification successful",
        data: { user, ...tokens },
      };
    } catch (error) {
      console.log(`[Password Reset] Error: ${error}`);
      throw new Error("Password reset failed: " + (error as Error).message);
    }
  }

  // RESET PASSWORD
  static async resetPassword(data: z.infer<typeof resetPasswordSchema>) {
    try {
      const token = data.token;
      const decodedToken = await jwtUtil.verify(token, process.env.JWT_SECRET!);
      if (!decodedToken)
        throw new Error("Invalid or expired verification code");
      const requestedUser = await prisma.user.findFirst({
        where: { phone: data.phone },
      });
      if (!requestedUser)
        throw new Error("No account found with that phone number");
      const hashedPassword = await bcrypt.hash(data.password, 12);
      await prisma.user.update({
        where: { id: requestedUser?.id },
        data: { passwordHash: hashedPassword },
      });
      console.log(`[Password Reset] Password for ${requestedUser.phone} reset`);
      return {
        success: true,
        message: "Password reset successful",
        data: { phone: requestedUser.phone },
      };
    } catch (error) {
      console.log(`[Password Reset] Error: ${error}`);
      throw new Error("Password reset failed: " + (error as Error).message);
    }
  }

  //Helper function to issue token
  private static async issueTokenPair(userId: string, userRole: string, userAgent: string, ipAddress?: string) {
  const accessToken = await jwtUtil.sign({ userId, userRole }, process.env.JWT_SECRET!);
  const {id, raw} = jwtUtil.generateTokenId();
  const tokenHash = await bcrypt.hash(raw, 12)

    // Create new refresh token
    await prisma.refreshToken.create({
      data: {
        id,
        token: tokenHash,
        userId,
        ipAddress,
        userAgent,
        expiresAt: jwtUtil.refreshExpiresAt(),
      },
    });
    const refreshToken = id + "." + raw; // Send both ID and raw token to client
    console.log(`[Auth] Issued new token pair for user ${userId}`);

  return { accessToken, refreshToken };
}
}
