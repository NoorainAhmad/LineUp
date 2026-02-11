import { z } from "zod";

// SYSTEM VALIDATOR
export const systemSchema = z.object({
  activeBranchId: z.string().min(1).max(50).optional().nullable(),
  workspaceName: z.string().min(1).max(50).optional().nullable(),
  systemVersion: z.string().min(1).max(50).optional().nullable(),
  systemEmail: z.string().min(1).max(50).optional().nullable(),
  systemPhone: z.string().min(1).max(50).optional().nullable(),
  systemTimezone: z.string().min(1).max(50).optional().nullable(),
  systemLanguage: z.string().min(1).max(50).optional().nullable(),
  systemMaintenance: z.boolean().optional().nullable(),
});

export type SystemInput = z.infer<typeof systemSchema>;
