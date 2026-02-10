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
