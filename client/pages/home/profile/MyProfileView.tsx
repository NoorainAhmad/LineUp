import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit2,
  Save,
  X,
  Copy,
  Check,
  LogOut,
  ChevronLeft,
  Fingerprint,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { UserService } from "@/services/user.service"; 

interface MyProfileViewProps {
  onClose: () => void; 
}

export const MyProfileView: React.FC<MyProfileViewProps> = ({
  onClose
}) => {
  const { user: currentUser, logout } = useAuth();

  const [user, setUser] = useState<any>(currentUser!);

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Photo upload states
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // fetch Latest UserData from Server
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await UserService.getUserById(currentUser?.id!);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      setEditedUser({ ...user });
    }
  }, [user]);

  const updateUser = async (updatedUser: any) => {
    try {
      setLoading(true);
      const updatedUserData = await UserService.updateUser(user?.id!, updatedUser);
      if (updatedUserData) {
        localStorage.setItem("auth_user", JSON.stringify(updatedUserData));
        setEditedUser(updatedUserData);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSave = async () => {
    if (!editedUser) return;

    setLoading(true);
    try {
      const updatedUser = await UserService.updateUser(user?.id!, editedUser);
      updateUser(updatedUser);
      setIsEditing(false);
    } catch (error: any) {
      alert(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setPasswordError("");
    
    try {
      const updatedUser = await UserService.changePassword(
        user?.id!, 
        currentPassword, 
        newPassword
      );
      
      updateUser(updatedUser);
      setPasswordSuccess(true);
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordChange(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      setPasswordError(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    logout();
    onClose();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      // Upload to server and get updated user
      const updatedUser = await UserService.updateProfilePhoto(user?.id!, file);
      
      // Update local state
      setEditedUser(updatedUser);
      updateUser(updatedUser);
    } catch (error: any) {
      alert(error.message || "Failed to update profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fields = [
    { label: "Name", value: editedUser?.name || "", icon: User, key: "name", editable: true },
    {
      label: "Email",
      value: editedUser?.email || "",
      icon: Mail,
      key: "email",
      type: "email",
      editable: true,
    },
    {
      label: "Phone",
      value: editedUser?.phone || "Not set",
      icon: Phone,
      key: "phone",
      type: "tel",
      editable: false,
    },
    {
      label: "Location",
      value: editedUser?.location || "Not set",
      icon: MapPin,
      key: "location",
      editable: true,
    },
    {
      label: "User GUID",
      value: editedUser?.guid || "",
      icon: Fingerprint,
      key: "id",
      editable: false,
    },
    {
      label: "Member Since",
      value: formatDate(editedUser?.createdAt || new Date().toISOString()),
      icon: User,
      key: "createdAt",
      editable: false,
    },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-background pb-16 md:pb-0">
      {/* Header */}
      <header className="h-16 px-4 bg-surface flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">My Profile</h1>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Profile Picture */}
        <div className="flex flex-col items-center py-6">
          <div className="relative group">
            <Avatar user={editedUser} size="xl" />
            {isEditing && (
              <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white cursor-pointer shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                {uploadingPhoto ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploadingPhoto}
                />
              </label>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4">
            <h2 className="text-xl font-bold">{editedUser?.name}</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-surface-hover rounded-full transition-colors"
              >
                <Edit2 size={16} className="text-secondary" />
              </button>
            )}
          </div>
          <p className="text-secondary text-sm">{editedUser?.email}</p>
        </div>

        {/* Fields */}
        <div className="space-y-3 mt-4">
          {fields.map((field) => (
            <EditableRow
              key={field.key}
              icon={field.icon}
              label={field.label}
              value={field.value}
              isEditing={isEditing && field.editable}
              onChange={(value: string) =>
                setEditedUser({ ...editedUser, [field.key!]: value })
              }
              disabled={!field.editable}
              onCopy={() => handleCopy(field.value, field.key!)}
              copied={copiedField === field.key}
              type={field.type}
            />
          ))}
        </div>

        {/* Change Password Button - Only shows when editing */}
        {isEditing && !showPasswordChange && (
          <button
            onClick={() => setShowPasswordChange(true)}
            className="w-full mt-4 py-3 bg-surface-hover text-text-main rounded-xl font-medium hover:bg-surface-hover/80 transition-colors flex items-center justify-center gap-2 border border-border"
          >
            <Key size={18} />
            Change Password
          </button>
        )}

        {/* Password Change Form */}
        {isEditing && showPasswordChange && (
          <div className="mt-4 p-4 bg-surface-hover/30 rounded-xl border border-border space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Key size={16} className="text-primary" />
              Change Password
            </h3>
            
            {/* Current Password */}
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 pr-12 text-text-main focus:border-primary focus:outline-none"
              />
              <button
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* New Password */}
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 pr-12 text-text-main focus:border-primary focus:outline-none"
              />
              <button
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 pr-12 text-text-main focus:border-primary focus:outline-none"
              />
              <button
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Error Message */}
            {passwordError && (
              <p className="text-xs text-red-500">{passwordError}</p>
            )}
            
            {/* Success Message */}
            {passwordSuccess && (
              <p className="text-xs text-green-500">Password changed successfully!</p>
            )}
            
            {/* Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handlePasswordChange}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  "Update"
                )}
              </button>
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                }}
                className="px-4 py-2 bg-surface-hover text-text-main rounded-lg font-medium hover:bg-surface-hover/80 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <div className="flex items-center gap-3 pt-6 mt-4 border-t border-border">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Save Changes
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setShowPasswordChange(false);
                setEditedUser(user);
              }}
              className="flex-1 py-3 bg-surface-hover text-text-main rounded-xl font-medium hover:bg-surface-hover/80 transition-colors flex items-center justify-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple EditableRow Component
const EditableRow = ({
  icon: Icon,
  label,
  value,
  isEditing,
  onChange,
  disabled = false,
  onCopy,
  copied,
  type = "text",
}: any) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-hover/30 border border-border">
      <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-secondary shrink-0">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-secondary font-medium mb-1">{label}</p>
        {isEditing && !disabled ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none"
            autoFocus
          />
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-text-main text-sm truncate ${!value ? "opacity-50 italic" : ""}`}
            >
              {value || "Not set"}
            </p>
            {value && !disabled && (
              <button
                onClick={onCopy}
                className="p-1.5 rounded-lg hover:bg-surface text-secondary hover:text-primary transition-colors shrink-0"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};