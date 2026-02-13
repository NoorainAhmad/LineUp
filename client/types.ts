export enum UserRole {
  DEVELOPER = "DEVELOPER",
  MASTER = "MASTER",
  ADMIN = "ADMIN",
  BRANCH = "BRANCH",
  USER = "USER",
}

export enum UserStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  BUSY = "BUSY",
}

export enum UserPermission {
  READ = "READ",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export enum StatusType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export enum MediaStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  FILE = "FILE",
}

export interface User {
  id: string;
  guid: string;
  name: string;
  phone: string;

  email?: string;
  location?: string;
  avatarUrl?: string;
  status: UserStatus;
  lastSeen: string;
  ipAddress: string;
  isActive: boolean;

  role: UserRole;
  permission: UserPermission[];

  parentId?: string;
  parent?: User;
  children: User[];

  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;

  members: ChatMember[];
  messages: Message[];

  lastMessageId?: string;
  lastMessage?: Message;

  createdAt: string;
  updatedAt: string;
}

export interface ChatMember {
  id: string;
  userId: string;
  user: User;
  chatId: string;
  chat: Chat;

  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  joinedAt: string;
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;

  senderId: string;
  sender: User;
  chatId: string;
  chat: Chat;

  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;

  replyToId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  reactions?: Record<string, string[]>;

  asLastMessage?: Chat;

  createdAt: string;
  updatedAt: string;
}

export interface Status {
  id: string;
  type: StatusType;
  content?: string;
  color?: string;

  mediaId?: string;
  media?: Media;
  userId: string;
  user: User;

  viewers: StatusView[];

  expiresAt: string;
  createdAt: string;
}

export interface StatusView {
  id: string;
  statusId: string;
  status: Status;
  userId: string;
  user: User;

  viewedAt: string;
}

export interface Media {
  id: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  mediaStatus: MediaStatus;
  fileSize: number;

  userId: string;
  user: User;

  createdAt: string;
  updatedAt: string;
}

export interface CannedResponse {
  id: string;
  command: string;
  text: string;
  description?: string;

  userId: string;
  user: User;

  createdAt: string;
  updatedAt: string;
}

export interface Otp {
  id: string;
  phone: string;
  code: string;

  expiresAt: string;
  createdAt: string;
}

export interface System {
  id: string; 
  activeBranchId: string;
  activeBranch: User;
  workspaceName: string;
  systemVersion: string;
  systemEmail: string;
  systemPhone: string;
  systemTimezone: string;
  systemLanguage: string;
  systemMaintenance: boolean;
  updatedAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "SUCCESS";
  module: string;
  message: string;
}

export interface Backup {
  id: string;
  name: string;
  size: string;
  createdAt: string;
  status: "COMPLETED" | "FAILED" | "IN_PROGRESS";
  type: "FULL" | "INCREMENTAL";
}
