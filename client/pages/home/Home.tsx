import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "./Navigation";
import { CreateGroupModal } from "../../components/modals/CreateGroupModal";
import { AddUserModal } from "../../components/modals/AddUserModal";
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
import { Users2, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

import { UserService } from "@/services/user.service";
import { CannedResponseService } from "@/services/canned.service";
import { StatusService } from "@/services/status.service";
import { ChatService } from "@/services/chat.service";

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

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(
    null,
  );
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isCreatingStatus, setIsCreatingStatus] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingResponse, setIsCreatingResponse] = useState(false);
  const [selectedSettingCategory, setSelectedSettingCategory] =
    useState("system-dashboard");
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // React Query hooks for data fetching
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
    refetchOnWindowFocus: false,
    refetchInterval: 1000,
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
    refetchOnWindowFocus: false,
    refetchInterval: 2000,
  });

  const {
    data: usersData = [],
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await UserService.getAllUsers();
      return (response.data || response).map(normalizeUserData);
    },
    refetchOnWindowFocus: false,
    refetchInterval: 3000,
  });

  const {
    data: responsesData = [],
    isLoading: isLoadingResponses,
    error: responsesError,
  } = useQuery({
    queryKey: ["canned-responses"],
    queryFn: async () => {
      const response = await CannedResponseService.getAllCannedResponses();
      return (response.data || response).map(normalizeCannedResponseData);
    },
    refetchOnWindowFocus: false,
    refetchInterval: 4000,
  });

  // Derived data
  const masters = useMemo(
    () => usersData.filter((u) => u.role === UserRole.MASTER),
    [usersData],
  );

  const adminUsers = useMemo(
    () => usersData.filter((u) => u.role === UserRole.ADMIN),
    [usersData],
  );

  const branches = useMemo(
    () => usersData.filter((u) => u.role === UserRole.BRANCH),
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
              userId: currentUser.id,
              user: currentUser,
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
      } catch (error) {
        console.error("Error adding contact:", error);
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
      } catch (error) {
        console.error("Error creating user:", error);
      }
    },
    [createUserMutation],
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

  const handleUpdateUser = useCallback(
    (updatedUser: User) => {
      queryClient.setQueryData(["users"], (old: User[] = []) =>
        old.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
      );
      if (selectedUser?.id === updatedUser.id) {
        setSelectedUser(updatedUser);
      }
    },
    [selectedUser, queryClient],
  );

  const handleTogglePin = useCallback(
    async (chatId: string) => {
      // Note: In a real app, you would call an API to toggle pin
      // For now, we'll update local state
      queryClient.setQueryData(["chats"], (old: Chat[] = []) =>
        old.map((chat) => {
          if (chat.id === chatId) {
            const updatedMembers = chat.members.map((member) =>
              member.userId === currentUser.id
                ? { ...member, isPinned: !member.isPinned }
                : member,
            );
            return { ...chat, members: updatedMembers };
          }
          return chat;
        }),
      );

      if (selectedChat?.id === chatId) {
        const updatedMembers = selectedChat.members.map((member) =>
          member.userId === currentUser.id
            ? { ...member, isPinned: !member.isPinned }
            : member,
        );
        setSelectedChat({ ...selectedChat, members: updatedMembers });
      }
    },
    [selectedChat, currentUser.id, queryClient],
  );

  const handleArchiveChat = useCallback(
    (chatId: string) => {
      // Note: In a real app, you would call an API to archive
      queryClient.setQueryData(["chats"], (old: Chat[] = []) =>
        old.map((chat) => {
          if (chat.id === chatId) {
            const updatedMembers = chat.members.map((member) =>
              member.userId === currentUser.id
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
    },
    [selectedChat, currentUser.id, queryClient],
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
    (name: string, participants: User[]) => {
      // Note: In a real app, you would call ChatService.createChat
      const newChat: Chat = {
        id: Date.now().toString(),
        isGroup: true,
        groupName: name,
        members: participants.map((user) => ({
          id: `member-${Date.now()}-${user.id}`,
          userId: user.id,
          user: user,
          chatId: Date.now().toString(),
          chat: {} as Chat,
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          isArchived: false,
          joinedAt: new Date().toISOString(),
        })),
        messages: [],
        lastMessage: {
          id: "init",
          senderId: "system",
          content: `Group "${name}" created`,
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
          chatId: Date.now().toString(),
          chat: {} as Chat,
          isEdited: false,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Invalidate chats query
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      setSelectedChat(newChat);
    },
    [queryClient],
  );

  const handleStartChat = useCallback(
    async (targetUser: User) => {
      try {
        // Check if chat already exists locally
        const existingChat = chatsData.find(
          (chat) =>
            !chat.isGroup &&
            chat.members.length === 2 &&
            chat.members.some((member) => member.user.id === targetUser.id) &&
            chat.members.some((member) => member.user.id === currentUser.id),
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
          memberIds: [currentUser.id, targetUser.id],
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
          id: `local-${currentUser.id}-${targetUser.id}-${Date.now()}`,
          isGroup: false,
          members: [
            {
              id: `member-${currentUser.id}-${Date.now()}`,
              userId: currentUser.id,
              user: currentUser,
              chatId: `local-${currentUser.id}-${targetUser.id}-${Date.now()}`,
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
              chatId: `local-${currentUser.id}-${targetUser.id}-${Date.now()}`,
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
            senderId: currentUser.id,
            content: "Chat started",
            type: MessageType.TEXT,
            sender: currentUser,
            chatId: `local-${currentUser.id}-${targetUser.id}-${Date.now()}`,
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
              chat.members.some((m) => m.user.id === currentUser.id) &&
              chat.members.some((m) => m.user.id === targetUser.id),
          );
          if (existing) return old;
          return [tempChat, ...old];
        });

        setSelectedChat(tempChat);
        setActiveTab("chat");
        setSelectedUser(null);

        // Show error message
        alert(
          "Note: This chat is created locally. It may not sync across devices.",
        );
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
        setSelectedStatusId(null);
      }
    },
    [selectedStatusId, queryClient],
  );

  const handleNextStatus = useCallback(() => {
    if (!selectedStatusId) return;
    const currentIndex = statusesData.findIndex(
      (s) => s.id === selectedStatusId,
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
      (s) => s.id === selectedStatusId,
    );
    if (currentIndex > 0) {
      setSelectedStatusId(statusesData[currentIndex - 1].id);
    } else {
      setSelectedStatusId(null);
    }
  }, [selectedStatusId, statusesData]);

  // Derived Active View
  const renderMainContent = () => {
    if (isCreatingStatus || isCreatingGroup || isAddingUser || isCreatingUser) {
      return null;
    }

    if (activeTab === "dashboard") {
      return (
        <Dashboard
          currentUser={currentUser}
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
      const status = statusesData.find((s) => s.id === selectedStatusId);
      if (status) {
        return (
          <StatusView
            status={status}
            allStatuses={statusesData}
            onClose={() => setSelectedStatusId(null)}
            onNext={handleNextStatus}
            onPrev={handlePrevStatus}
            onDelete={handleDeleteStatus}
          />
        );
      }
    }

    if (activeTab === "user" && selectedUser) {
      return (
        <UserView
          user={selectedUser}
          onStartChat={handleStartChat}
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
        ? responsesData.find((r) => r.id === selectedResponseId)
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
                closeModals();
                setIsCreatingStatus(true);
              }}
            >
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl text-primary">+</span>
              </div>
            </div>
            <p>Click + or select a contact to view their status.</p>
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
          onLogout={logout}
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
          onLogout={logout}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-light mb-4 text-text-main">
              Error Loading Data
            </h2>
            <p className="max-w-md mx-auto text-secondary">
              Please try refreshing the page.
            </p>
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
          onLogout={logout}
        />
      </div>

      {/* Content Wrapper */}
      <div className="flex-1 flex overflow-hidden relative h-full">
        {/* 2. List Container */}
        {activeTab !== "dashboard" && (
          <div
            className={`${showMainContentOnMobile ? "hidden md:flex" : "flex"} flex-1 md:flex-none h-full`}
          >
            {activeTab === "chat" && (
              <ChatList
                chats={chatsData}
                selectedChatId={selectedChat?.id}
                currentUserId={currentUser.id}
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
          className={`${!showMainContentOnMobile && activeTab !== "dashboard" ? "hidden md:flex" : "flex"} flex-1 h-full min-w-0 bg-background relative`}
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
              onClose={() => setIsAddingUser(false)}
              onAdd={handleAddContact}
              masters={masters}
              admins={adminUsers}
              branches={branches}
            />
          )}

          {isCreatingUser && (
            <AddUserModal
              onClose={() => setIsCreatingUser(false)}
              onAdd={handleCreateUser}
              showRoleSelection={true}
              masters={masters}
              admins={adminUsers}
              branches={branches}
            />
          )}
        </div>

        {/* 4. Right Profile Sidebar */}
        {showProfile && selectedChat && activeTab === "chat" && (
          <div className="absolute inset-0 z-50 md:relative md:z-0 md:inset-auto md:flex shrink-0">
            <div
              className="absolute inset-0 bg-black/50 md:hidden"
              onClick={() => setShowProfile(false)}
            ></div>
            {selectedChat.members.length > 0 && (
              <ProfileView
                userId={
                  selectedChat.members.find((m) => m.user.id !== currentUser.id)
                    ?.user?.id || selectedChat.members[0].user?.id
                }
                onClose={() => setShowProfile(false)}
                onUpdate={handleUpdateUserProfile}
                onDelete={handleDeleteContact}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
