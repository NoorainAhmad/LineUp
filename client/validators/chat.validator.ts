import { z } from "zod";

const MessageTypeEnum = z.enum(["TEXT", "IMAGE", "AUDIO", "VIDEO", "FILE", "STICKER"]);

// MESSAGE VALIDATOR
export const sendMessageSchema = z.object({
  type: MessageTypeEnum.default("TEXT"),
  content: z.string().min(1).max(5000),
  chatId: z.string(),
  replyToId: z.string().optional().nullable(),
  mediaIds: z.array(z.string()).optional(),
});

// CHAT CREATE VALIDATOR
export const chatCreateSchema = z.object({
  isGroup: z.boolean().default(false),
  groupName: z.string().min(3).max(50).optional().nullable(),
  groupImage: z.string().optional().nullable(),
  memberIds: z.array(z.string()).min(1),
});

// CHAT MEMBER UPDATE VALIDATOR
export const chatMemberUpdateSchema = z.object({
  isPinned: z.boolean().optional(),
  isMuted: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  lastReadAt: z.date().optional(),
});

// REACTION VALIDATOR
export const messageReactionSchema = z.object({
  messageId: z.string(),
  emoji: z.string(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ChatCreateInput = z.infer<typeof chatCreateSchema>;
export type ChatMemberUpdateInput = z.infer<typeof chatMemberUpdateSchema>;
