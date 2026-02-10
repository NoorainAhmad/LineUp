import { z } from "zod"; 

// CANNED RESPONSE CREATE VALIDATOR
export const cannedResponseCreateSchema = z.object({
  command: z.string().min(3).max(50),
  text: z.string().min(3).max(50),
  description: z.string().optional()
}); 

export type CannedResponseCreateInput = z.infer<typeof cannedResponseCreateSchema>; 