import React, { useState } from "react";
import {
  Search,
  Shield,
  UserPlus,
  Crown,
  Building,
  Users,
  Code2Icon,
} from "lucide-react";
import { User, UserRole } from "../../../types";
import { Avatar } from "../../../components/ui/Avatar";

interface UserListProps {
  users: User[];
  selectedUserId?: string;
  onSelect: (user: User) => void;
  onCreate: () => void;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  selectedUserId,
  onSelect,
  onCreate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.DEVELOPER:
        return {
          bg: "bg-black/20",
          text: "text-black",
          icon: Code2Icon,
        };
      case UserRole.MASTER:
        return {
          bg: "bg-purple-500/20",
          text: "text-purple-600 dark:text-purple-400",
          icon: Crown,
        };
      case UserRole.ADMIN:
        return {
          bg: "bg-blue-500/20",
          text: "text-blue-600 dark:text-blue-400",
          icon: Shield,
        };
      case UserRole.BRANCH:
        return {
          bg: "bg-orange-500/20",
          text: "text-orange-600 dark:text-orange-400",
          icon: Building,
        };
      case UserRole.USER:
        return {
          bg: "bg-green-500/20",
          text: "text-green-600 dark:text-green-400",
          icon: Users,
        };
      default:
        return {
          bg: "bg-gray-500/20",
          text: "text-gray-600 dark:text-gray-400",
          icon: null,
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border w-full md:w-95 lg:w-105 relative z-20">
      {/* Header */}
      <div className="h-20 px-6 flex items-center justify-between shrink-0 bg-surface border-b border-border/50">
        <h1 className="text-2xl font-black text-text-main tracking-tight">
          Users
        </h1>
        <div className="flex gap-2 text-icon">
          <button
            onClick={onCreate}
            className="p-2 hover:bg-surface-hover rounded-full transition-colors text-primary bg-primary/5"
            title="Add Team Member"
          >
            <UserPlus size={22} />
          </button>
        </div>
      </div> 
      {/* Search */}
      <div className="px-6 py-4 bg-surface">
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search users or members..."
            className="w-full bg-surface-hover text-text-main placeholder-secondary pl-12 pr-10 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          /> 
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface px-3 pb-4 space-y-1">
        {filteredUsers.map((user) => {
          const isSelected = selectedUserId === user.id;
          const badge = getRoleBadge(user.role);
          const BadgeIcon = badge.icon;

          return (
            <div
              key={user.id}
              onClick={() => onSelect(user)}
              className={`group relative p-3 flex items-center gap-4 cursor-pointer transition-colors rounded-xl ${
                isSelected
                  ? "bg-primary/5 dark:bg-primary/10"
                  : "hover:bg-surface-hover"
              }`}
            >
              {isSelected && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-r-full"></div>
              )}

              <Avatar user={user} showStatus size="lg" />

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`font-bold truncate text-sm md:text-base ${isSelected ? "text-primary" : "text-text-main"}`}
                  >
                    {user.name}
                  </span>
                  {BadgeIcon && (
                    <div className={`p-1 rounded-md ${badge.bg} ${badge.text}`}>
                      <BadgeIcon size={12} />
                    </div>
                  )}
                </div>

                <p
                  className={`text-sm truncate ${isSelected ? "text-text-main/80" : "text-secondary"} mb-1`}
                >
                  <span className="capitalize">{user.role.toLowerCase()}</span>{" "}
                  • {user.email || "No email"}
                </p>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 mt-10 text-center text-secondary">
            <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mb-4">
              <Shield size={24} className="opacity-50" />
            </div>
            <p className="font-medium">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};
