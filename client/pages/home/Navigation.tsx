import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
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
  IdCardIcon,
  UserCircle2Icon,
  LogOutIcon,
} from "lucide-react";
import { UserRole, User } from "../../types";
import { Avatar } from "../../components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

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
    roles: [UserRole.DEVELOPER, UserRole.MASTER], // Added MASTER role
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
    variant?: "mobile" | "desktop" | "bottom";
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

    if (variant === "bottom") {
      return (
        <button
          onClick={onClick}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors relative ${
            isActive
              ? "text-primary"
              : "text-text-secondary hover:text-text-main"
          }`}
          aria-current={isActive ? "page" : undefined}
          aria-label={item.label}
        >
          <Icon size={24} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
          <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          {isActive && (
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full"
              aria-hidden="true"
            />
          )}
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

const LogoutButton = memo(({ onLogout }: { onLogout?: () => void }) => {
  const handleClick = useCallback(() => {
    if (onLogout) {
      onLogout();
    }
  }, [onLogout]);

  return (
    <button
      className="w-full aspect-square rounded-xl flex items-center justify-center text-secondary hover:bg-surface-hover hover:text-text-main transition-colors"
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
      <LogOutIcon size={20} aria-hidden="true" />
    </button>
  );
});
LogoutButton.displayName = "LogoutButton";

const MyProfileButton = memo(({ handleClick }: { handleClick: () => void }) => {
  const { user } = useAuth();
  return (
    <div
      className="pt-3 border-t border-text-main/10 mt-2 flex justify-center cursor-pointer group relative"
      onClick={handleClick}
      title="My Profile"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label="My Profile"
    >
      <Avatar user={user as User} size="sm" showStatus />
      <div className="absolute left-full ml-2 px-2 py-1 bg-surface border border-border rounded shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
        My Profile
      </div>
    </div>
  );
});
MyProfileButton.displayName = "MyProfileButton";

// New component for mobile top bar with settings
const MobileTopBar = memo(
  ({
    theme,
    onToggleTheme,
    onLogout,
    onProfileClick,
    showSettings,
    onSettingsClick,
  }: {
    theme: "dark" | "light";
    onToggleTheme: () => void;
    onLogout?: () => void;
    onProfileClick: () => void;
    showSettings: boolean;
    onSettingsClick: () => void;
  }) => {
    const [showMenu, setShowMenu] = useState(false);
    const { user } = useAuth();

    return (
      <div className="md:hidden h-16 w-full bg-surface border-b border-border flex items-center justify-between px-4 z-50 sticky top-0">
        <div className="font-bold text-xl text-primary tracking-tight">
          LineUp
        </div>
        <div className="flex items-center gap-2">
          {showSettings && (
            <button
              onClick={onSettingsClick}
              className="p-2 text-text-main hover:bg-surface-hover rounded-lg"
              aria-label="Settings"
            >
              <Settings size={22} />
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-text-main hover:bg-surface-hover rounded-lg"
              aria-label="User menu"
              aria-expanded={showMenu}
            >
              <Avatar user={user as User} size="sm" showStatus />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    onProfileClick();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-text-main hover:bg-surface-hover"
                >
                  <UserCircle2Icon size={18} />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => {
                    onToggleTheme();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-text-main hover:bg-surface-hover"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  <span>Toggle Theme</span>
                </button>
                <button
                  onClick={() => {
                    onLogout?.();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-500/10"
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
MobileTopBar.displayName = "MobileTopBar";

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter navigation items based on user role using useMemo
  const navItems = useMemo(() => {
    return ALL_NAV_ITEMS.filter((item) =>
      item.roles.includes(currentUser!.role),
    );
  }, [currentUser!.role]);

  // Get bottom navigation items (first 5 items or all for mobile)
  const bottomNavItems = useMemo(() => {
    return navItems.slice(0, 5); // Limit to 5 items for bottom nav like WhatsApp
  }, [navItems]);

  // Check if user can see settings
  const canSeeSettings = useMemo(() => {
    return [UserRole.DEVELOPER, UserRole.MASTER].includes(currentUser!.role);
  }, [currentUser!.role]);

  // Memoize tab change handler
  const handleTabChange = useCallback(
    (tabId: string) => {
      onTabChange(tabId);
      setIsMobileMenuOpen(false);
    },
    [onTabChange],
  );

  const handleSettingsClick = useCallback(() => {
    onTabChange("setting");
  }, [onTabChange]);

  const handleProfileClick = useCallback(() => {
    onTabChange("my-profile");
  }, [onTabChange]);

  // Memoize mobile menu handlers
  const openMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      {/* Mobile Top Bar with Settings */}
      <MobileTopBar
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
        onProfileClick={handleProfileClick}
        showSettings={canSeeSettings}
        onSettingsClick={handleSettingsClick}
      />

      {/* Mobile Bottom Navigation - WhatsApp Style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
        <nav className="flex items-center justify-around px-2">
          {bottomNavItems.map((item) => (
            <NavigationItemButton
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              onClick={() => handleTabChange(item.id)}
              variant="bottom"
            />
          ))}
        </nav>
      </div>

      {/* Mobile Menu Overlay - Now only for additional items if needed */}
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
            {navItems.slice(5).map((item) => (
              <NavigationItemButton
                key={item.id}
                item={item}
                isActive={activeTab === item.id}
                onClick={() => handleTabChange(item.id)}
                variant="mobile"
              />
            ))}
            {navItems.length <= 5 && (
              <div className="text-text-secondary text-center py-4">
                No additional menu items
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Sidebar - Keep unchanged */}
      <div className="hidden md:flex w-16 h-full bg-surface flex-col items-center py-4 border-r border-border z-40">
        <div className="mb-6">
          <div
            className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl cursor-pointer"
            onClick={() => navigate("/app")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/app");
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
          <LogoutButton onLogout={onLogout} />
          <MyProfileButton handleClick={handleProfileClick} />
        </div>
      </div>
    </>
  );
};

Navigation.displayName = "Navigation";