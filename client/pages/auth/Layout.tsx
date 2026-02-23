import React from "react";
import { Sun, Moon, MessageCircleCodeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  title: string;
  subtitle: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  theme,
  onToggleTheme,
  title,
  subtitle,
}) => {
  const navigate = useNavigate();
  return (
    <div className="h-screen w-full bg-background text-text-main flex flex-col items-center justify-start md:justify-center p-6 md:py-12 relative overflow-y-auto selection:bg-primary/20">
      {/* Background decoration - Fixed position to stay while scrolling */}
      <div
        className="fixed inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(var(--color-pattern), 0.05) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      ></div>
      {/* Theme Toggle - Absolute position remains relative to the scroll container */}
      <button
        onClick={onToggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-surface border border-border text-secondary hover:text-text-main hover:bg-surface-hover transition-colors z-20 shadow-sm"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      {/* Main Card Container */}
      <div className="w-full max-w-115 z-10 animate-in fade-in slide-in-from-bottom-8 duration-500 my-auto">
        <div className="bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden p-8 md:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="cursor-pointer w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary/30 mb-6"
              onClick={() => navigate("/")}>
              <MessageCircleCodeIcon size={24} />
            </div>
            <h1 className="cursor-pointer text-2xl font-bold text-text-main mb-2 tracking-tight"
              onClick={() => navigate("/")}>
              {title}
            </h1>
            <p className="text-secondary text-sm">{subtitle}</p>
          </div>
          {children}
          <p className="text-xs text-secondary text-center mt-2">
            LineUp 24x7 is a secure communication platform.
          </p>
        </div>
        {/* Footer - Aligned with your SaaS aesthetic */}
        <div className="pt-8 text-center text-sm text-secondary">
          © {new Date().getFullYear()} LineUp 24x7
          <div className="mt-1 text-xs">
            <a href="/privacy" className="hover:underline">
              Privacy Policy
            </a>
            {" • "}
            <a href="/terms" className="hover:underline">
              Terms of Service
            </a> 
          </div>
        </div>
      </div>
    </div>
  );
};
