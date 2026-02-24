import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "./Navigation";
import { CreateGroupModal } from "../../components/modals/CreateGroupModal";
import { AddUserModal } from "../../components/modals/AddUserModal";
import { LogoutModal } from "../../components/modals/LogoutModal";
import { Dashboard } from "./dashboard/Dashboard";
import { ChatList } from "./chat/ChatList";
import { ChatView } from "./chat/ChatView";
import { ProfileView } from "./chat/ProfileView";
import { StatusList } from "./status/StatusList";
import { StatusView } from "./status/StatusView";
import { StatusCreator } from "./status/StatusCreator";
import { UserList } from "./user/UserList";
import { UserView } from "./user/UserView";
import { CannedResponseList } from "./canned/CannedResponseList";
import { CannedResponseView } from "./canned/CannedResponseView";
import { SettingsList } from "./setting/SettingsList";
import { SettingsView } from "./setting/SettingsView";
import {
  Chat,
  Status,
  User,
  UserRole,
  UserStatus,
  CannedResponse,
  UserPermission,
  MessageType,
} from "../../types";
import { ImageIcon, LucideMessageCircleWarning, PlusIcon, Users2, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

import { UserService } from "@/services/user.service";
import { CannedResponseService } from "@/services/canned.service";
import { StatusService } from "@/services/status.service";
import { ChatService } from "@/services/chat.service";
import GroupProfileView from "./chat/GroupProfileView";
import { MyProfileView } from "./profile/MyProfileView";
import { z } from "zod";
import api from "@/api/axios";

//State to handle create User error
//const [error, setError] = useState<string | null>(null);
// Helper function to normalize API response
const normalizeChatData = (apiChat: any): Chat => {
  return {
    id: apiChat.id,
    isGroup: apiChat.isGroup || false,
    groupName: apiChat.groupName,
    groupImage: apiChat.groupImage,
    members: apiChat.members || [],
    messages: apiChat.messages || [],
    lastMessageId: apiChat.lastMessageId,
    lastMessage: apiChat.lastMessage,
    createdAt: apiChat.createdAt,
    updatedAt: apiChat.updatedAt,
  };
};

const normalizeStatusData = (apiStatus: any): Status => {
  return {
    id: apiStatus.id,
    type: apiStatus.type,
    content: apiStatus.content,
    color: apiStatus.color,
    mediaId: apiStatus.mediaId,
    media: apiStatus.media,
    userId: apiStatus.userId,
    user: apiStatus.user,
    viewers: apiStatus.viewers || [],
    expiresAt: apiStatus.expiresAt,
    createdAt: apiStatus.createdAt,
  };
};

const normalizeUserData = (apiUser: any): User => {
  return {
    id: apiUser.id,
    guid: apiUser.guid,
    name: apiUser.name,
    phone: apiUser.phone,
    email: apiUser.email,
    location: apiUser.location,
    avatarUrl: apiUser.avatarUrl,
    status: apiUser.status || UserStatus.OFFLINE,
    lastSeen: apiUser.lastSeen || "Unknown",
    ipAddress: apiUser.ipAddress || "0.0.0.0",
    isActive: apiUser.isActive !== false,
    role: apiUser.role || UserRole.USER,
    permission: apiUser.permission || [UserPermission.READ],
    parentId: apiUser.parentId,
    parent: apiUser.parent,
    children: apiUser.children || [],
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
  };
};

const normalizeCannedResponseData = (apiResponse: any): CannedResponse => {
  return {
    id: apiResponse.id,
    command: apiResponse.command,
    text: apiResponse.text,
    description: apiResponse.description,
    userId: apiResponse.userId,
    user: apiResponse.user,
    createdAt: apiResponse.createdAt,
    updatedAt: apiResponse.updatedAt,
  };
};

export const Home: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user: currentUser, logout } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState(
    currentUser?.role === UserRole.USER ? "chat" : "dashboard",
  );
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(
    null,
  );
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCreatingStatus, setIsCreatingStatus] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingResponse, setIsCreatingResponse] = useState(false);
  const [selectedSettingCategory, setSelectedSettingCategory] =
    useState("system-dashboard");
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
 
  const {
    data: chatsData = [],
    isLoading: isLoadingChats,
    error: chatsError,
  } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const response = await ChatService.getInbox();
      return (response.data || response).map(normalizeChatData);
    },
    enabled: activeTab === "chat" || activeTab === "dashboard",
    refetchInterval: activeTab === "chat" ? 1000 : 10000,
  });

  const {
    data: statusesData = [],
    isLoading: isLoadingStatuses,
    error: statusesError,
  } = useQuery({
    queryKey: ["statuses"],
    queryFn: async () => {
      const response = await StatusService.getAllStatuses();
      return (response.data || response).map(normalizeStatusData);
    },
    enabled: activeTab === "status" || activeTab === "dashboard",
    refetchInterval: activeTab === "status" ? 2000 : 20000,
  });

  const {
    data: usersData = [],
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response =
        currentUser?.role == UserRole.USER
          ? []
          : currentUser?.role == UserRole.DEVELOPER ? await UserService.getAllUsers() : await UserService.teamMembers();
      return (response.data || response).map(normalizeUserData);
    },
    enabled: activeTab === "user" || activeTab === "dashboard",
    refetchInterval: activeTab === "user" ? 3000 : 30000,
  });

  const {
    data: responsesData = [],
    isLoading: isLoadingResponses,
    error: responsesError,
  } = useQuery({
    queryKey: ["canned-responses"],
    queryFn: async () => {
      const response =
        currentUser?.role == UserRole.USER
          ? []
          : await CannedResponseService.getAllCannedResponses();
      return (response.data || response).map(normalizeCannedResponseData);
    },
    enabled: activeTab === "response" || activeTab === "dashboard",
    refetchInterval: activeTab === "response" ? 4000 : 40000,
  });

  // Derived data
  const masters = useMemo(
    () => usersData.filter((u: any) => u.role === UserRole.MASTER),
    [usersData],
  );

  const adminUsers = useMemo(
    () => usersData.filter((u: any) => u.role === UserRole.ADMIN),
    [usersData],
  );

  const branches = useMemo(
    () => usersData.filter((u: any) => u.role === UserRole.BRANCH),
    [usersData],
  );

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (details: {
      guid: string;
      name: string;
      phone: string;
      password: string;
      email?: string;
      location?: string;
      role?: UserRole;
      parentId?: string;
      permission: UserPermission[];
    }) => UserService.createUser(details),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedUser(normalizeUserData(newUser));
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (details: {
      id: string;
      name?: string;
      phone?: string;
      password?: string;
      email?: string;
      location?: string;
    }) => UserService.updateUser(details.id, details),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedUser(normalizeUserData(updatedUser));
    },
  });

  const createCannedResponseMutation = useMutation({
    mutationFn: (details: {
      command: string;
      description: string;
      text: string;
      userId: string;
    }) => CannedResponseService.createCannedResponse(details),
    onSuccess: (newResponse) => {
      queryClient.invalidateQueries({ queryKey: ["canned-responses"] });
      setSelectedResponseId(newResponse.id);
    },
  });

  const updateCannedResponseMutation = useMutation({
    mutationFn: ({
      id,
      details,
    }: {
      id: string;
      details: { command: string; description: string; text: string };
    }) => CannedResponseService.updateCannedResponse(id, details),
    onSuccess: (updatedResponse) => {
      queryClient.invalidateQueries({ queryKey: ["canned-responses"] });
      setSelectedResponseId(updatedResponse.id);
    },
  });

  const deleteCannedResponseMutation = useMutation({
    mutationFn: (id: string) => CannedResponseService.deleteCannedResponse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canned-responses"] });
      setSelectedResponseId(null);
    },
  });

  // Event handlers
  const closeModals = useCallback(() => {
    setIsCreatingGroup(false);
    setIsAddingUser(false);
    setIsCreatingStatus(false);
    setIsCreatingUser(false);
    setIsCreatingResponse(false);
  }, []);

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      setSelectedChat(null);
      setSelectedStatusId(null);
      setSelectedUser(null);
      setSelectedResponseId(null);
      setIsCreatingResponse(false);
      setMobileSettingsOpen(false);
      closeModals();
    },
    [closeModals],
  );

  const handleLogoutDevice = useCallback(async () => {
    if (isLoggingOut) return; // prevent double clicks
    try {
      setIsLoggingOut(true);  
      await logout();
    } catch (error) {
      console.error("Logout device error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, isLoggingOut]);

  const handleChatSelect = useCallback((chat: Chat) => {
    setSelectedChat(chat);
  }, []);

  const handleStatusSelect = (statusId: string) => {
    setSelectedStatusId(statusId);
  };

  const handleBackToMenu = useCallback(() => {
    setSelectedChat(null);
    setSelectedStatusId(null);
    setSelectedUser(null);
    setSelectedResponseId(null);
    setIsCreatingResponse(false);
  }, []);

  const toggleProfile = useCallback(() => {
    setShowProfile(!showProfile);
  }, [showProfile]);

  const handleAddContact = useCallback(
    async (details: {
      guid: string;
      name: string;
      phone: string;
      password: string;
      email?: string;
      location?: string;
      role?: UserRole;
      parentId?: string;
      permission: UserPermission[];
    }) => {
      try {
        const newUser = await createUserMutation.mutateAsync(details);

        // Create a chat with the new user
        const newChat: Chat = {
          id: `temp-${Date.now()}`,
          isGroup: false,
          members: [
            {
              id: `temp-member-${Date.now()}`,
              userId: currentUser!.id,
              user: currentUser as User,
              chatId: `temp-${Date.now()}`,
              chat: {} as Chat,
              unreadCount: 0,
              isPinned: false,
              isMuted: false,
              isArchived: false,
              joinedAt: new Date().toISOString(),
            },
            {
              id: `temp-member-${Date.now()}-2`,
              userId: newUser.id,
              user: normalizeUserData(newUser),
              chatId: `temp-${Date.now()}`,
              chat: {} as Chat,
              unreadCount: 0,
              isPinned: false,
              isMuted: false,
              isArchived: false,
              joinedAt: new Date().toISOString(),
            },
          ],
          messages: [],
          lastMessage: {
            id: `m-init-${Date.now()}`,
            senderId: "system",
            content: "Contact created",
            type: MessageType.TEXT,
            sender: {
              id: "system",
              guid: "system",
              name: "System",
              phone: "",
              status: UserStatus.OFFLINE,
              lastSeen: "Just now",
              ipAddress: "0.0.0.0",
              isActive: true,
              role: UserRole.DEVELOPER,
              permission: [],
              children: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            chatId: `temp-${Date.now()}`,
            chat: {} as Chat,
            isEdited: false,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Invalidate chats query to fetch updated list
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        setSelectedChat(newChat);
        setIsAddingUser(false);
      } catch (err: any) {
        console.error("Error adding contact:", err);

        const backendMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to add contact.";

        setError(backendMessage);
      }
    },
    [createUserMutation, currentUser, queryClient],
  );

  const handleCreateUser = useCallback(
    async (details: {
      guid: string;
      name: string;
      phone: string;
      password: string;
      email?: string;
      location?: string;
      role?: UserRole;
      parentId?: string;
      permission: UserPermission[];
    }) => {
      try {
        const newUser = await createUserMutation.mutateAsync(details);
        setSelectedUser(normalizeUserData(newUser));
        setIsCreatingUser(false);
      } catch (err: any) {
        console.error("Error creating user:", err);

        let readableMessage = "User creation failed. Please try again.";

        if (err instanceof z.ZodError) {
          // ── Most common approach: field → first error message ────────
          const fieldErrors: Record<string, string> = {};

          err.issues.forEach((issue) => {
            const field = issue.path.join("."); // "guid", "phone", "password"

            // Use the custom message if it exists, otherwise fallback
            let msg = issue.message;

            // Optional: make messages nicer / more user-friendly
            if (issue.code === "too_small") {
              const fieldName =
                issue.path[0] === "guid"
                  ? "GUID"
                  : issue.path[0] === "phone"
                    ? "Phone number"
                    : issue.path[0] === "password"
                      ? "Password"
                      : issue.path.join(".");

              fieldErrors[issue.path.join(".")] =
                ` ${fieldName} must be at least ${issue.minimum} characters`;
            }

            // You can also do: take the first error per field only
            if (!fieldErrors[field]) {
              fieldErrors[field] = msg;
            }
          });

          // Decide how to show it
          if (Object.keys(fieldErrors).length > 0) {
            // Option A: set one main message (simplest for now)
            readableMessage = Object.values(fieldErrors).join(" \n ");

            // Option B: store field-level errors (best if you have inputs)
            // setFieldErrors(fieldErrors);   ← add this state if you want per-field red text
          }
        }
        // Handle other backend errors (Prisma duplicate, etc.)
        else if (err?.response?.data?.error) {
          readableMessage = err.response.data.error;
        } else if (err?.response?.data?.message) {
          readableMessage = err.response.data.message;
        } else if (err?.message) {
          readableMessage = err.message;
        }

        setError(readableMessage);
      }
    },
    [createUserMutation],
  );

  const handleUpdateUser = useCallback(
    async (updatedUser: any) => {
      try {
        // Delete all undefined or null fields from the updated user object
        Object.keys(updatedUser).forEach(
          (key) =>
            updatedUser[key] === undefined ||
            updatedUser[key] === null ||
            (updatedUser[key] === "" && delete updatedUser[key]),
        );
        // Update users cache
        const updatedUserData: any =
          await updateUserMutation.mutateAsync(updatedUser);
        queryClient.setQueryData(["users"], (old: User[] = []) =>
          old.map((user) =>
            user.id === updatedUser.id ? updatedUserData : user,
          ),
        );
        // Update selected user if needed
        if (selectedUser) {
          setSelectedUser(updatedUserData);
        }
      } catch (error) {
        console.error("Error updating user:", error);
      }
    },
    [selectedUser, queryClient],
  );

  const handleDeleteContact = useCallback(() => {
    if (!selectedChat) return;
    // Note: In a real app, you would call an API to delete the chat
    // For now, we'll just remove it from local state
    queryClient.invalidateQueries({ queryKey: ["chats"] });
    setSelectedChat(null);
    setShowProfile(false);
  }, [selectedChat, queryClient]);

  const handleUpdateUserProfile = useCallback(
    (updatedUser: User) => {
      // Update users cache
      queryClient.setQueryData(["users"], (old: User[] = []) =>
        old.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
      );

      // Update chats cache if needed
      queryClient.setQueryData(["chats"], (old: Chat[] = []) =>
        old.map((chat) => {
          // Update chat members
          const updatedMembers = chat.members.map((member) =>
            member.user.id === updatedUser.id
              ? { ...member, user: updatedUser }
              : member,
          );
          return { ...chat, members: updatedMembers };
        }),
      );

      // Update selected chat if needed
      if (selectedChat) {
        const updatedMembers = selectedChat.members.map((member) =>
          member.user.id === updatedUser.id
            ? { ...member, user: updatedUser }
            : member,
        );
        setSelectedChat({ ...selectedChat, members: updatedMembers });
      }
    },
    [selectedChat, queryClient],
  );

  const handleTogglePin = useCallback(
    async (chatId: string) => {
      try {
        // UI update
        queryClient.setQueryData(["chats"], (old: Chat[] = []) =>
          old.map((chat) => {
            if (chat.id === chatId) {
              const updatedMembers = chat.members.map((member) =>
                member.userId === currentUser!.id
                  ? { ...member, isPinned: !member.isPinned }
                  : member,
              );
              return { ...chat, members: updatedMembers };
            }
            return chat;
          }),
        );
        // Backend API call
        await ChatService.pinChatMember(chatId);

        // Sync with server
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      } catch (error) {
        console.error("Error toggling pin:", error);

        // Rollback if API fails
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      }
    },
    [currentUser?.id, queryClient],
  );

  const handleArchiveChat = useCallback(
    async (chatId: string) => {
      // Optimistically update local state
      queryClient.setQueryData(["chats"], (old: Chat[] = []) =>
        old.map((chat) => {
          if (chat.id === chatId) {
            const updatedMembers = chat.members.map((member) =>
              member.userId === currentUser!.id
                ? { ...member, isArchived: !member.isArchived }
                : member,
            );
            return { ...chat, members: updatedMembers };
          }
          return chat;
        }),
      );

      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
      }

      try {
        await ChatService.toggleArchive(chatId);
        // Refetch to sync with server
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      } catch (error) {
        console.error("Error toggling archive:", error);
        // Revert optimistic update on failure
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      }
    },
    [selectedChat, currentUser!.id, queryClient],
  );

  const handleCreateResponse = useCallback(
    async (details: {
      command: string;
      description: string;
      text: string;
      userId: string;
    }) => {
      try {
        await createCannedResponseMutation.mutateAsync(details);
        setIsCreatingResponse(false);
      } catch (error) {
        console.error("Error creating response:", error);
      }
    },
    [createCannedResponseMutation],
  );

  const handleUpdateResponse = useCallback(
    async (details: { command: string; description: string; text: string }) => {
      if (!selectedResponseId) return;

      try {
        await updateCannedResponseMutation.mutateAsync({
          id: selectedResponseId,
          details,
        });
      } catch (error) {
        console.error("Error updating response:", error);
      }
    },
    [selectedResponseId, updateCannedResponseMutation],
  );

  const handleDeleteResponse = useCallback(
    async (id: string) => {
      try {
        await deleteCannedResponseMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting response:", error);
      }
    },
    [deleteCannedResponseMutation],
  );

  const handleCreateGroup = useCallback(
    async (groupName: string, participants: User[]) => {
      try {
        // Ensure current user is included
        const memberIds = [
          currentUser!.id,
          ...participants
            .map((p) => p.id)
            .filter((id) => id !== currentUser!.id),
        ];

        if (memberIds.length < 3) {
          alert("Group chat requires at least 3 participants.");
          return;
        }

        // Check if group chat with exact same members already exists
        const existingGroupChat = chatsData.find(
          (chat: any) =>
            chat.isGroup &&
            chat.members.length === memberIds.length &&
            memberIds.every((id) =>
              chat.members.some((member: any) => member.user.id === id),
            ),
        );

        if (existingGroupChat) {
          setSelectedChat(existingGroupChat);
          setActiveTab("chat");
          setSelectedUser(null);
          return;
        }

        // Create the group chat via API
        const response = await ChatService.createChat({
          isGroup: true,
          memberIds,
          groupName: groupName.trim() || `Group (${participants.length + 1})`,
          groupImage: null,
        });

        // Normalize the response data
        const newChat = normalizeChatData(response.data || response);

        // Update the chats cache
        queryClient.setQueryData(["chats"], (old: Chat[] = []) => {
          // Check if already exists
          const existing = old.find((chat) => chat.id === newChat.id);
          if (existing) return old;
          return [newChat, ...old];
        });

        // Select the new chat
        setSelectedChat(newChat);
        setActiveTab("chat");
        setSelectedUser(null);

        // Force refresh of chats list
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["chats"] });
        }, 500);
      } catch (error: any) {
        console.error("Error creating group chat:", error);

        // Fallback: Create a temporary local group chat
        const memberIds = [
          currentUser!.id,
          ...participants
            .map((p) => p.id)
            .filter((id) => id !== currentUser!.id),
        ];

        const tempChat: Chat = {
          id: `local-group-${Date.now()}`,
          isGroup: true,
          groupName: groupName.trim() || `Group (${participants.length + 1})`,
          groupImage: "",
          members: memberIds.map((userId, index) => {
            const user =
              userId === currentUser!.id
                ? currentUser
                : participants.find((p) => p.id === userId)!;
            return {
              id: `member-${userId}-${Date.now()}-${index}`,
              userId,
              user,
              chatId: `local-group-${Date.now()}`,
              chat: {} as Chat,
              unreadCount: 0,
              isPinned: false,
              isMuted: false,
              isArchived: false,
              joinedAt: new Date().toISOString(),
            };
          }) as [],
          messages: [],
          lastMessage: {
            id: `welcome-${Date.now()}`,
            senderId: currentUser!.id,
            content: `${currentUser!.name} created group "${groupName || `Group (${participants.length + 1})`}"`,
            type: MessageType.TEXT,
            sender: currentUser as User,
            chatId: `local-group-${Date.now()}`,
            chat: {} as Chat,
            isEdited: false,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to local cache
        queryClient.setQueryData(["chats"], (old: Chat[] = []) => {
          // Check if group with same members exists
          const existing = old.find(
            (chat) =>
              chat.isGroup &&
              chat.members.length === memberIds.length &&
              memberIds.every((id) =>
                chat.members.some((member) => member.user.id === id),
              ),
          );
          if (existing) return old;
          return [tempChat, ...old];
        });

        setSelectedChat(tempChat);
        setActiveTab("chat");
        setSelectedUser(null);

        alert(
          "Note: This group chat is created locally. It may not sync across devices.",
        );
      }
    },
    [chatsData, currentUser, queryClient],
  );

  const handleStartChat = useCallback(
    async (targetUser: User) => {
      try {
        // Check if chat already exists locally
        const existingChat = chatsData.find(
          (chat: any) =>
            !chat.isGroup &&
            chat.members.length === 2 &&
            chat.members.some(
              (member: any) => member.user.id === targetUser.id,
            ) &&
            chat.members.some(
              (member: any) => member.user.id === currentUser!.id,
            ),
        );

        if (existingChat) {
          setSelectedChat(existingChat);
          setActiveTab("chat");
          setSelectedUser(null);
          return;
        }

        // Create the chat via API
        const response = await ChatService.createChat({
          isGroup: false,
          memberIds: [currentUser!.id, targetUser.id],
          groupName: null,
          groupImage: null,
        });

        // Normalize the response data
        const newChat = normalizeChatData(response.data || response);

        // Update the chats cache
        queryClient.setQueryData(["chats"], (old: Chat[] = []) => {
          // Check if already exists
          const existing = old.find((chat) => chat.id === newChat.id);
          if (existing) return old;
          return [newChat, ...old];
        });

        // Select the new chat
        setSelectedChat(newChat);
        setActiveTab("chat");
        setSelectedUser(null);

        // Force refresh of chats list
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["chats"] });
        }, 500);
      } catch (error: any) {
        console.error("Error creating chat:", error);

        // Fallback: Create a temporary local chat
        const tempChat: Chat = {
          id: `local-${currentUser!.id}-${targetUser.id}-${Date.now()}`,
          isGroup: false,
          members: [
            {
              id: `member-${currentUser!.id}-${Date.now()}`,
              userId: currentUser!.id,
              user: currentUser as User,
              chatId: `local-${currentUser!.id}-${targetUser.id}-${Date.now()}`,
              chat: {} as Chat,
              unreadCount: 0,
              isPinned: false,
              isMuted: false,
              isArchived: false,
              joinedAt: new Date().toISOString(),
            },
            {
              id: `member-${targetUser.id}-${Date.now()}`,
              userId: targetUser.id,
              user: targetUser,
              chatId: `local-${currentUser!.id}-${targetUser.id}-${Date.now()}`,
              chat: {} as Chat,
              unreadCount: 0,
              isPinned: false,
              isMuted: false,
              isArchived: false,
              joinedAt: new Date().toISOString(),
            },
          ],
          messages: [],
          lastMessage: {
            id: `welcome-${Date.now()}`,
            senderId: currentUser!.id,
            content: "Chat started",
            type: MessageType.TEXT,
            sender: currentUser as User,
            chatId: `local-${currentUser!.id}-${targetUser.id}-${Date.now()}`,
            chat: {} as Chat,
            isEdited: false,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to local cache
        queryClient.setQueryData(["chats"], (old: Chat[] = []) => {
          const existing = old.find(
            (chat) =>
              !chat.isGroup &&
              chat.members.length === 2 &&
              chat.members.some((m) => m.user.id === currentUser!.id) &&
              chat.members.some((m) => m.user.id === targetUser.id),
          );
          if (existing) return old;
          return [tempChat, ...old];
        });

        setSelectedChat(tempChat);
        setActiveTab("chat");
        setSelectedUser(null);

        // Show error message
        alert("Note: This chat is created locally. It may not sync across devices.");
      }
    },
    [chatsData, currentUser, queryClient],
  );

  const handleCreateStatus = useCallback(
    (newStatus: Status) => {
      // Invalidate statuses query
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
    },
    [queryClient],
  );

  const handleDeleteStatus = useCallback(
    (statusId: string) => {
      // Invalidate statuses query
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
      if (selectedStatusId === statusId) {
        StatusService.deleteStatus(statusId);
        setSelectedStatusId(null);
      }
    },
    [selectedStatusId, queryClient],
  );

  const handleNextStatus = useCallback(() => {
    if (!selectedStatusId) return;
    const currentIndex = statusesData.findIndex(
      (s: any) => s.id === selectedStatusId,
    );
    if (currentIndex < statusesData.length - 1) {
      setSelectedStatusId(statusesData[currentIndex + 1].id);
    } else {
      setSelectedStatusId(null);
    }
  }, [selectedStatusId, statusesData]);

  const handlePrevStatus = useCallback(() => {
    if (!selectedStatusId) return;
    const currentIndex = statusesData.findIndex(
      (s: any) => s.id === selectedStatusId,
    );
    if (currentIndex > 0) {
      setSelectedStatusId(statusesData[currentIndex - 1].id);
    } else {
      setSelectedStatusId(null);
    }
  }, [selectedStatusId, statusesData]);

  // Reply to a status — sends a DM to the status owner and navigates to chat
  const handleStatusReply = useCallback(
    async (statusId: string, message: string) => {
      try {
        const result = await StatusService.replyToStatus(statusId, message);
        const chatId = result.data?.chatId;

        if (chatId) {
          // Refresh chats so the DM appears in the list
          await queryClient.invalidateQueries({ queryKey: ["chats"] });

          // Wait briefly for the cache to update, then select the chat
          setTimeout(() => {
            const updatedChats =
              queryClient.getQueryData<Chat[]>(["chats"]) || [];
            const targetChat = updatedChats.find((c) => c.id === chatId);
            if (targetChat) {
              setSelectedChat(targetChat);
            }
            setActiveTab("chat");
            setSelectedStatusId(null);
          }, 500);
        }
      } catch (error: any) {
        console.error("Status reply failed:", error);
        alert(error.message || "Failed to send reply. Please try again.");
      }
    },
    [queryClient],
  );

  // Derived Active View
  const renderMainContent = () => {
    if (isCreatingStatus || isCreatingGroup || isAddingUser || isCreatingUser) {
      return null;
    }

    if (activeTab === "dashboard") {
      return (
        <Dashboard
          currentUser={currentUser as User}
          chats={chatsData}
          statuses={statusesData}
          isLoading={isLoadingChats || isLoadingStatuses}
          onNavigate={(tab) => {
            setActiveTab(tab);
            handleBackToMenu();
            closeModals();
          }}
          onChatSelect={handleChatSelect}
        />
      );
    }

    if (activeTab === "status" && selectedStatusId) {
      const status = statusesData.find(
        (s: Status) => s.id === selectedStatusId,
      );
      if (status) {
        return (
          <StatusView
            status={status}
            allStatuses={statusesData}
            onClose={() => setSelectedStatusId(null)}
            onNext={handleNextStatus}
            onPrev={handlePrevStatus}
            onDelete={handleDeleteStatus}
            onReply={handleStatusReply}
          />
        );
      }
    }

    if (activeTab === "user" && selectedUser) {
      return (
        <UserView
          user={selectedUser}
          onStartChat={handleStartChat}
          onSelect={setSelectedUser}
          onUpdate={handleUpdateUser}
          onBack={handleBackToMenu}
        />
      );
    }

    if (
      activeTab === "response" &&
      (selectedResponseId || isCreatingResponse)
    ) {
      const responseToEdit = selectedResponseId
        ? responsesData.find((r: any) => r.id === selectedResponseId)
        : null;
      return (
        <CannedResponseView
          response={responseToEdit}
          onSave={
            selectedResponseId ? handleUpdateResponse : handleCreateResponse
          }
          onDelete={() => {
            if (selectedResponseId) {
              handleDeleteResponse(selectedResponseId);
            }
          }}
          onCancel={() => {
            setSelectedResponseId(null);
            setIsCreatingResponse(false);
          }}
        />
      );
    }

    if (activeTab === "setting") {
      return (
        <SettingsView
          activeCategory={selectedSettingCategory}
          onBack={() => setMobileSettingsOpen(false)}
        />
      );
    }

    if (activeTab === "chat") {
      return (
        <ChatView
          chat={selectedChat}
          onBack={handleBackToMenu}
          onToggleProfile={toggleProfile}
          cannedResponses={responsesData}
          onTogglePin={handleTogglePin}
          onStatusClick={(statusId) => {
            // to redirect to status view
            handleStatusSelect(statusId);
            setActiveTab("status");
          }}
        />
      );
    }

    if (activeTab === "my-profile") {
      return (
        <MyProfileView
          onClose={() => {
            if (currentUser?.role === UserRole.USER) {
              setActiveTab("chat");
            } else {
              setActiveTab("dashboard");
            }
          }}
        />
      );
    }

    // Default Placeholder
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-secondary border-b-[6px] border-primary/40">
        {activeTab === "status" ? (
          <>
            <div
              className="w-24 h-24 rounded-full border-2 border-dashed border-secondary mb-6 flex items-center justify-center hover:bg-surface-hover cursor-pointer transition-colors"
              onClick={() => {
                if (currentUser.role === UserRole.USER) {
                  return;
                }
                closeModals();
                setIsCreatingStatus(true);
              }}
            >
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl text-primary">
                  {
                    currentUser.role === UserRole.USER ? (
                      <ImageIcon size={32} />
                    ) : (
                      <PlusIcon size={32} />
                    )
                  }
                </span>
              </div>
            </div>
            {
              !(currentUser.role === UserRole.USER) ? (
                <div className="text-center">
                  <h2 className="text-2xl font-light mb-4 text-text-main">
                    All Status Directory
                  </h2>
                  <p className="max-w-md mx-auto text-secondary">
                    Select or add a new status to the system.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                   <p className="max-w-md mx-auto text-secondary">
                    Select a status to view details.
                  </p>
                </div>
              )
            }
          </>
        ) : activeTab === "user" ? (
          <div className="text-center p-8">
            <div
              className="w-24 h-24 bg-surface rounded-full flex items-center justify-center shadow-lg mx-auto mb-6 cursor-pointer hover:bg-surface-hover transition-colors border border-transparent hover:border-border"
              onClick={() => {
                closeModals();
                setIsCreatingUser(true);
              }}
            >
              <Users2 size={48} className="text-primary" />
            </div>
            <h2 className="text-2xl font-light mb-4 text-text-main">
              All Users Directory
            </h2>
            <p className="max-w-md mx-auto text-secondary">
              Select an user or member to view details or add a new user to the
              system.
            </p>
          </div>
        ) : activeTab === "response" ? (
          <div className="text-center p-8">
            <div
              className="w-24 h-24 bg-surface rounded-full flex items-center justify-center shadow-lg mx-auto mb-6 cursor-pointer hover:bg-surface-hover transition-colors border border-transparent hover:border-border"
              onClick={() => setIsCreatingResponse(true)}
            >
              <Zap size={48} className="text-primary" />
            </div>
            <h2 className="text-2xl font-light mb-4 text-text-main">
              Canned Responses
            </h2>
            <p className="max-w-md mx-auto text-secondary">
              Select a response to edit or create a new one to use in chats.
            </p>
          </div>
        ) : (
          <div className="text-center p-8">
            <h2 className="text-2xl font-light mb-4 text-text-main">
              Welcome to LineUp
            </h2>
            <p className="max-w-md mx-auto text-secondary">
              Select a conversation to start messaging. Your messages are
              end-to-end encrypted.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Determine visibility for mobile layout
  const showMainContentOnMobile =
    activeTab === "dashboard" ||
    selectedChat ||
    selectedStatusId ||
    selectedUser ||
    selectedResponseId ||
    isCreatingResponse ||
    isCreatingStatus ||
    isCreatingGroup ||
    isAddingUser ||
    isCreatingUser ||
    (activeTab === "setting" && mobileSettingsOpen);

  // Loading state
  if (
    isLoadingChats ||
    isLoadingStatuses ||
    isLoadingUsers ||
    isLoadingResponses
  ) {
    return (
      <div className="flex flex-col md:flex-row h-screen supports-[height:100dvh]:h-dvh w-full bg-background text-text-main overflow-hidden relative transition-colors duration-300">
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={() => setShowLogoutModal(true)}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (chatsError || statusesError || usersError || responsesError) {
    return (
      <div className="flex flex-col md:flex-row h-screen supports-[height:100dvh]:h-dvh w-full bg-background text-text-main overflow-hidden relative transition-colors duration-300">
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={() => -(true)}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-3xl font-light mb-2 text-text-main flex flex-col justify-center items-center gap-6"> 
              <LucideMessageCircleWarning size={64} className="text-primary" />
              <span>Something went wrong</span>
            </h2>
            <p className="max-w-md mx-auto text-secondary"> 
              Please try refreshing the page. <br />Session may have expired.
            </p>  
            <div className="mt-6">
              <button
                className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover transition-colors duration-300"
                onClick={logout}
              >
                Re-Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen supports-[height:100dvh]:h-dvh w-full bg-background text-text-main overflow-hidden relative transition-colors duration-300">
      {/* 1. Navigation */}
      <div className="shrink-0 z-30 md:h-full">
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={() => setShowLogoutModal(true)}
        />
      </div>

      {/* Content Wrapper */}
      <div className="flex-1 flex overflow-hidden relative h-full">
        {/* 2. List Container */}
        {activeTab !== "dashboard" && activeTab !== "my-profile" && (
          <div
            className={`${showMainContentOnMobile ? "hidden md:flex" : "flex"} flex-1 md:flex-none h-full`}
          >
            {activeTab === "chat" && (
              <ChatList
                chats={chatsData}
                selectedChatId={selectedChat?.id}
                currentUserId={currentUser!.id}
                onAddContact={() => {
                  closeModals();
                  setIsAddingUser(true);
                }}
                onCreateGroup={() => {
                  closeModals();
                  setIsCreatingGroup(true);
                }}
                onChatSelect={handleChatSelect}
                onTogglePin={handleTogglePin}
                onArchive={handleArchiveChat}
              />
            )}
            {activeTab === "status" && (
              <StatusList
                statuses={statusesData}
                onSelectStatus={handleStatusSelect}
                onCreateStatus={() => {
                  closeModals();
                  setIsCreatingStatus(true);
                }}
              />
            )}
            {activeTab === "user" && (
              <UserList
                users={usersData}
                selectedUserId={selectedUser?.id}
                onSelect={setSelectedUser}
                onCreate={() => {
                  closeModals();
                  setIsCreatingUser(true);
                }}
              />
            )}
            {activeTab === "response" && (
              <CannedResponseList
                responses={responsesData}
                selectedId={selectedResponseId || undefined}
                onSelect={(id) => {
                  setSelectedResponseId(id);
                  setIsCreatingResponse(false);
                }}
                onCreate={() => {
                  setIsCreatingResponse(true);
                  setSelectedResponseId(null);
                }}
              />
            )}
            {activeTab === "setting" && (
              <SettingsList
                activeCategory={selectedSettingCategory}
                onSelectCategory={(category) => {
                  setSelectedSettingCategory(category);
                  setMobileSettingsOpen(true);
                }}
              />
            )}
            {activeTab !== "chat" &&
              activeTab !== "status" &&
              activeTab !== "user" &&
              activeTab !== "response" &&
              activeTab !== "setting" &&
              activeTab !== "dashboard" && (
                <div className="w-full md:w-95 bg-surface border-r border-border p-8 text-center text-secondary">
                  Feature coming soon...
                </div>
              )}
          </div>
        )}

        {/* 3. Main Content Window */}
        <div
          className={`${!showMainContentOnMobile && activeTab !== "dashboard" && activeTab !== "my-profile" ? "hidden md:flex" : "flex"} flex-1 h-full min-w-0 bg-background relative`}
        >
          {renderMainContent()}

          {/* Overlays */}
          {isCreatingStatus && (
            <StatusCreator
              onClose={() => setIsCreatingStatus(false)}
              onCreate={() => setIsCreatingStatus(false)}
            />
          )}

          {isCreatingGroup && (
            <CreateGroupModal
              onClose={() => setIsCreatingGroup(false)}
              onCreate={handleCreateGroup}
            />
          )}

          {isAddingUser && (
            <AddUserModal
              onClose={() => {
                setIsCreatingUser(false);
                setError(null);
              }}
              onAdd={handleCreateUser}
              //error={error}
              showRoleSelection={true}
              masters={masters}
              admins={adminUsers}
              branches={branches}
            />
          )}

          {isCreatingUser && (
            <AddUserModal
              onClose={() => {
                setIsCreatingUser(false);
                setError(null); // reset when closing
              }}
              onAdd={handleCreateUser}
              //error={error} //
              showRoleSelection={true}
              masters={masters}
              admins={adminUsers}
              branches={branches}
            />
          )}
          {error && (
            <div className="fixed top-6 right-6 z-9999 max-w-sm">
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl shadow-lg backdrop-blur">
                <div className="font-semibold mb-1">Error</div>
                <div className="text-sm whitespace-pre-line">{error}</div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Right Profile Sidebar */}
        {showProfile && selectedChat && activeTab === "chat" && (
          <div className="absolute inset-0 z-50 md:relative md:z-0 md:inset-auto md:flex shrink-0">
            <div
              className="absolute inset-0 bg-black/50 md:hidden"
              onClick={() => setShowProfile(false)}
            ></div>
            {!selectedChat.isGroup && (
              <ProfileView
                userId={
                  currentUser?.role === UserRole.USER ||
                  currentUser?.role === UserRole.BRANCH
                    ? selectedChat.members.find(
                        (m) => m.user.id !== currentUser!.id,
                      )?.user?.id || selectedChat.members[0].user?.id
                    : selectedChat.members.find(
                        (m) => m.user.role === UserRole.BRANCH,
                      )?.user?.id || selectedChat.members[0].user?.id
                }
                onClose={() => setShowProfile(false)}
                onUpdate={handleUpdateUserProfile as any}
                onDelete={handleDeleteContact}
              />
            )}
            {selectedChat.isGroup && (
              <GroupProfileView
                chat={selectedChat}
                onClose={() => setShowProfile(false)}
                onUpdate={() => {
                  alert("Feature coming soon...");
                }}
                onDelete={() => {
                  alert("Feature coming soon...");
                }}
                onLeaveGroup={() => {
                  alert("Feature coming soon...");
                }}
                onAddParticipants={() => {
                  alert("Feature coming soon...");
                }}
              />
            )}
          </div>
        )}
      </div>
      {showLogoutModal && (
        <LogoutModal
          onClose={() => setShowLogoutModal(false)}
          onLogoutDevice={handleLogoutDevice}
          isLoading={isLoggingOut}
        />
      )}
    </div>
  );
};
