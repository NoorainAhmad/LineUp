import { z } from "zod";

const StatusTypeEnum = z.enum(["TEXT", "IMAGE", "VIDEO"]);

// STATUS CREATE VALIDATOR
export const statusCreateSchema = z.object({
  type: StatusTypeEnum.default("TEXT"),
  content: z.string().max(500).optional().nullable(),
  color: z.string().optional().nullable(),
  mediaId: z.string().optional().nullable()
});

export type StatusCreateInput = z.infer<typeof statusCreateSchema>;

// STATUS REPLY VALIDATOR
export const statusReplySchema = z.object({
  message: z.string().min(1).max(500),
});

export type StatusReplyInput = z.infer<typeof statusReplySchema>;

// STATUS SHARE VALIDATOR
export const statusShareSchema = z.object({
  targetChatIds: z.array(z.string()).min(1, "At least one chat must be selected"),
});

export type StatusShareInput = z.infer<typeof statusShareSchema>;
