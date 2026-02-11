import React, { useState, useMemo, useCallback, memo } from "react";
import {
  MessageSquare,
  LogOut,
  CircleDashed,
  Moon,
  Sun,
  Zap,
  Settings,
  Menu,
  X,
  LayoutDashboard,
  UsersRound,
  MessageCircleCodeIcon,
} from "lucide-react";
import { UserRole, User } from "../../types";
import { Avatar } from "../../components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationItem {
  id: string;
  icon: React.ElementType;
  label: string;
  roles: UserRole[];
}

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onLogout?: () => void;
}

// Define navigation items outside component to prevent recreation on every render
const ALL_NAV_ITEMS: NavigationItem[] = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    roles: [
      UserRole.DEVELOPER,
      UserRole.MASTER,
      UserRole.ADMIN,
      UserRole.BRANCH,
      UserRole.USER,
    ],
  },
  {
    id: "chat",
    icon: MessageSquare,
    label: "Chats",
    roles: [
      UserRole.DEVELOPER,
      UserRole.MASTER,
      UserRole.ADMIN,
      UserRole.BRANCH,
      UserRole.USER,
    ],
  },
  {
    id: "status",
    icon: CircleDashed,
    label: "Status",
    roles: [
      UserRole.DEVELOPER,
      UserRole.MASTER,
      UserRole.ADMIN,
      UserRole.BRANCH,
      UserRole.USER,
    ],
  },
  {
    id: "user",
    icon: UsersRound,
    label: "Users",
    roles: [
      UserRole.DEVELOPER,
      UserRole.MASTER,
      UserRole.ADMIN,
      UserRole.BRANCH, 
    ],
  },
  {
    id: "response",
    icon: Zap,
    label: "Responses",
    roles: [
      UserRole.DEVELOPER,
      UserRole.MASTER,
      UserRole.ADMIN,
      UserRole.BRANCH, 
    ],
  },
  {
    id: "setting",
    icon: Settings,
    label: "Settings",
    roles: [
      UserRole.DEVELOPER,
      UserRole.MASTER 
    ],
  },
];

const NavigationItemButton = memo(
  ({
    item,
    isActive,
    onClick,
    variant = "desktop",
  }: {
    item: NavigationItem;
    isActive: boolean;
    onClick: () => void;
    variant?: "mobile" | "desktop";
  }) => {
    const Icon = item.icon;

    if (variant === "mobile") {
      return (
        <button
          onClick={onClick}
          className={`w-full flex items-center gap-3 p-3 rounded-lg ${
            isActive
              ? "bg-primary/10 text-primary"
              : "text-text-main hover:bg-surface-hover"
          }`}
          aria-current={isActive ? "page" : undefined}
          aria-label={item.label}
        >
          <Icon size={20} aria-hidden="true" />
          <span className="font-medium">{item.label}</span>
        </button>
      );
    }

    // Desktop variant
    return (
      <button
        onClick={onClick}
        className={`w-full aspect-square rounded-xl flex items-center justify-center transition-colors relative group ${
          isActive
            ? "bg-surface-hover text-primary"
            : "text-secondary hover:bg-surface-hover hover:text-text-main"
        }`}
        title={item.label}
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
        {isActive && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
            aria-hidden="true"
          />
        )}
      </button>
    );
  },
);

NavigationItemButton.displayName = "NavigationItemButton";

const ThemeToggleButton = memo(
  ({
    theme,
    onToggleTheme,
  }: {
    theme: "dark" | "light";
    onToggleTheme: () => void;
  }) => (
    <button
      onClick={onToggleTheme}
      className="w-full aspect-square rounded-xl flex items-center justify-center text-secondary hover:bg-surface-hover hover:text-text-main transition-colors"
      title="Toggle Theme"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun size={20} aria-hidden="true" />
      ) : (
        <Moon size={20} aria-hidden="true" />
      )}
    </button>
  ),
);

ThemeToggleButton.displayName = "ThemeToggleButton";

const LogoutButton = memo(
  ({ onLogout, user }: { onLogout?: () => void; user: User }) => {
    const handleClick = useCallback(() => {
      if (onLogout) {
        onLogout();
      }
    }, [onLogout]);

    return (
      <div
        className="pt-2 border-t border-border mt-2 flex justify-center cursor-pointer group relative"
        onClick={handleClick}
        title="Logout"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="Logout"
      >
        <Avatar user={user} size="sm" showStatus />
        <div className="absolute left-full ml-2 px-2 py-1 bg-surface border border-border rounded shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          Log Out
        </div>
      </div>
    );
  },
);

LogoutButton.displayName = "LogoutButton";

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  onLogout,
}) => {
  const { user: currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter navigation items based on user role using useMemo
  const navItems = useMemo(() => {
    return ALL_NAV_ITEMS.filter((item) =>
      item.roles.includes(currentUser.role),
    );
  }, [currentUser.role]);

  // Memoize tab change handler
  const handleTabChange = useCallback(
    (tabId: string) => {
      onTabChange(tabId);
      setIsMobileMenuOpen(false);
    },
    [onTabChange],
  );

  // Memoize mobile menu handlers
  const openMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden h-16 w-full bg-surface border-b border-border flex items-center justify-between px-4 z-50 sticky top-0">
        <div className="font-bold text-xl text-primary tracking-tight">
          LineUp
        </div>
        <button
          onClick={openMobileMenu}
          className="p-2 text-text-main"
          aria-label="Open menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <Menu size={24} aria-hidden="true" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-60 bg-background flex flex-col animate-in slide-in-from-right duration-200"
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="h-16 px-4 flex items-center justify-between border-b border-border">
            <span className="font-bold text-lg text-text-main">Menu</span>
            <button
              onClick={closeMobileMenu}
              className="p-2 text-text-main"
              aria-label="Close menu"
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavigationItemButton
                key={item.id}
                item={item}
                isActive={activeTab === item.id}
                onClick={() => handleTabChange(item.id)}
                variant="mobile"
              />
            ))}
            <div className="border-t border-border my-2 pt-2">
              <button
                onClick={onToggleTheme}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-text-main hover:bg-surface-hover"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <Sun size={20} aria-hidden="true" />
                ) : (
                  <Moon size={20} aria-hidden="true" />
                )}
                <span className="font-medium">Toggle Theme</span>
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-red-500 hover:bg-red-500/10"
                aria-label="Log out"
              >
                <LogOut size={20} aria-hidden="true" />
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-16 h-full bg-surface flex-col items-center py-4 border-r border-border z-40">
        <div className="mb-6">
          <div
            className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl cursor-pointer"
            onClick={() => onTabChange("home")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onTabChange("home");
              }
            }}
            aria-label="Home"
          >
            <MessageCircleCodeIcon size={24} aria-hidden="true" />
          </div>
        </div>

        <nav
          className="flex-1 flex flex-col gap-2 w-full px-2"
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <NavigationItemButton
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
              variant="desktop"
            />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 w-full px-2">
          <ThemeToggleButton theme={theme} onToggleTheme={onToggleTheme} />
          <LogoutButton onLogout={onLogout} user={currentUser} />
        </div>
      </div>
    </>
  );
};

Navigation.displayName = "Navigation";
