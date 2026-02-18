import api from "../api/axios";
import type {
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  RequestOtpInput,
  VerifyOtpInput,
} from "../validators/auth.validator";

export class AuthService {
  static async login(data: LoginInput) {
    const response = await api.post("/auth/login", data);
    return response.data;
    // response.data.data shape: { user, accessToken, refreshToken }
  }

  static async refresh(refreshToken: string) {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data;
    // response.data.data shape: { accessToken, refreshToken }
  }

  static async logout(refreshToken: string) {
    const response = await api.post("/auth/logout", { refreshToken });
    return response.data;
  }

  static async logoutAllDevices() {
    // Access token is attached automatically by the request interceptor
    const response = await api.post("/auth/logout-all");
    return response.data;
  }

  static async register(data: RegisterInput) {
    const response = await api.post("/auth/register", data);
    return response.data;
  }

  static async verifyRegistration(data: VerifyOtpInput) {
    const response = await api.post("/auth/verify-registration", data);
    return response.data;
  }

  static async requestPasswordReset(data: RequestOtpInput) {
    const response = await api.post("/auth/request-otp", data);
    return response.data;
  }

  static async verifyPasswordReset(data: VerifyOtpInput) {
    const response = await api.post("/auth/verify-otp", data);
    return response.data;
  }

  static async resetPassword(data: ResetPasswordInput) {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  }

  static async resendOtp(data: RequestOtpInput) {
    const response = await api.post("/auth/request-otp", data);
    return response.data;
  }
}