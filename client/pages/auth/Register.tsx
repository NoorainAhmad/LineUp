import React, { useState } from "react";
import {
  Phone,
  Lock,
  Fingerprint,
  ArrowRight,
  Loader2,
  AlertCircle,
  User2Icon,
} from "lucide-react";
import { Layout } from "./Layout";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate, useParams } from "react-router-dom";
import { AuthService } from "@/services/auth.service";

export const Register: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { parentId } = useParams();

  const [formData, setFormData] = useState({
    guid: "",
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    parentId: "",
  });

  if (parentId) {
    formData.parentId = parentId;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    const { confirmPassword, ...userData } = formData;

    try {
      await AuthService.register({
        ...userData,
      });
      navigate(`/verify/auth`, { state: { phone: userData.phone } });
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      theme={theme}
      onToggleTheme={toggleTheme}
      title="Create account"
      subtitle="Join LineUp with a unique identity"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3.5 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
            <AlertCircle size={18} className="shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Unique ID - Full Width */}
          <div className="relative group col-span-2">
            <Fingerprint
              className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Unique ID"
              value={formData.guid}
              onChange={(e) =>
                setFormData({ ...formData, guid: e.target.value })
              }
              required
              className="w-full bg-input text-text-main pl-12 pr-4 py-3.5 rounded-xl border border-border/50 focus:border-primary/50 focus:bg-surface focus:outline-none transition-all placeholder-secondary/70"
            />
          </div>

          {/* Full Name - Full Width */}
          <div className="relative group col-span-2">
            <User2Icon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full bg-input text-text-main pl-12 pr-4 py-3.5 rounded-xl border border-border/50 focus:border-primary/50 focus:bg-surface focus:outline-none transition-all placeholder-secondary/70"
            />
          </div>

          {/* Phone Number - Full Width */}
          <div className="relative group col-span-2">
            <Phone
              className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
              className="w-full bg-input text-text-main pl-12 pr-4 py-3.5 rounded-xl border border-border/50 focus:border-primary/50 focus:bg-surface focus:outline-none transition-all placeholder-secondary/70"
            />
          </div>

          {/* Password - Split Row */}
          <div className="relative group col-span-2 sm:col-span-1">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="w-full bg-input text-text-main pl-12 pr-4 py-3.5 rounded-xl border border-border/50 focus:border-primary/50 focus:bg-surface focus:outline-none transition-all placeholder-secondary/70"
            />
          </div>

          {/* Confirm Password - Split Row */}
          <div className="relative group col-span-2 sm:col-span-1">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="password"
              placeholder="Confirm"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              className="w-full bg-input text-text-main pl-12 pr-4 py-3.5 rounded-xl border border-border/50 focus:border-primary/50 focus:bg-surface focus:outline-none transition-all placeholder-secondary/70"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="pt-4 text-center">
          <p className="text-sm text-secondary font-medium">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-extrabold text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </Layout>
  );
};
