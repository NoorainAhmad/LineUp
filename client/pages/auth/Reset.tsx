import React, { useEffect, useState } from "react";
import { Lock, ArrowRight, Loader2, Check, AlertCircle } from "lucide-react";
import { Layout } from "./Layout";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthService } from "@/services/auth.service";

export const Reset: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const location = useLocation();
  const phone = location.state?.phone;
  const token = location.state?.token;

  if (!phone || !token) {
    navigate("/forgot-password");
    return null;
  }

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!phone) {
      setError("Session expired or invalid. Please start the process again.");
      setTimeout(() => navigate("/forgot-password"), 3000);
    }
  }, [phone, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!phone) {
      setError("Missing verification data. Please request a new code.");
      return;
    }
    setIsLoading(true);
    try {
      await AuthService.resetPassword({
        phone,
        token,
        password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      theme={theme}
      onToggleTheme={toggleTheme}
      title={success ? "Password Reset" : "Set New Password"}
      subtitle={
        success
          ? "Redirecting to login..."
          : "Choose a strong password for your account"
      }
    >
      {success ? (
        <div className="flex flex-col items-center py-8 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-4">
            <Check size={40} />
          </div>
          <p className="text-lg font-bold text-text-main">Success!</p>
          <p className="text-secondary text-sm">
            Your password has been updated.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
                size={20}
              />
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-input text-text-main pl-12 pr-4 py-3.5 rounded-xl border border-transparent focus:border-primary/50 focus:bg-surface focus:outline-none transition-all placeholder-secondary"
              />
            </div>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
                size={20}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-input text-text-main pl-12 pr-4 py-3.5 rounded-xl border border-transparent focus:border-primary/50 focus:bg-surface focus:outline-none transition-all placeholder-secondary"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Reset Password <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      )}
    </Layout>
  );
};
