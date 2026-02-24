import { z } from "zod";

// LOGIN VALIDATOR
export const loginSchema = z.object({
  identity: z.string().min(6),
  password: z.string().min(6),
});

// REGISTER VALIDATOR
export const registerSchema = z.object({
  guid: z.string().min(6),
  name: z.string().min(2).max(50),
  phone: z.string().min(10),
  password: z.string().min(6),
  parentId: z.string().optional().nullable(),
});

// OTP REQUEST VALIDATOR
export const requestOtpSchema = z.object({
  phone: z.string().min(10),
});

// OTP VERIFICATION VALIDATOR
export const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
});

// PASSWORD RESET VALIDATOR
export const resetPasswordSchema = z.object({
  phone: z.string().min(10), 
  password: z.string().min(6),
});

// EXPORT TYPES
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>; 
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
