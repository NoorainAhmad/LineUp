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
} from "lucide-react";
import { User, UserRole, UserStatus } from "../../../types";
import { Avatar } from "../../../components/ui/Avatar";

interface UserViewProps {
  user: User;
  onStartChat: (user: User) => void;
  onUpdate: (user: User) => void;
  onBack?: () => void; // Optional back handler for mobile
}

// Mock Data Generator for Hierarchy
const getMockSubordinates = (role: UserRole, parentId: string): User[] => {
  const count = Math.floor(Math.random() * 3) + 2; // 2-4 items
  let nextRole = UserRole.USER;
  let prefix = "u";

  if (role === UserRole.DEVELOPER) {
    nextRole = UserRole.MASTER;
    prefix = "Mr";
  } else if (role === UserRole.MASTER) {
    nextRole = UserRole.ADMIN;
    prefix = "Adm";
  } else if (role === UserRole.ADMIN) {
    nextRole = UserRole.BRANCH;
    prefix = "Br";
  } else if (role === UserRole.BRANCH) {
    nextRole = UserRole.USER;
    prefix = "Usr";
  } else {
    return [];
  }

  const locationOptions = ["New York", "London", "Tokyo", "Berlin", "Remote"];

  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-${parentId}-${i}`,
    guid: `${prefix}-${parentId}-${i}-guid`,
    name:
      nextRole === UserRole.BRANCH
        ? `Branch ${locationOptions[i % locationOptions.length]}`
        : `${nextRole.charAt(0) + nextRole.slice(1).toLowerCase()} ${i + 1}`,
    phone: `+1 ${Math.floor(Math.random() * 1000) + 100} ${Math.floor(Math.random() * 1000) + 100} ${Math.floor(Math.random() * 1000) + 1000}`,
    status: Math.random() > 0.3 ? UserStatus.ONLINE : UserStatus.OFFLINE,
    role: nextRole,
    lastSeen: "2h ago",
    email: `${prefix}${i}@cortix.ai`,
    location: locationOptions[i % locationOptions.length],
  }));
};

const searchMockHierarchy = (query: string): User[] => {
  const results: User[] = [];
  const lowerQuery = query.toLowerCase();

  // Generating deterministic mock results based on query for demo
  const mockDatabase = [
    { name: "Branch Tokyo", role: UserRole.BRANCH },
    { name: "Branch London", role: UserRole.BRANCH },
    { name: "Branch Berlin", role: UserRole.BRANCH },
    { name: "Admin Sarah", role: UserRole.ADMIN },
    { name: "User John Doe", role: UserRole.USER },
    { name: "User Alice Smith", role: UserRole.USER },
    { name: "User Bob Jones", role: UserRole.USER },
  ];

  mockDatabase.forEach((m, i) => {
    if (m.name.toLowerCase().includes(lowerQuery)) {
      results.push({
        id: `search-${i}`,
        guid: `guid-${i}`,
        name: m.name,
        phone: `+1 ${Math.floor(Math.random() * 1000) + 100} ${Math.floor(Math.random() * 1000) + 100} ${Math.floor(Math.random() * 1000) + 1000}`,
        status: i % 2 === 0 ? UserStatus.ONLINE : UserStatus.OFFLINE,
        role: m.role,
        lastSeen: "Recently",
        email: `${m.name.split(" ")[1] || "user"}@cortix.ai`.toLowerCase(),
        location: "Global",
      });
    }
  });

  return results;
};

const HierarchyNode = ({ user }: { user: User }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<User[]>([]);
  const hasChildren = user.role !== UserRole.USER;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasChildren) return;

    if (!isOpen && children.length === 0) {
      setChildren(getMockSubordinates(user.role, user.id));
    }
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
    }
  };

  return (
    <div className="select-none animate-in fade-in slide-in-from-left-2 duration-300">
      <div
        onClick={handleToggle}
        className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-border hover:bg-surface-hover ${
          isOpen ? "bg-surface-hover" : ""
        }`}
      >
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          {hasChildren ? (
            isOpen ? (
              <ChevronDown size={14} className="text-secondary" />
            ) : (
              <ChevronRight size={14} className="text-secondary" />
            )
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-border" />
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

      {isOpen && (
        <div className="relative ml-4 pl-4 border-l border-border/50 mt-1 space-y-1">
          {children.map((child) => (
            <HierarchyNode key={child.id} user={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export const UserView: React.FC<UserViewProps> = ({
  user,
  onStartChat,
  onUpdate,
  onBack,
}) => { 

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email || "",
    phone: user.phone || "",
    location: user.location || "",
    role: user.role,
  });

  // Initial children for the current viewed admin
  const [rootSubordinates, setRootSubordinates] = useState<User[]>([]);

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

    // Reset hierarchy when admin changes
    if (user.role !== UserRole.USER) {
      setRootSubordinates(getMockSubordinates(user.role, user.id));
    } else {
      setRootSubordinates([]);
    }
  }, [user]);

  // Search Effect
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(searchMockHierarchy(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const copyGuid = () => {
    navigator.clipboard.writeText(user.guid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onUpdate({
      ...user,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      role: formData.role,
    });
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

  const handleDeactivate = () => {
    if (
      window.confirm(
        "Are you sure you want to deactivate this admin account? This will restrict their access.",
      )
    ) {
      onUpdate({
        ...user,
        status: UserStatus.OFFLINE,
        name: user.name.includes("(Deactivated)")
          ? user.name
          : `${user.name} (Deactivated)`,
      });
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
      default:
        return <Users size={14} />;
    }
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
        <span className="font-bold text-text-main ml-2">Team Profile</span>
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
              {isEditing && (
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
                    className={`w-2 h-2 rounded-full ${user.status === "ONLINE" ? "bg-green-500 animate-pulse" : "bg-secondary"}`}
                  ></div>
                  {user.status === "ONLINE"
                    ? "Online Now"
                    : `Last seen ${user.lastSeen}`}
                </span>
              </div>
            </div>

            {/* Main Action */}
            {!isEditing && (
              <button
                onClick={() => onStartChat(user)}
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2"
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
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                      <Briefcase size={16} /> Team Hierarchy
                    </h3>
                    <p className="text-xs font-medium text-secondary mt-1">
                      Master &gt; Admin &gt; Branch &gt; User
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
                      placeholder="Find branch or user..."
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
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover cursor-pointer border border-transparent hover:border-border transition-all"
                            >
                              <Avatar user={result} size="sm" showStatus />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-text-main truncate">
                                    {result.name}
                                  </span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded-full border uppercase font-bold tracking-wider ${
                                      result.role === UserRole.BRANCH
                                        ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                        : result.role === UserRole.ADMIN
                                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                          : "bg-surface text-secondary border-border"
                                    }`}
                                  >
                                    {result.role}
                                  </span>
                                </div>
                                <p className="text-xs text-secondary truncate">
                                  {result.email}
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
                      {user.role === UserRole.USER ? (
                        <div className="flex flex-col items-center justify-center h-full text-secondary py-10 opacity-70">
                          <Users size={32} className="mb-2" />
                          <p className="text-sm">
                            Standard users have no subordinates.
                          </p>
                        </div>
                      ) : (
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
                          {rootSubordinates.map((sub) => (
                            <HierarchyNode key={sub.id} user={sub} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Mail size={16} /> Contact Details
                </h3>
                <div className="space-y-4">
                  <EditableRow
                    icon={Mail}
                    label="Email Address"
                    value={formData.email}
                    isEditing={isEditing}
                    onChange={(v) => setFormData({ ...formData, email: v })}
                  />
                  <EditableRow
                    icon={Phone}
                    label="Phone Number"
                    value={formData.phone}
                    isEditing={isEditing}
                    onChange={(v) => setFormData({ ...formData, phone: v })}
                  />
                  <EditableRow
                    icon={MapPin}
                    label="Location"
                    value={formData.location}
                    isEditing={isEditing}
                    onChange={(v) => setFormData({ ...formData, location: v })}
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
                  label="System Uptime"
                  value="99.9%"
                  color="text-green-500"
                />
                <StatsCard
                  icon={Server}
                  label="Deployments"
                  value="1,240"
                  color="text-blue-500"
                />
                <StatsCard
                  icon={Ticket}
                  label="Avg Response"
                  value="12m"
                  color="text-purple-500"
                />
              </div>

              {/* Deactivate Zone */}
              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">
                  Danger Zone
                </h3>
                <p className="text-xs text-secondary mb-4">
                  Deactivating this account will immediately revoke all system
                  access and API keys.
                </p>
                <button
                  onClick={handleDeactivate}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-surface hover:bg-red-500 hover:text-white border border-border hover:border-red-500 text-red-500 transition-all font-medium text-sm"
                >
                  <Ban size={16} />
                  Deactivate Account
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
}: any) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-hover/30 hover:bg-surface-hover/50 transition-colors border border-transparent hover:border-border">
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
          className="w-full bg-input border border-border rounded px-2 py-1 text-sm text-text-main focus:border-primary focus:outline-none"
        />
      ) : (
        <p className="text-text-main text-sm font-medium truncate">
          {value || "Not set"}
        </p>
      )}
    </div>
  </div>
);
