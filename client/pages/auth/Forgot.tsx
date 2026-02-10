import React, { useState } from "react";
import {
  Phone,
  ArrowRight,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Layout } from "./Layout";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/auth.service";

export const Forgot: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await AuthService.requestPasswordReset({ phone: phone });
      navigate(`/verify/reset`, { state: { phone } });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      theme={theme}
      onToggleTheme={toggleTheme}
      title="Reset Password"
      subtitle="Enter your mobile number to receive an OTP"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        <div className="relative group">
          <Phone
            className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
            size={20}
          />
          <input
            type="tel"
            placeholder="Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full bg-input text-text-main pl-12 pr-4 py-3.5 rounded-xl border border-transparent focus:border-primary/50 focus:bg-surface focus:outline-none transition-all placeholder-secondary"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              Send OTP <ArrowRight size={18} />
            </>
          )}
        </button>
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-sm text-secondary hover:text-text-main flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft size={16} /> Back to Sign In
          </button>
        </div>
      </form>
    </Layout>
  );
};
