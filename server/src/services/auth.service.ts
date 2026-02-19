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

  static async register(data: z.infer<typeof registerSchema>) {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ guid: data.guid }, { phone: data.phone }],
        },
      });

      if (existingUser?.isActive) {
        if (existingUser.guid === data.guid)
          throw new Error("ID is already taken.");
        if (existingUser.phone === data.phone)
          throw new Error("Phone already registered.");
      }

      const passwordHash = await bcrypt.hash(data.password, 12);

      const system = await prisma.system.findFirst({
        select: { activeBranchId: true },
      });

      const activeBranchId = system?.activeBranchId ?? null;

      let resolvedParentId = activeBranchId;

      if (data.parentId) {
        const parentExists = await prisma.user.findUnique({
          where: { id: data.parentId },
          select: { id: true },
        });

        resolvedParentId = parentExists?.id ?? activeBranchId;
      }

      const user = existingUser
        ? await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              guid: data.guid,
              name: data.name,
              phone: data.phone,
              passwordHash,
              parentId: resolvedParentId,
              isActive: false,
            },
          })
        : await prisma.user.create({
            data: {
              guid: data.guid,
              name: data.name,
              phone: data.phone,
              passwordHash,
              parentId: resolvedParentId,
            },
          });

      const otp = await OtpService.generate(data.phone);
      console.log(`[OTP] ${data.phone} → ${otp.code}`);

      return {
        success: true,
        message: "Verification code sent",
        data: { phone: user.phone },
      };
    } catch (error: any) {
      if (error?.code === "P2002") {
        if (error.message.includes("guid"))
          throw new Error("ID already taken.");
        if (error.message.includes("phone"))
          throw new Error("Phone already exists.");
      }

      throw new Error(error.message || "Registration failed.");
    }
  }

  static async verifyRegistration(
    data: z.infer<typeof verifyOtpSchema>,
    ipAddress: string,
    userAgent: string,
  ) {
    const user = await prisma.user.findFirst({
      where: { phone: data.phone },
    });

    if (!user) throw new Error("Account not found");

    const validOtp = await OtpService.verify(data.phone, data.otp);
    if (!validOtp) throw new Error("Invalid or expired code");

    const activatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isActive: true },
      select: this.userSelection,
    });

    // Optional side-effect (safe guard)
    if (activatedUser.parentId) {
      await prisma.chat.create({
        data: {
          isGroup: false,
          members: {
            create: [
              { userId: activatedUser.id },
              { userId: activatedUser.parentId },
            ],
          },
        },
      });
    }

    const tokens = await this.issueTokenPair(
      activatedUser.id,
      activatedUser.role,
      userAgent,
      ipAddress,
    );

    return {
      success: true,
      message: "Account verified",
      data: { user: activatedUser, ...tokens },
    };
  }

  static async login(
    data: z.infer<typeof loginSchema>,
    ipAddress: string,
    userAgent: string,
  ) {
    try {
      const requestedUser = await prisma.user.findFirst({
        where: {
          OR: [{ guid: data.identity }, { phone: data.identity }],
        },
      });

      if (!requestedUser) throw new Error("No such user exists");
      if (!requestedUser.isActive) throw new Error("Account not verified");

      const isPasswordValid = await bcrypt.compare(
        data.password,
        requestedUser.passwordHash,
      );

      if (!isPasswordValid) throw new Error("Invalid credentials");

      const tokens = await this.issueTokenPair(
        requestedUser.id,
        requestedUser.role,
        userAgent,
        ipAddress,
      );

      const { passwordHash, ...user } = requestedUser;

      return {
        success: true,
        message: "Login successful",
        data: { user, ...tokens },
      };
    } catch (error) {
      throw new Error("Login failed: " + (error as Error).message);
    }
  }

  static async refresh(
    incomingRefreshToken: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const dotIdx = incomingRefreshToken.indexOf(".");
    if (dotIdx === -1) throw new Error("Invalid refresh token format");

    const sessionId = incomingRefreshToken.substring(0, dotIdx);
    const rawToken = incomingRefreshToken.substring(dotIdx + 1);

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new Error("Invalid or expired session");
    }

    const isValid = await bcrypt.compare(rawToken, session.refreshTokenHash);

    if (!isValid) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { isRevoked: true, revokedAt: new Date() },
      });

      throw new Error("Refresh token reuse detected");
    }

    const newRawRefreshToken = crypto.randomBytes(32).toString("hex");
    const newRefreshTokenHash = await bcrypt.hash(newRawRefreshToken, 12);

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        tokenVersion: { increment: 1 },
        ipAddress,
        userAgent,
        expiresAt: jwtUtil.refreshExpiresAt(),
      },
    });

    const accessToken = await jwtUtil.sign(
      { userId: session.userId, userRole: session.user.role },
      process.env.JWT_SECRET!,
    );

    return {
      success: true,
      data: {
        accessToken,
        refreshToken: `${sessionId}.${newRawRefreshToken}`,
      },
    };
  }

  static async logout(incomingRefreshToken: string) {
    const dotIdx = incomingRefreshToken.indexOf(".");
    if (dotIdx === -1) throw new Error("Invalid refresh token format");

    const sessionId = incomingRefreshToken.substring(0, dotIdx);

    await prisma.session.update({
      where: { id: sessionId },
      data: { isRevoked: true, revokedAt: new Date() },
    });

    return { success: true, message: "Logged out" };
  }

  static async logoutAllDevices(userId: string) {
    await prisma.session.updateMany({
      where: { userId },
      data: { isRevoked: true, revokedAt: new Date() },
    });

    return { success: true, message: "Logged out from all devices" };
  }

  static async requestPasswordReset(data: z.infer<typeof requestOtpSchema>) {
    const user = await prisma.user.findFirst({
      where: { phone: data.phone },
    });

    if (!user) throw new Error("No account found");

    await OtpService.generate(user.phone);

    return {
      success: true,
      message: "OTP sent",
      data: { phone: user.phone },
    };
  }

  static async verifyPasswordReset(data: z.infer<typeof verifyOtpSchema>) {
    const requestedUser = await prisma.user.findFirst({
      where: { phone: data.phone },
    });

    if (!requestedUser) throw new Error("No account found");

    const isValid = await OtpService.verify(data.phone, data.otp);
    if (!isValid) throw new Error("Invalid OTP");

    await this.logoutAllDevices(requestedUser.id);

    return { success: true, message: "OTP verified" };
  }

  static async resetPassword(data: z.infer<typeof resetPasswordSchema>) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    await prisma.user.update({
      where: { phone: data.phone },
      data: { passwordHash: hashedPassword },
    });

    return { success: true, message: "Password reset successful" };
  }

  private static async issueTokenPair(
    userId: string,
    userRole: string,
    userAgent: string,
    ipAddress?: string,
  ) {
    const accessToken = await jwtUtil.sign(
      { userId, userRole },
      process.env.JWT_SECRET!,
    );

    const rawRefreshToken = crypto.randomBytes(32).toString("hex");
    const refreshTokenHash = await bcrypt.hash(rawRefreshToken, 12);

    const session = await prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        ipAddress,
        userAgent,
        expiresAt: jwtUtil.refreshExpiresAt(),
      },
    });

    return {
      accessToken,
      refreshToken: `${session.id}.${rawRefreshToken}`,
    };
  }

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        tokenVersion: { increment: 1 },
        ipAddress,
        userAgent,
        expiresAt: jwtUtil.refreshExpiresAt(),
      },
    });

    const accessToken = await jwtUtil.sign(
      { userId: session.userId, userRole: session.user.role },
      process.env.JWT_SECRET!,
    );

    return {
      success: true,
      data: {
        accessToken,
        refreshToken: `${sessionId}.${newRawRefreshToken}`,
      },
    };
  }

  static async logout(incomingRefreshToken: string) {
    const dotIdx = incomingRefreshToken.indexOf(".");
    if (dotIdx === -1) throw new Error("Invalid refresh token format");

    const sessionId = incomingRefreshToken.substring(0, dotIdx);

    await prisma.session.update({
      where: { id: sessionId },
      data: { isRevoked: true, revokedAt: new Date() },
    });

    return { success: true, message: "Logged out" };
  }

  static async logoutAllDevices(userId: string) {
    await prisma.session.updateMany({
      where: { userId },
      data: { isRevoked: true, revokedAt: new Date() },
    });

    return { success: true, message: "Logged out from all devices" };
  }

  static async requestPasswordReset(data: z.infer<typeof requestOtpSchema>) {
    const user = await prisma.user.findFirst({
      where: { phone: data.phone },
    });

    if (!user) throw new Error("No account found");

    await OtpService.generate(user.phone);

    return {
      success: true,
      message: "OTP sent",
      data: { phone: user.phone },
    };
  }

  static async verifyPasswordReset(data: z.infer<typeof verifyOtpSchema>) {
    const requestedUser = await prisma.user.findFirst({
      where: { phone: data.phone },
    });

    if (!requestedUser) throw new Error("No account found");

    const isValid = await OtpService.verify(data.phone, data.otp);
    if (!isValid) throw new Error("Invalid OTP");

    await this.logoutAllDevices(requestedUser.id);

    return { success: true, message: "OTP verified" };
  }

  static async resetPassword(data: z.infer<typeof resetPasswordSchema>) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    await prisma.user.update({
      where: { phone: data.phone },
      data: { passwordHash: hashedPassword },
    });

    return { success: true, message: "Password reset successful" };
  }

  private static async issueTokenPair(
    userId: string,
    userRole: string,
    userAgent: string,
    ipAddress?: string,
  ) {
    const accessToken = await jwtUtil.sign(
      { userId, userRole },
      process.env.JWT_SECRET!,
    );

    const rawRefreshToken = crypto.randomBytes(32).toString("hex");
    const refreshTokenHash = await bcrypt.hash(rawRefreshToken, 12);

    const session = await prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        ipAddress,
        userAgent,
        expiresAt: jwtUtil.refreshExpiresAt(),
      },
    });

    return {
      accessToken,
      refreshToken: `${session.id}.${rawRefreshToken}`,
    };
  }
}
