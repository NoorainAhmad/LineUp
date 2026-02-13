import api from "../api/axios";
import {
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type RequestOtpInput,
  type VerifyOtpInput,
} from "../validators/auth.validator";

export class AuthService {
  // Login user and generate JWT
  static async login(data: LoginInput) {
    const response = await api.post("/auth/login", data);
    return response.data;
  }

  // Register user and request OTP
  static async register(data: RegisterInput) {
    const response = await api.post("/auth/register", data);
    return response.data;
  }

  // Verify user registration OTP
  static async verifyRegistration(data: VerifyOtpInput) {
    const response = await api.post("/auth/verify-registration", data);
    return response.data;
  }

  // Request password reset OTP
  static async requestPasswordReset(data: RequestOtpInput) {
    const response = await api.post("/auth/request-otp", data);
    return response.data;
  }

  // Verify password reset OTP
  static async verifyPasswordReset(data: VerifyOtpInput) {
    const response = await api.post("/auth/verify-otp", data);
    return response.data;
  }

  // Password reset - update user password
  static async resetPassword(data: ResetPasswordInput) {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  }

  // Resend OTP for verification or password reset requests
  static async resendOtp(data: RequestOtpInput) {
    const response = await api.post("/auth/request-otp", data);
    return response.data;
  }
}
