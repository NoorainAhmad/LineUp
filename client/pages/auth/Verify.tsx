import React, { useState, useEffect, useRef } from "react";
import { Loader2, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { Layout } from "./Layout";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthService } from "@/services/auth.service";
import { useAuth } from "@/contexts/AuthContext";

export const Verify: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();

  const navigate = useNavigate();

  const { context } = useParams();
  const location = useLocation();
  const phone = location.state?.phone;
  if (!phone) {
    navigate("/login");
  }

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0 || !phone) return;
    setError("");
    setIsLoading(true);
    try {
      await AuthService.resendOtp({ phone });
      setTimeLeft(30);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.readableMessage ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to resend OTP.";

      setError(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      if ((context !== "auth" && context !== "reset") || !phone) {
        setError("Invalid verification context.");
        return;
      }
      if (context === "reset") {
        const response = await AuthService.verifyPasswordReset({
          phone,
          otp: otp.join(""),
        });
        navigate("/reset-password", {
          state: { token: response.data.token, phone },
        });
      } else {
        const response = await AuthService.verifyRegistration({
          phone: phone,
          otp: otp.join(""),
        });
        login(response.data.user, response.data.token);
        navigate("/");
      }
    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.readableMessage ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "OTP verification failed.";

      setError(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      theme={theme}
      onToggleTheme={toggleTheme}
      title="Verify Mobile"
      subtitle="We sent a 6-digit code to your mobile number."
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        <div className="flex justify-center gap-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-10 h-12 text-center text-xl font-bold bg-input border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text-main"
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={isLoading || otp.join("").length !== 6}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            "Verify Code"
          )}
        </button>
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-secondary hover:text-text-main flex items-center gap-1"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={timeLeft > 0}
            className={`flex items-center gap-1 font-bold transition-colors ${timeLeft > 0 ? "text-secondary cursor-not-allowed opacity-70" : "text-primary hover:underline"}`}
          >
            {timeLeft > 0 ? (
              <span>Resend in 00:{timeLeft.toString().padStart(2, "0")}</span>
            ) : (
              <>
                <RefreshCw size={14} /> Resend Code
              </>
            )}
          </button>
        </div>
      </form>
    </Layout>
  );
};
