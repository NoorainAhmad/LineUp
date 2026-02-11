import React, { useEffect, useState } from "react";
import {
  X,
  Check,
  UserPlus,
  Mail,
  Phone,
  User,
  Shield,
  MapPin,
  Building,
  Briefcase,
  Eye,
  Edit2,
  RefreshCw,
  Trash2,
  Lock,
  Crown,
  ChevronDown,
  Fingerprint,
  Code2Icon,
} from "lucide-react";
import { UserRole, UserPermission, User as UserType } from "../../types";
import { useAuth } from "@/contexts/AuthContext";

interface ContactDetails {
  guid: string;
  name: string;
  phone: string;
  password: string;
  email?: string;
  location?: string;
  role?: UserRole;
  parentId?: string;
  permission: UserPermission[];
}

interface AddUserModalProps {
  onClose: () => void;
  onAdd: (details: ContactDetails) => void;
  showRoleSelection?: boolean;
  masters: UserType[];
  admins: UserType[];
  branches: UserType[];
  users: UserType[];
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  onClose,
  onAdd,
  showRoleSelection = false,
  masters,
  admins,
  branches,
  users,
}) => {
  const { user: CurrentUser } = useAuth();

  // Get allowed roles based on current user's role
  const getAllowedRoles = (): UserRole[] => {
    switch (CurrentUser?.role) {
      case UserRole.DEVELOPER:
        return [UserRole.MASTER, UserRole.ADMIN, UserRole.BRANCH, UserRole.USER];
      case UserRole.MASTER:
        return [UserRole.ADMIN, UserRole.BRANCH, UserRole.USER];
      case UserRole.ADMIN:
        return [UserRole.BRANCH, UserRole.USER];
      case UserRole.BRANCH:
        return [UserRole.USER];
      default:
        return [];
    }
  };

  // Get default role based on current user
  const getDefaultRole = (): UserRole | undefined => {
    if (!showRoleSelection) return UserRole.USER;
    
    const allowedRoles = getAllowedRoles();
    if (allowedRoles.length === 0) return undefined;
    
    // Branch users default to USER role
    if (CurrentUser?.role === UserRole.BRANCH) {
      return UserRole.USER;
    }
    
    // Others default to the lowest allowed role
    return allowedRoles[allowedRoles.length - 1];
  };

  const [formData, setFormData] = useState<ContactDetails>({
    guid: "",
    name: "",
    phone: "",
    password: "",
    email: "",
    location: "",
    role: getDefaultRole(),
    parentId: "",
    permission: [UserPermission.READ],
  });

  // Get available parents based on selected role and current user
  const getAvailableParents = () => {
    if (!formData.role) return [];

    switch (formData.role) {
      case UserRole.MASTER:
        // MASTER reports to DEVELOPER only
        if (CurrentUser?.role === UserRole.DEVELOPER) {
          return [CurrentUser];
        }
        return [];

      case UserRole.ADMIN:
        // ADMIN reports to MASTER
        if (CurrentUser?.role === UserRole.DEVELOPER) {
          return masters; // Developer can assign to any Master
        }
        if (CurrentUser?.role === UserRole.MASTER) {
          return [CurrentUser]; // Master can assign to themselves
        }
        return [];

      case UserRole.BRANCH:
        // BRANCH reports to ADMIN
        if (CurrentUser?.role === UserRole.DEVELOPER) {
          return admins; // Developer can assign to any Admin
        }
        if (CurrentUser?.role === UserRole.MASTER) {
          return admins; // Master can assign to any Admin under them
        }
        if (CurrentUser?.role === UserRole.ADMIN) {
          return [CurrentUser]; // Admin can assign to themselves
        }
        return [];

      case UserRole.USER:
        // USER reports to BRANCH
        if (CurrentUser?.role === UserRole.DEVELOPER) {
          return branches; // Developer can assign to any Branch
        }
        if (CurrentUser?.role === UserRole.MASTER) {
          return branches; // Master can assign to any Branch under them
        }
        if (CurrentUser?.role === UserRole.ADMIN) {
          return branches; // Admin can assign to any Branch under them
        }
        if (CurrentUser?.role === UserRole.BRANCH) {
          return [CurrentUser]; // Branch can assign to themselves
        }
        return [];

      default:
        return [];
    }
  };

  // Get parent selection config
  const getParentSelectionConfig = () => {
    const availableParents = getAvailableParents();
    
    switch (formData.role) {
      case UserRole.MASTER:
        return {
          label: "Reporting Developer",
          placeholder: "Select Developer",
          options: availableParents,
          icon: Code2Icon,
          required: true,
        };
      case UserRole.ADMIN:
        return {
          label: "Reporting Master",
          placeholder: "Select Master Account",
          options: availableParents,
          icon: Crown,
          required: true,
        };
      case UserRole.BRANCH:
        return {
          label: "Reporting Admin",
          placeholder: "Select Regional Admin",
          options: availableParents,
          icon: Shield,
          required: true,
        };
      case UserRole.USER:
        return {
          label: "Assign to Branch",
          placeholder: "Select a Branch",
          options: availableParents,
          icon: Building,
          required: true,
        };
      default:
        return null;
    }
  };

  // Auto-select parent when only one option is available
  useEffect(() => {
    const availableParents = getAvailableParents();
    
    if (availableParents.length === 1) {
      setFormData((prev) => ({ ...prev, parentId: availableParents[0].id }));
    } else if (formData.role === UserRole.USER && CurrentUser?.role === UserRole.BRANCH) {
      // Auto-assign USER to current BRANCH
      setFormData((prev) => ({ ...prev, parentId: CurrentUser.id }));
    } else if (formData.role === UserRole.BRANCH && CurrentUser?.role === UserRole.ADMIN) {
      // Auto-assign BRANCH to current ADMIN
      setFormData((prev) => ({ ...prev, parentId: CurrentUser.id }));
    } else if (formData.role === UserRole.ADMIN && CurrentUser?.role === UserRole.MASTER) {
      // Auto-assign ADMIN to current MASTER
      setFormData((prev) => ({ ...prev, parentId: CurrentUser.id }));
    } else {
      setFormData((prev) => ({ ...prev, parentId: "" }));
    }
  }, [formData.role, CurrentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.guid.trim()) {
      alert("Please enter a unique ID.");
      return;
    }
    if (!formData.name.trim()) {
      alert("Please enter a name.");
      return;
    }
    if (!formData.phone.trim()) {
      alert("Please enter a phone number.");
      return;
    }
    if (!formData.password.trim()) {
      alert("Please enter a password.");
      return;
    }
    if (!formData.permission.length) {
      alert("Please select at least one permission.");
      return;
    }

    const parentConfig = getParentSelectionConfig();
    if (parentConfig?.required && !formData.parentId) {
      alert(`Please select a ${parentConfig.label}.`);
      return;
    }

    onAdd(formData);
  };

  const togglePermission = (permission: UserPermission) => {
    if (formData.permission.includes(permission)) {
      setFormData((prev) => ({
        ...prev,
        permission: prev.permission.filter((p) => p !== permission),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permission: [...prev.permission, permission],
      }));
    }
  };

  const getRoleIcon = () => {
    switch (formData.role) {
      case UserRole.DEVELOPER:
        return <Code2Icon size={28} className="text-black dark:text-white" />;
      case UserRole.MASTER:
        return <Crown size={28} className="text-purple-500" />;
      case UserRole.ADMIN:
        return <Shield size={28} className="text-blue-500" />;
      case UserRole.BRANCH:
        return <Building size={28} className="text-orange-500" />;
      default:
        return <UserPlus size={28} className="text-green-500" />;
    }
  };

  const allowedRoles = getAllowedRoles();
  const parentConfig = getParentSelectionConfig();
  const availableParents = getAvailableParents();

  // Don't render if no roles available
  if (showRoleSelection && allowedRoles.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border max-h-[90vh]">
        <div className="h-16 px-6 bg-surface border-b border-border flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-text-main">
            {showRoleSelection ? "Add Team Member" : "New Contact"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-secondary hover:text-text-main rounded-full hover:bg-surface-hover"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1">
          <form
            onSubmit={handleSubmit}
            className="p-6 flex flex-col items-center gap-6 bg-background/50"
          >
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center border-2 border-dashed border-border shadow-sm group transition-all duration-300">
              {getRoleIcon()}
            </div>

            <div className="w-full space-y-3">
              <div className="relative group">
                <Fingerprint
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  required
                  type="text"
                  placeholder="GUID (Unique ID)"
                  autoFocus
                  className="w-full bg-input text-text-main pl-10 pr-4 py-3 rounded-xl border border-transparent focus:border-primary/50 focus:bg-surface focus:outline-none transition-all placeholder-secondary"
                  value={formData.guid}
                  onChange={(e) =>
                    setFormData({ ...formData, guid: e.target.value })
                  }
                />
              </div>
              
              <div className="relative group">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  required
                  type="text"
                  placeholder="Full Name (Required)"
                  className="w-full bg-input text-text-main pl-10 pr-4 py-3 rounded-xl border border-transparent focus:border-primary/50 focus:bg-surface focus:outline-none transition-all placeholder-secondary"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="relative group">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  required
                  type="tel"
                  placeholder="Phone (Required)"
                  className="w-full bg-input text-text-main pl-10 pr-4 py-3 rounded-xl border border-transparent focus:border-primary/50 focus:bg-surface focus:outline-none transition-all placeholder-secondary"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div className="relative group">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  required
                  type="password"
                  placeholder="Password (Required)"
                  className="w-full bg-input text-text-main pl-10 pr-4 py-3 rounded-xl border border-transparent focus:border-primary/50 focus:bg-surface focus:outline-none transition-all placeholder-secondary"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <div className="relative group">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="Email (Optional)"
                  className="w-full bg-input text-text-main pl-10 pr-4 py-3 rounded-xl border border-transparent focus:border-primary/50 focus:bg-surface focus:outline-none transition-all placeholder-secondary"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="relative group">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Location (Optional)"
                  className="w-full bg-input text-text-main pl-10 pr-4 py-3 rounded-xl border border-transparent focus:border-primary/50 focus:bg-surface focus:outline-none transition-all placeholder-secondary"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>

              {showRoleSelection && allowedRoles.length > 0 && (
                <div className="relative group">
                  <Briefcase
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
                    size={18}
                  />
                  <select
                    value={formData.role || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="w-full bg-input text-text-main pl-10 pr-4 py-3 rounded-xl border border-transparent focus:border-primary/50 focus:bg-surface focus:outline-none transition-all appearance-none cursor-pointer placeholder-secondary"
                  >
                    {allowedRoles.includes(UserRole.MASTER) && (
                      <option value={UserRole.MASTER}>Master (Root)</option>
                    )}
                    {allowedRoles.includes(UserRole.ADMIN) && (
                      <option value={UserRole.ADMIN}>Admin (Regional Manager)</option>
                    )}
                    {allowedRoles.includes(UserRole.BRANCH) && (
                      <option value={UserRole.BRANCH}>Branch (Location Manager)</option>
                    )}
                    {allowedRoles.includes(UserRole.USER) && (
                      <option value={UserRole.USER}>User (Client)</option>
                    )}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                    <ChevronDown size={16} />
                  </div>
                </div>
              )}

              {/* Dynamic Parent Selection */}
              {parentConfig && availableParents.length > 0 && (
                <div className="relative group animate-in fade-in slide-in-from-top-1 duration-200">
                  <parentConfig.icon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
                    size={18}
                  />
                  <select
                    value={formData.parentId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, parentId: e.target.value })
                    }
                    className="w-full bg-input text-text-main pl-10 pr-4 py-3 rounded-xl border border-transparent focus:border-primary/50 focus:bg-surface focus:outline-none transition-all appearance-none cursor-pointer placeholder-secondary"
                    required={parentConfig.required}
                  >
                    <option value="">{parentConfig.placeholder}</option>
                    {availableParents.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name} ({opt.role}) {opt.location ? `• ${opt.location}` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                    <ChevronDown size={16} />
                  </div>
                  <label className="absolute -top-2 left-3 bg-surface px-1 text-[10px] font-bold text-primary uppercase tracking-wider pointer-events-none">
                    {parentConfig.label} {parentConfig.required && '*'}
                  </label>
                </div>
              )}
            </div>

            {/* Permissions Section */}
            <div className="w-full pt-2">
              <div className="flex items-center gap-2 mb-3">
                <Lock size={16} className="text-secondary" />
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                  Access Permissions
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <PermissionToggle
                  label="Read Records"
                  icon={Eye}
                  checked={formData.permission.includes(UserPermission.READ)}
                  onChange={() => togglePermission(UserPermission.READ)}
                  color="text-blue-500"
                  bgColor="bg-blue-500/10"
                  borderColor="border-blue-500/20"
                />
                <PermissionToggle
                  label="Create Records"
                  icon={Edit2}
                  checked={formData.permission.includes(UserPermission.CREATE)}
                  onChange={() => togglePermission(UserPermission.CREATE)}
                  color="text-green-500"
                  bgColor="bg-green-500/10"
                  borderColor="border-green-500/20"
                />
                <PermissionToggle
                  label="Update Records"
                  icon={RefreshCw}
                  checked={formData.permission.includes(UserPermission.UPDATE)}
                  onChange={() => togglePermission(UserPermission.UPDATE)}
                  color="text-orange-500"
                  bgColor="bg-orange-500/10"
                  borderColor="border-orange-500/20"
                />
                <PermissionToggle
                  label="Delete Records"
                  icon={Trash2}
                  checked={formData.permission.includes(UserPermission.DELETE)}
                  onChange={() => togglePermission(UserPermission.DELETE)}
                  color="text-red-500"
                  bgColor="bg-red-500/10"
                  borderColor="border-red-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={
                !formData.guid.trim() ||
                !formData.name.trim() ||
                !formData.phone.trim() ||
                !formData.password.trim() ||
                !formData.permission.length ||
                (parentConfig?.required && !formData.parentId)
              }
              className="w-full mt-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Check size={18} />
              {showRoleSelection ? "Create Member" : "Save Contact"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const PermissionToggle = ({
  label,
  icon: Icon,
  checked,
  onChange,
  color,
  bgColor,
  borderColor,
}: any) => (
  <div
    onClick={onChange}
    className={`
      flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200 select-none
      ${
        checked
          ? `${bgColor} ${borderColor}`
          : "bg-surface border-border hover:bg-surface-hover"
      }
    `}
  >
    <div
      className={`
      w-5 h-5 rounded flex items-center justify-center border transition-colors
      ${checked ? "bg-surface border-transparent" : "border-secondary/50"}
    `}
    >
      {checked && <Check size={12} className={color} strokeWidth={3} />}
    </div>
    <div className="flex items-center gap-2 min-w-0">
      <Icon size={16} className={checked ? color : "text-secondary"} />
      <span
        className={`text-xs font-bold truncate ${checked ? "text-text-main" : "text-secondary"}`}
      >
        {label}
      </span>
    </div>
  </div>
);