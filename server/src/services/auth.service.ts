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
  static async verifyRegistration(data: z.infer<typeof verifyOtpSchema>) {
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
      const tokens = await this.issueTokenPair(user.id, user.role);

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
  static async login(data: z.infer<typeof loginSchema>) {
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
  static async refresh(incomingRefreshToken: string) {
    if (!incomingRefreshToken) {
      throw new Error("Refresh token is required");
    }
    const stored = await prisma.refreshToken.findUnique({
      where: { token: incomingRefreshToken },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new Error("Invalid or expired refresh token");
    }

    // Rotate: revoke old, issue new pair
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await AuthService.issueTokenPair(
      stored.userId,
      stored.user.role,
      stored.id
    );
    return { success: true, data: tokens };
  }

  //  Logout (single device) ----------------------------------
  static async logout(incomingRefreshToken: string) {
    if (!incomingRefreshToken) {
      throw new Error("Refresh token required");
    }
    await prisma.refreshToken.delete({
      where: { token: incomingRefreshToken },
      
    });
    console.log(`[Auth] One sessions revoked for user`);
    return { success: true, message: "Logged out" };
  }

  //  Logout from ALL devices ----------------------------------------------
  static async logoutAllDevices(userId: string) {
    await prisma.refreshToken.deleteMany({
      where: { userId },
     
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
  static async verifyPasswordReset(data: z.infer<typeof verifyOtpSchema>) {
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
      const tokens = await this.issueTokenPair(user.id, user.role);

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
  private static async issueTokenPair(userId: string, userRole: string, oldTokenId?: string) {
  const accessToken = await jwtUtil.sign({ userId, userRole }, process.env.JWT_SECRET!);
  const rawRefresh = jwtUtil.generateTokenId();

  await prisma.$transaction([
    // Delete old refresh token if rotating
    ...(oldTokenId ? [prisma.refreshToken.delete({ where: { id: oldTokenId } })]: []),
    // Create new refresh token
    prisma.refreshToken.create({
      data: {
        token: rawRefresh,
        userId,
        expiresAt: jwtUtil.refreshExpiresAt(),
      },
    }),
  ]);

  return { accessToken, refreshToken: rawRefresh };
}
}
