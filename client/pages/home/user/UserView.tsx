import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Shield,
  MessageSquare,
  Fingerprint,
  Copy,
  Check,
  Pencil,
  Save,
  X,
  Ban,
  Activity,
  Server,
  Ticket,
  Camera,
  Crown,
  ArrowLeft,
  Users,
  Building,
  ChevronRight,
  ChevronDown,
  Briefcase,
  Search,
  Code2Icon,
  User as UserIcon,
} from "lucide-react";
import { User, UserRole, UserStatus } from "../../../types";
import { Avatar } from "../../../components/ui/Avatar";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";

interface UserViewProps {
  user: User;
  onStartChat: (user: User) => void;
  onSelect: (user: User) => void;
  onUpdate: (user: User) => void;
  onBack?: () => void;
}

const HierarchyNode = ({
  user,
  onUserSelect,
}: {
  user: User;
  onUserSelect?: (user: User) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren =
    user.role !== UserRole.USER || (user.children && user.children.length > 0);

  // Query to fetch children/subordinates
  const { data: children = [] } = useQuery({
    queryKey: ["user-children", user.id],
    queryFn: async () => {
      try {
        if (!user.id) return [];
        const response = await UserService.getUserSubordinates(user?.id);
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error("Error fetching subordinates:", error);
        return [];
      }
    },
    enabled: isOpen && hasChildren, // Only fetch when node is expanded
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasChildren) return;
    setIsOpen(!isOpen);
  };

  const getIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.DEVELOPER:
        return <Code2Icon size={14} className="text-black" />;
      case UserRole.MASTER:
        return <Crown size={14} className="text-purple-500" />;
      case UserRole.ADMIN:
        return <Shield size={14} className="text-blue-500" />;
      case UserRole.BRANCH:
        return <Building size={14} className="text-orange-500" />;
      case UserRole.USER:
        return <Users size={14} className="text-green-500" />;
      default:
        return <UserIcon size={14} className="text-gray-500" />;
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  return (
    <div className="select-none animate-in fade-in slide-in-from-left-2 duration-300">
      <div
        onClick={handleUserClick}
        className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-border hover:bg-surface-hover ${
          isOpen ? "bg-surface-hover" : ""
        }`}
      >
        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
          {hasChildren ? (
            <button
              onClick={handleToggle}
              className="text-text-main transition-colors cursor-pointer"
            >
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-3 h-3 rounded-full bg-border" />
          )}
        </div>

        <div className="relative">
          <Avatar user={user} size="sm" showStatus />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-text-main truncate">
              {user.name}
            </span>
            {getIcon(user.role)}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-secondary truncate uppercase tracking-wider">
              {user.role}
            </p>
            {user.location && (
              <span className="text-[10px] text-secondary truncate">
                • {user.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {isOpen && children.length > 0 && (
        <div className="relative ml-4 pl-4 border-l border-border/50 mt-1 space-y-1">
          {children.map((child) => (
            <HierarchyNode
              key={child.id}
              user={child}
              onUserSelect={onUserSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const UserView: React.FC<UserViewProps> = ({
  user,
  onStartChat,
  onSelect,
  onUpdate,
  onBack,
}) => {
  const { user: currentUser } = useAuth();

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email || "",
    phone: user.phone || "",
    location: user.location || "",
    role: user.role,
  });

  // Query for user's subordinates
  const { data: subordinates = [] } = useQuery({
    queryKey: ["user-subordinates", user.id],
    queryFn: async () => {
      try {
        const response = await UserService.getUserSubordinates(user.id);
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error("Error fetching subordinates:", error);
        return [];
      }
    },
  });

  // Query for searching users
  const { data: searchResults = [], refetch: searchUsers } = useQuery({
    queryKey: ["search-users", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      try {
        const response = await UserService.searchUsers(searchQuery);
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error("Error searching users:", error);
        return [];
      }
    },
    enabled: false, // We'll manually trigger search
  });

  // Query for user stats/analytics
  const { data: userStats } = useQuery({
    queryKey: ["user-stats", user.id],
    queryFn: async () => {
      try {
        const response = await UserService.getUserStats(user.id);
        return (
          response || {
            uptime: "99.9%",
            deployments: 0,
            avgResponse: "N/A",
          }
        );
      } catch (error) {
        console.error("Error fetching user stats:", error);
        return {
          uptime: "N/A",
          deployments: 0,
          avgResponse: "N/A",
        };
      }
    },
  });

  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || "",
      role: user.role,
    });
    setIsEditing(false);
    setSearchQuery("");
  }, [user]);

  // Handle search with debounce
  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        searchUsers();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, searchUsers]);

  const copyGuid = () => {
    navigator.clipboard.writeText(user.guid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const updatedUser: User = {
      ...user,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      role: formData.role,
      updatedAt: new Date().toISOString(),
    };

    onUpdate(updatedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || "",
      role: user.role,
    });
    setIsEditing(false);
  };

  const handleDeactivate = async () => {
    if (
      window.confirm(
        `Are you sure you want to ${user.isActive ? "deactivate" : "activate"} this account?`,
      )
    ) {
      try {
        const updatedUser: User = {
          ...user,
          isActive: !user.isActive,
          status: !user.isActive ? UserStatus.ONLINE : UserStatus.OFFLINE,
          updatedAt: new Date().toISOString(),
        };

        if (!user.isActive) {
          updatedUser.name = user.name.replace(" (Deactivated)", "");
        } else if (!updatedUser.name.includes("(Deactivated)")) {
          updatedUser.name = `${user.name} (Deactivated)`;
        }

        onUpdate(updatedUser);
      } catch (error) {
        console.error("Error toggling user status:", error);
        alert("Failed to update user status. Please try again.");
      }
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.DEVELOPER:
        return "text-black bg-black/10 border-black/20";
      case UserRole.MASTER:
        return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      case UserRole.ADMIN:
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case UserRole.BRANCH:
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case UserRole.USER:
        return "text-green-500 bg-green-500/10 border-green-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.DEVELOPER:
        return <Code2Icon size={14} />;
      case UserRole.MASTER:
        return <Crown size={14} />;
      case UserRole.ADMIN:
        return <Shield size={14} />;
      case UserRole.BRANCH:
        return <Building size={14} />;
      case UserRole.USER:
        return <Users size={14} />;
      default:
        return <UserIcon size={14} />;
    }
  };

  const handleUserSelect = (selectedUser: User) => {
    onSelect(selectedUser);
    // This would navigate to the selected user's profile
    // For now, we'll just alert the action
    // In a real app, you would have navigation or call a callback
  };

  const handleStartChatWithUser = () => {
    if (!user.isActive) {
      alert("Cannot start chat with a deactivated user.");
      return;
    }
    onStartChat(user);
  };

  return (
    <div className="flex-1 h-full bg-background relative overflow-hidden flex flex-col animate-in fade-in duration-300">
      {/* Mobile Back Header */}
      <div className="md:hidden h-16 flex items-center px-4 bg-surface border-b border-border z-20 shrink-0">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-secondary hover:text-text-main"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-bold text-text-main ml-2">User Profile</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Cover Image */}
        <div className="h-32 w-full bg-linear-to-br from-primary/50 to-background relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent"></div>
        </div>

        <div className="mx-auto px-4 sm:px-8 pb-12 -mt-24 relative z-10">
          {/* Main Profile Card */}
          <div className="bg-surface border border-border rounded-2xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-end mb-8 relative overflow-hidden backdrop-blur-sm">
            {/* Top Right Actions */}
            <div className="absolute top-8 right-8 flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="p-2 bg-surface-hover hover:bg-secondary/20 text-text-main rounded-full transition-colors border border-border"
                    title="Cancel"
                  >
                    <X size={20} />
                  </button>
                  <button
                    onClick={handleSave}
                    className="p-2 bg-primary hover:bg-primary/90 text-white rounded-full transition-colors shadow-lg"
                    title="Save Changes"
                  >
                    <Save size={20} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-surface-hover hover:bg-secondary/20 text-text-main rounded-full transition-colors border border-border"
                  title="Edit Profile"
                  disabled={!user.isActive}
                >
                  <Pencil size={18} />
                </button>
              )}
            </div>

            {/* Avatar */}
            <div className="relative group shrink-0 mx-auto md:mx-0">
              <div className="p-4 bg-surface rounded-3xl shadow-lg inline-block">
                <Avatar user={user} size="xl" showStatus={!isEditing} />
              </div>
              {!user.isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-3xl">
                  <Ban className="text-red-500 drop-shadow-md" size={32} />
                </div>
              )}
              {isEditing && user.isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer m-1.5">
                  <Camera className="text-white drop-shadow-md" size={32} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="text-3xl font-black text-text-main mb-2 bg-input border border-primary/50 rounded-lg px-2 py-1 w-full md:w-auto text-center md:text-left focus:outline-none"
                  placeholder="Full Name"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-black text-text-main mb-2 tracking-tight">
                  {user.name}
                  {!user.isActive && (
                    <span className="text-red-500 text-sm ml-2">
                      (Deactivated)
                    </span>
                  )}
                </h1>
              )}

              <div className="flex flex-col md:flex-row items-center gap-3 text-sm">
                {isEditing ? (
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="px-3 py-1 rounded-full bg-input border border-border text-xs font-bold uppercase tracking-wider focus:border-primary focus:outline-none cursor-pointer"
                  >
                    <option value={UserRole.DEVELOPER}>Developer</option>
                    <option value={UserRole.MASTER}>Master</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                    <option value={UserRole.BRANCH}>Branch</option>
                    <option value={UserRole.USER}>User</option>
                  </select>
                ) : (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${getRoleColor(user.role)}`}
                  >
                    {getRoleIcon(user.role)}
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                )}

                <span className="text-secondary flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${user.status === UserStatus.ONLINE ? "bg-green-500 animate-pulse" : "bg-secondary"}`}
                  ></div>
                  {user.status === UserStatus.ONLINE
                    ? "Online Now"
                    : `Last seen ${user.lastSeen}`}
                </span>
              </div>
            </div>

            {/* Main Action */}
            {!isEditing && user.id !== currentUser?.id && (
              <button
                onClick={handleStartChatWithUser}
                disabled={!user.isActive}
                className={`w-full md:w-auto px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  user.isActive
                    ? "bg-primary hover:bg-primary/90 text-white hover:shadow-primary/25"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                <MessageSquare size={16} />
                <span>Message</span>
              </button>
            )}
          </div>

          {/* Grid Layout for details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Contact & System */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hierarchy Section */}
              {user?.role !== UserRole.USER && (
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                        <Briefcase size={16} /> Team Hierarchy
                      </h3>
                      <p className="text-xs font-medium text-secondary mt-1">
                        View team structure
                      </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
                        size={14}
                      />
                      <input
                        type="text"
                        placeholder="Search team members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-hover border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-text-main"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-background rounded-xl border border-border p-4 min-h-64 max-h-125 overflow-y-auto custom-scrollbar">
                    {searchQuery ? (
                      // Search Results View
                      <div className="space-y-1">
                        {searchResults.length > 0 ? (
                          <>
                            <p className="text-xs font-bold text-primary uppercase mb-2 px-2">
                              Search Results ({searchResults.length})
                            </p>
                            {searchResults.map((result) => (
                              <div
                                key={result.id}
                                onClick={() => handleUserSelect(result)}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover cursor-pointer border border-transparent hover:border-border transition-all"
                              >
                                <Avatar user={result} size="sm" showStatus />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-text-main truncate">
                                      {result.name}
                                      {!result.isActive && (
                                        <span className="text-red-500 text-xs ml-1">
                                          (Inactive)
                                        </span>
                                      )}
                                    </span>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.5 rounded-full border uppercase font-bold tracking-wider ${
                                        result.role === UserRole.BRANCH
                                          ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                          : result.role === UserRole.ADMIN
                                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                            : result.role === UserRole.MASTER
                                              ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                                              : "bg-surface text-secondary border-border"
                                      }`}
                                    >
                                      {result.role}
                                    </span>
                                  </div>
                                  <p className="text-xs text-secondary truncate">
                                    {result.email || "No email"}
                                  </p>
                                </div>
                                <ChevronRight
                                  size={14}
                                  className="text-secondary opacity-50"
                                />
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10 text-secondary">
                            <Search size={24} className="mb-2 opacity-50" />
                            <p className="text-sm">
                              No members found matching "{searchQuery}"
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Hierarchy Tree View
                      <>
                        {subordinates.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50 px-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                              <span className="text-xs font-bold text-primary uppercase">
                                {user.role === UserRole.MASTER
                                  ? "System Admins"
                                  : user.role === UserRole.ADMIN
                                    ? "Managed Branches"
                                    : "Branch Staff"}
                              </span>
                            </div>
                            {subordinates.map((sub) => (
                              <HierarchyNode
                                key={sub.id}
                                user={sub}
                                onUserSelect={handleUserSelect}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-secondary py-10 opacity-70">
                            <Users size={32} className="mb-2" />
                            <p className="text-sm">No subordinates found.</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Info Card */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Mail size={16} /> Contact Details
                </h3>
                <div className="space-y-4">
                  {(currentUser.role === UserRole.MASTER ||
                    currentUser.role === UserRole.DEVELOPER) && (
                    <EditableRow
                      icon={Mail}
                      label="Email Address"
                      value={formData.email}
                      isEditing={isEditing}
                      onChange={(v) => setFormData({ ...formData, email: v })}
                      disabled={!user.isActive}
                    />
                  )}
                  {(currentUser.role === UserRole.MASTER ||
                    currentUser.role === UserRole.DEVELOPER) && (
                    <EditableRow
                      icon={Phone}
                      label="Phone Number"
                      value={formData.phone}
                      isEditing={isEditing}
                      onChange={(v) => setFormData({ ...formData, phone: v })}
                      disabled={!user.isActive}
                    />
                  )}
                  <EditableRow
                    icon={MapPin}
                    label="Location"
                    value={formData.location}
                    isEditing={isEditing}
                    onChange={(v) => setFormData({ ...formData, location: v })}
                    disabled={!user.isActive}
                  />
                </div>
              </div>

              {/* System Identity Card */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Shield size={16} /> System Identity
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface-hover/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Fingerprint size={16} className="text-secondary" />
                        <span className="text-sm font-medium text-text-main">
                          User GUID
                        </span>
                      </div>
                      <button
                        onClick={copyGuid}
                        className="text-secondary hover:text-primary transition-colors p-1 rounded-md hover:bg-surface-hover"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <code className="block bg-black/80 text-green-400 p-2.5 rounded-lg text-xs font-mono break-all border border-white/5">
                      {user.guid}
                    </code>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-hover/50 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield size={16} className="text-secondary" />
                      <span className="text-sm font-medium text-text-main">
                        Access Level
                      </span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2 mb-2 overflow-hidden border border-border">
                      <div
                        className={`h-full ${
                          user.role === UserRole.DEVELOPER
                            ? "bg-black w-full"
                            : user.role === UserRole.MASTER
                              ? "bg-purple-500 w-4/5"
                              : user.role === UserRole.ADMIN
                                ? "bg-blue-500 w-3/5"
                                : user.role === UserRole.BRANCH
                                  ? "bg-orange-500 w-2/5"
                                  : "bg-green-500 w-1/5"
                        }`}
                      ></div>
                    </div>
                    <p className="text-xs text-secondary">
                      {user.role === UserRole.DEVELOPER
                        ? "Full Root Access"
                        : user.role === UserRole.MASTER
                          ? "Full System Access"
                          : user.role === UserRole.ADMIN
                            ? "Regional Admin Access"
                            : user.role === UserRole.BRANCH
                              ? "Branch Level Access"
                              : "Standard User Access"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Stats & Actions */}
            <div className="space-y-6">
              {/* Stats Cards Vertical */}
              <div className="space-y-3">
                <StatsCard
                  icon={Activity}
                  label="Account Age"
                  value={(() => {
                    if (!user.createdAt) return "N/A";
                    const createdAt = new Date(user.createdAt);
                    const now = new Date();
                    const diffMs = now.getTime() - createdAt.getTime();
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    return diffDays > 365
                      ? `${Math.floor(diffDays / 365)}y`
                      : `${diffDays}d`;
                  })()}
                  color="text-green-500"
                />
                <StatsCard
                  icon={Server}
                  label="Deployments"
                  value={userStats?.deployments || "0"}
                  color="text-blue-500"
                />
                <StatsCard
                  icon={Ticket}
                  label="Avg Response"
                  value={userStats?.avgResponse || "N/A"}
                  color="text-purple-500"
                />
              </div>

              {/* Account Status Zone */}
              <div
                className={`rounded-2xl p-6 border ${user.isActive ? "bg-green-500/5 border-green-500/10" : "bg-red-500/5 border-red-500/10"}`}
              >
                <h3
                  className={`text-sm font-bold uppercase tracking-wider mb-2 ${user.isActive ? "text-green-500" : "text-red-500"}`}
                >
                  Account Status
                </h3>
                <p className="text-xs text-secondary mb-4">
                  {user.isActive
                    ? "This account is currently active and has full system access."
                    : "This account is deactivated and cannot access the system."}
                </p>
                <button
                  onClick={handleDeactivate}
                  className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border transition-all font-medium text-sm ${
                    user.isActive
                      ? "bg-surface hover:bg-red-500 hover:text-white border-border hover:border-red-500 text-red-500"
                      : "bg-surface hover:bg-green-500 hover:text-white border-border hover:border-green-500 text-green-500"
                  }`}
                >
                  <Ban size={16} />
                  {user.isActive ? "Deactivate Account" : "Activate Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-primary/20 transition-colors group">
    <div className="flex items-center gap-3">
      <div
        className={`p-2.5 rounded-lg bg-surface-hover ${color} group-hover:scale-110 transition-transform`}
      >
        <Icon size={20} />
      </div>
      <span className="text-xs font-bold text-secondary uppercase tracking-wider">
        {label}
      </span>
    </div>
    <span className="text-lg font-black text-text-main font-mono">{value}</span>
  </div>
);

const EditableRow = ({
  icon: Icon,
  label,
  value,
  isEditing,
  onChange,
  disabled = false,
}: any) => (
  <div
    className={`flex items-start gap-3 p-3 rounded-xl bg-surface-hover/30 hover:bg-surface-hover/50 transition-colors border ${isEditing ? "border-primary/30" : "border-transparent"}`}
  >
    <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-secondary shadow-sm">
      <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0 pt-0.5">
      <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-0.5">
        {label}
      </p>
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-input border border-border rounded px-2 py-1 text-sm text-text-main focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        />
      ) : (
        <p
          className={`text-text-main text-sm font-medium truncate ${!value ? "opacity-50 italic" : ""}`}
        >
          {value || "Not set"}
        </p>
      )}
    </div>
  </div>
);
