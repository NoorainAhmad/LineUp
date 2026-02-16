import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Shield,
  Clock,
  Mail,
  MapPin,
  Fingerprint,
  Lock,
  BellOff,
  ThumbsDown,
  Trash2,
  Pencil,
  Save,
  Camera,
  Phone,
  Video,
} from "lucide-react";
import { User, UserRole, UserStatus } from "../../../types";
import { Avatar } from "../../../components/ui/Avatar";
import { UserService } from "@/services/user.service";

interface ProfileViewProps {
  userId: string;
  onClose: () => void;
  onUpdate: (user: Partial<User>) => void;
  onDelete: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userId,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    location: user?.location || "",
    avatarUrl: user?.avatarUrl || "",
  }); 

  const fetchUser = async () => {
    try {
      const user = await UserService.getUserById(userId); 
      setUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  // Reset form data when user prop changes
  useEffect(() => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
      location: user?.location || "",
      avatarUrl: user?.avatarUrl || "",
    });
    setIsEditing(false);
  }, [user]);

  const handleSave = () => {
    const updatedUser = {
      ...user,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      location: formData.location || undefined,
      avatarUrl: formData.avatarUrl || undefined,
    };
    onUpdate(updatedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
      location: user?.location || "",
      avatarUrl: user?.avatarUrl || "",
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the contact ${user?.name}? This will also delete the chat history.`,
      )
    ) {
      onDelete();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setFormData((prev) => ({ ...prev, avatarUrl: url }));
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    if (!lastSeen || lastSeen === "Unknown") return "Unknown";

    try {
      const lastSeenDate = new Date(lastSeen);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - lastSeenDate.getTime()) / (1000 * 60),
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch {
      return lastSeen;
    }
  };

  const canEdit =
    user?.role !== UserRole.MASTER && user?.role !== UserRole.DEVELOPER;

  return (
    <div className="w-[320px] bg-surface border-l border-border h-full flex flex-col overflow-y-auto custom-scrollbar shadow-2xl absolute right-0 z-30 md:static animate-in slide-in-from-right duration-200">
      <div className="h-18 px-6 flex items-center justify-between border-b border-border bg-surface shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="text-secondary hover:text-text-main p-2 -ml-2 hover:bg-surface-hover rounded-full transition-colors"
            aria-label="Close profile"
          >
            <X size={20} />
          </button>
          <span className="font-semibold text-text-main">
            {isEditing ? "Edit Profile" : "Contact Info"}
          </span>
        </div>

        {/* {!isEditing && canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-secondary hover:text-primary transition-colors p-2 hover:bg-surface-hover rounded-full"
            title="Edit Profile"
            aria-label="Edit profile"
          >
            <Pencil size={18} />
          </button>
        )} */}

        {isEditing && (
          <button
            onClick={handleSave}
            className="text-primary hover:text-primary/80 transition-colors p-2 hover:bg-surface-hover rounded-full"
            title="Save Changes"
            aria-label="Save changes"
          >
            <Save size={20} />
          </button>
        )}
      </div>

      <div className="p-8 flex flex-col items-center border-b border-border bg-linear-to-b from-surface-hover to-surface">
        <div className="mb-4 relative group">
          <div
            className={`transform transition-all duration-300 ${isEditing ? "scale-90 opacity-90" : ""}`}
          >
            <Avatar
              user={{
                ...user,
                avatarUrl: formData.avatarUrl,
                name: formData.name,
                status: isEditing ? UserStatus.OFFLINE : user?.status as UserStatus,
              }}
              size="2xl"
              showStatus={!isEditing}
            />
          </div>

          {isEditing && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change avatar"
            >
              <Camera className="text-white" size={32} />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
          )}
        </div>

        {isEditing ? (
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="text-xl font-bold text-text-main text-center bg-input border border-primary/30 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Name"
            maxLength={50}
          />
        ) : (
          <h2 className="text-xl font-bold text-text-main mb-1 text-center">
            {user?.name}
            {user?.status === UserStatus.ONLINE && (
              <span className="ml-2 text-xs font-normal text-green-500">
                ● Online
              </span>
            )}
          </h2>
        )}

        {isEditing ? (
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="text-secondary text-sm font-mono text-center bg-input border border-border rounded-lg px-2 py-1 w-3/4 mt-2 focus:outline-none focus:border-primary"
            placeholder="Phone Number"
          />
        ) : (
          <span className="text-secondary text-sm font-mono mt-1">
            {user?.phone || "No phone number"}
          </span>
        )}

        {/* {!isEditing && (
          <div className="mt-6 flex gap-4 w-full justify-center">
            <div className="flex flex-col items-center gap-1 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors">
                <Phone size={18} className="text-primary" />
              </div>
              <span className="text-xs text-secondary group-hover:text-primary">
                Audio
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors">
                <Video size={18} className="text-primary" />
              </div>
              <span className="text-xs text-secondary group-hover:text-primary">
                Video
              </span>
            </div>
          </div>
        )} */}
      </div>

      <div className="p-4 space-y-4 bg-background h-full">
        {isEditing && (
          <div className="flex justify-between px-2">
            <button
              onClick={handleCancel}
              className="text-red-400 text-sm font-medium hover:underline"
            >
              Cancel
            </button>
            <span className="text-xs text-secondary">
              {formData.name.length}/50
            </span>
          </div>
        )}

        <div className="bg-surface rounded-xl p-4 border border-border space-y-4 shadow-sm">
          <InfoItem
            icon={Shield}
            label="Role"
            value={user?.role || ""}
            valueClass={user?.role === UserRole.MASTER ? "text-primary" : ""}
          />
          <InfoItem icon={Fingerprint} label="GUID" value={user?.guid || ""} isMono />
          <InfoItem
            icon={Clock}
            label="Last Seen"
            value={formatLastSeen(user?.lastSeen as string)}
          />
          <InfoItem
            icon={Lock}
            label="Status"
            value={user?.isActive ? "Active" : "Inactive"}
            valueClass={user?.isActive ? "text-green-500" : "text-red-500"}
          />
        </div>

        <div className="bg-surface rounded-xl p-4 border border-border space-y-4 shadow-sm">
          <EditableInfoItem
            icon={Mail}
            label="Email"
            value={formData.email}
            isEditing={isEditing}
            onChange={(val: string) => setFormData({ ...formData, email: val })}
            disabled={!canEdit}
          />
          <EditableInfoItem
            icon={MapPin}
            label="Location"
            value={formData.location}
            isEditing={isEditing}
            onChange={(val: string) =>
              setFormData({ ...formData, location: val })
            }
            disabled={!canEdit}
          />
        </div>

        {/* <div className="space-y-1 pt-4">
          {canEdit && (
            <>
              <ActionItem icon={BellOff} label="Mute Notifications" />
              <ActionItem icon={ThumbsDown} label="Report Contact" danger />
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-surface-hover transition-colors text-left text-red-400"
                aria-label="Delete contact"
              >
                <Trash2 size={20} />
                <span className="text-sm font-medium">Delete Contact</span>
              </button>
            </>
          )}

          {!canEdit && (
            <div className="text-center p-4 text-secondary text-sm border border-border rounded-lg bg-surface-hover">
              <Shield size={16} className="mx-auto mb-2" />
              This is a system account and cannot be modified
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};

const InfoItem = ({
  icon: Icon,
  label,
  value,
  isMono,
  valueClass = "",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  isMono?: boolean;
  valueClass?: string;
}) => (
  <div className="flex items-start gap-3">
    <Icon size={18} className="text-secondary mt-0.5 shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-xs text-secondary uppercase tracking-wider font-medium mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm text-text-main break-all ${isMono ? "font-mono" : ""} ${valueClass}`}
      >
        {value || "Not set"}
      </p>
    </div>
  </div>
);

const EditableInfoItem = ({
  icon: Icon,
  label,
  value,
  isEditing,
  onChange,
  disabled = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-start gap-3">
    <Icon size={18} className="text-secondary mt-0.5 shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-xs text-secondary uppercase tracking-wider font-medium mb-0.5">
        {label}
      </p>
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-input text-text-main text-sm px-2 py-1 rounded border border-border focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={`Enter ${label.toLowerCase()}`}
          disabled={disabled}
        />
      ) : (
        <p className="text-sm text-text-main break-all">{value || "Not set"}</p>
      )}
    </div>
  </div>
);

const ActionItem = ({
  icon: Icon,
  label,
  danger = false,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-3 rounded-lg hover:bg-surface-hover transition-colors text-left ${danger ? "text-red-400" : "text-text-main"}`}
  >
    <Icon size={20} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);
