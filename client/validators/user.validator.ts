import { z } from "zod";

const PermissionEnum = z.enum(["READ", "CREATE", "UPDATE", "DELETE"]);
const RoleEnum = z.enum(["DEVELOPER", "MASTER", "ADMIN", "BRANCH", "USER"]);

// USER CREATE VALIDATOR
export const userCreateSchema = z.object({
  guid: z.string(),
  name: z.string().min(2).max(50),
  phone: z.string().min(10),
  password: z.string().min(6),
  email: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  role: RoleEnum.default("USER").optional(),
  parentId: z.string().optional().nullable(),
  permission: z.array(PermissionEnum).default(["READ"]).optional(),
});

// USER UPDATE VALIDATOR
export const userUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional().nullable(),
  phone: z.string().min(10).optional().nullable(),
  password: z.string().min(6).optional().nullable(),
  email: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(), 
  isActive: z.boolean().optional().nullable(),
  parentId: z.string().optional().nullable(),
  permission: z.array(PermissionEnum).optional(),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
