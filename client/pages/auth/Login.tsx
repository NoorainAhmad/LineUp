import React, { useState } from "react";
import {
  Lock,
  ArrowRight,
  Loader2,
  Fingerprint,
  AlertCircle,
} from "lucide-react";
import { Layout } from "./Layout";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/auth.service";
import { useAuth } from "@/contexts/AuthContext";

export const Login: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await AuthService.login({
        identity,
        password,
      });
      login(response.data.user, response.data.token);
      navigate("/");
    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Registration failed.";

      setError(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      theme={theme}
      onToggleTheme={toggleTheme}
      title="Welcome back"
      subtitle="Sign in with your ID or Phone Number"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="relative group">
            <Fingerprint
              className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Identity (Unique ID or Phone)"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-input text-text-main pl-12 pr-4 py-3.5 rounded-xl border border-transparent focus:border-primary/50 focus:bg-surface focus:outline-none transition-all placeholder-secondary"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Forgot password?
          </button>
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
              Sign In <ArrowRight size={18} />
            </>
          )}
        </button>
        <div className="pt-6 text-center">
          <p className="text-sm text-secondary">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-bold text-primary hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </Layout>
  );
};
