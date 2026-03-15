import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["member", "admin"]).default("member"),
  workspaceId: z.string().cuid(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
