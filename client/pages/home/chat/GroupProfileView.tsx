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
  Users,
  UserPlus,
  UserMinus,
  Crown,
  LogOut,
  Link2,
  Hash,
  Calendar,
  Settings,
  ChevronRight,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { Chat, User, UserRole, ChatMember } from "../../../types";
import { Avatar } from "../../../components/ui/Avatar";
// import { ChatService } from "@/services/chat.service";
// import { UserService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";

interface GroupProfileViewProps {
  chat: Chat;
  onClose: () => void;
  onUpdate: (updatedChat: Chat) => void;
  onDelete: () => void;
  onLeaveGroup: () => void;
  onAddParticipants: () => void;
}

const CopyIdButton = ({ id }: { id: string }) => {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = () => { 
    navigator.clipboard.writeText(id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  return (
    <span className="flex items-center gap-2">
      <button
        className="text-[10px] text-secondary hover:text-primary"
        onClick={handleCopy}
      >
        <span className="flex items-center gap-1 text-blue-600">
          {isCopied ? "Copied!" : "Copy ID"}
          {isCopied ? <Check size={10} /> : <Copy size={12} />}
        </span>
      </button>
    </span>
  );
};

export const GroupProfileView: React.FC<GroupProfileViewProps> = ({
  chat,
  onClose,
  onUpdate,
  onDelete,
  onLeaveGroup,
  onAddParticipants,
}) => {
  const { user: currentUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [groupChat, setGroupChat] = useState<Chat>(chat);
  const [members, setMembers] = useState<ChatMember[]>(chat.members || []);
  const [showMembers, setShowMembers] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    groupName: chat.groupName || "",
    groupImage: chat.groupImage || "",
  });

  // Check if current user is admin (creator) of the group
  const isGroupAdmin = chat.members?.[0]?.userId === currentUser?.id || false;

  // Get the creator of the group
  const groupCreator = chat.members?.find((m, index) => index === 0)?.user;

  useEffect(() => {
    setGroupChat(chat);
    setMembers(chat.members || []);
    setFormData({
      groupName: chat.groupName || "",
      groupImage: chat.groupImage || "",
    });
  }, [chat]);

  //   const handleSave = async () => {
  //     try {
  //       // Update group info via API
  //       const updatedChat = await ChatService.updateGroup({
  //         chatId: groupChat.id,
  //         groupName: formData.groupName,
  //         groupImage: formData.groupImage,
  //       });

  //       onUpdate(updatedChat);
  //       setIsEditing(false);
  //     } catch (error) {
  //       console.error("Error updating group:", error);
  //       alert("Failed to update group information");
  //     }
  //   };

  const handleCancel = () => {
    setFormData({
      groupName: chat.groupName || "",
      groupImage: chat.groupImage || "",
    });
    setIsEditing(false);
  };

  //   const handleRemoveParticipant = async (memberId: string) => {
  //     if (!window.confirm("Are you sure you want to remove this member?")) {
  //       return;
  //     }

  //     try {
  //       await ChatService.removeParticipant({
  //         chatId: groupChat.id,
  //         memberId,
  //       });

  //       // Update local state
  //       setMembers(members.filter((m) => m.id !== memberId));
  //     } catch (error) {
  //       console.error("Error removing participant:", error);
  //       alert("Failed to remove participant");
  //     }
  //   };

  //   const handleMakeAdmin = async (memberId: string) => {
  //     try {
  //       await ChatService.makeGroupAdmin({
  //         chatId: groupChat.id,
  //         memberId,
  //       });

  //       // You might want to add an admin flag to members
  //       alert("Member promoted to admin");
  //     } catch (error) {
  //       console.error("Error making admin:", error);
  //       alert("Failed to promote member");
  //     }
  //   };

  const handleGroupImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setFormData((prev) => ({ ...prev, groupImage: url }));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getMemberRoleBadge = (member: ChatMember, index: number) => {
    // if (index === 0) {
    //   return {
    //     label: "Creator",
    //     icon: Crown,
    //     color: "text-yellow-500",
    //     bg: "bg-yellow-500/10",
    //   };
    // }
    if (member.userId === currentUser?.id) {
      return {
        label: "You",
        icon: null,
        color: "text-primary",
        bg: "bg-primary/10",
      };
    }
    return null;
  };

  return (
    <div className="w-[320px] bg-surface border-l border-border h-full flex flex-col overflow-y-auto custom-scrollbar shadow-2xl absolute right-0 z-30 md:static animate-in slide-in-from-right duration-200">
      {/* Header */}
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
            {isEditing ? "Edit Group" : "Group Info"}
          </span>
        </div>

        {!isEditing && isGroupAdmin && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-secondary hover:text-primary transition-colors p-2 hover:bg-surface-hover rounded-full"
            title="Edit Group"
            aria-label="Edit group"
          >
            <Pencil size={18} />
          </button>
        )}

        {isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCancel}
              className="text-secondary hover:text-text-main transition-colors p-2 hover:bg-surface-hover rounded-full"
              title="Cancel"
            >
              <X size={18} />
            </button>
            <button
              //   onClick={handleSave}
              onClick={() => {
                alert("Coming soon!");
              }}
              className="text-primary hover:text-primary/80 transition-colors p-2 hover:bg-surface-hover rounded-full"
              title="Save Changes"
              aria-label="Save changes"
            >
              <Save size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Group Avatar & Name */}
      <div className="p-8 flex flex-col items-center border-b border-border bg-linear-to-b from-surface-hover to-surface">
        <div className="mb-4 relative group">
          <div
            className={`transform transition-all duration-300 ${isEditing ? "scale-90 opacity-90" : ""}`}
          >
            <div className="relative">
              {formData.groupImage ? (
                <img
                  src={formData.groupImage}
                  alt={formData.groupName}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-surface shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center border-4 border-surface shadow-xl">
                  <Users size={40} className="text-white" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-surface rounded-full px-2 py-1 text-xs font-bold border border-border shadow-sm">
                {members.length}
              </div>
            </div>
          </div>

          {isEditing && isGroupAdmin && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change group image"
            >
              <Camera className="text-white" size={32} />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleGroupImageChange}
              />
            </div>
          )}
        </div>

        {isEditing ? (
          <input
            type="text"
            value={formData.groupName}
            onChange={(e) =>
              setFormData({ ...formData, groupName: e.target.value })
            }
            className="text-xl font-bold text-text-main text-center bg-input border border-primary/30 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Group Name"
            maxLength={50}
          />
        ) : (
          <>
            <h2 className="text-xl font-bold text-text-main mb-1 text-center">
              {groupChat.groupName || "Unnamed Group"}
            </h2>
            <span className="text-secondary text-sm font-mono mt-1">
              {members.length} members
            </span>
          </>
        )}

        {/* {!isEditing && groupCreator && (
          <div className="mt-4 flex items-center gap-2 text-xs bg-surface-hover px-3 py-1.5 rounded-full border border-border">
            <Crown size={14} className="text-yellow-500" />
            <span className="text-secondary">Created by</span>
            <span className="font-medium text-text-main">
              {groupCreator.name}
            </span>
          </div>
        )} */}
      </div>

      {/* Group Info */}
      <div className="p-4 space-y-4 bg-background h-full">
        <div className="bg-surface rounded-xl p-4 border border-border space-y-4 shadow-sm">
          <InfoItem icon={Hash} label="Group ID" value={groupChat.id} isMono />
          <InfoItem
            icon={Calendar}
            label="Created"
            value={formatDate(groupChat.createdAt)}
          />
          <InfoItem icon={Link2} label="Chat Type" value="Group Chat" />
        </div>

        {/* Members Section */}
        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          <div
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-hover transition-colors"
            onClick={() => setShowMembers(!showMembers)}
          >
            <div className="flex items-center gap-3">
              <Users size={18} className="text-secondary" />
              <span className="font-medium text-text-main">
                Members ({members.length})
              </span>
            </div>
            <ChevronRight
              size={18}
              className={`text-secondary transition-transform duration-200 ${
                showMembers ? "rotate-90" : ""
              }`}
            />
          </div>

          {showMembers && (
            <div className="border-t border-border divide-y divide-border">
              {members.map((member, index) => {
                const roleBadge = getMemberRoleBadge(member, index);
                return (
                  <div
                    key={member.user.id}
                    className="p-3 flex items-center gap-3 hover:bg-surface-hover transition-colors group"
                  >
                    <Avatar user={member.user} size="md" showStatus />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-main truncate">
                          {member.user.name}
                          <br />
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-mono text-text-main text-xs truncate">
                              {member.user.id.slice(0, 20)}
                            </span>
                            <CopyIdButton id={member.user.id} />
                          </div>
                        </span>

                        {roleBadge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full ${roleBadge.bg} ${roleBadge.color} font-bold`}
                          >
                            {roleBadge.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-secondary truncate">
                        {member.user.email || member.user.phone}
                      </p>
                    </div>

                    {isGroupAdmin && member.userId !== currentUser?.id && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          //   onClick={() => handleMakeAdmin(member.id)}
                          onClick={() => {
                            alert("Coming Soon!");
                          }}
                          className="p-1.5 hover:bg-primary/10 rounded-full text-secondary hover:text-primary transition-colors"
                          title="Make Admin"
                        >
                          <Crown size={16} />
                        </button>
                        <button
                          //   onClick={() => handleRemoveParticipant(member.id)}
                          onClick={() => {
                            alert("Coming Soon!");
                          }}
                          className="p-1.5 hover:bg-red-500/10 rounded-full text-secondary hover:text-red-500 transition-colors"
                          title="Remove Member"
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Participants Button */}
              {isGroupAdmin && (
                <div
                  onClick={onAddParticipants}
                  className="p-3 flex items-center gap-3 hover:bg-surface-hover transition-colors cursor-pointer text-primary"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserPlus size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">Add Participants</span>
                    <p className="text-xs text-secondary">
                      Invite more people to this group
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {/* <div className="space-y-1 pt-4">
          <ActionItem icon={BellOff} label="Mute Notifications" />

          <ActionItem icon={Settings} label="Group Settings" />
 
          <button
            onClick={onLeaveGroup}
            className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-surface-hover transition-colors text-left text-orange-400"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Leave Group</span>
          </button>
 
          {isGroupAdmin && (
            <button
              onClick={onDelete}
              className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-surface-hover transition-colors text-left text-red-400"
            >
              <Trash2 size={20} />
              <span className="text-sm font-medium">Delete Group</span>
            </button>
          )} 

          <ActionItem icon={ThumbsDown} label="Report Group" danger />
        </div> */}

        {/* Non-Admin Notice */}
        {/* {!isGroupAdmin && (
          <div className="text-center p-4 text-secondary text-xs border border-border rounded-lg bg-surface-hover mt-4">
            <AlertCircle size={14} className="mx-auto mb-2" />
            Only group admins can edit group information and manage members
          </div>
        )} */}
      </div>
    </div>
  );
};

// Reusable Info Item component
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
        <span className="flex justify-start items-center gap-1">
          {label}
          {label == "Group ID" && <CopyIdButton id={value} />}
        </span>
      </p>
      <p
        className={`text-sm text-text-main break-all truncate ${isMono ? "font-mono" : ""} ${valueClass}`}
      >
        {value || "Not set"}
      </p>
    </div>
  </div>
);

// Reusable Action Item component
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
    className={`w-full flex items-center gap-4 p-3 rounded-lg hover:bg-surface-hover transition-colors text-left ${
      danger ? "text-red-400" : "text-text-main"
    }`}
  >
    <Icon size={20} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default GroupProfileView;
