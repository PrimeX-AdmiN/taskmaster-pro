import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.coerce.date().optional().nullable(),
  projectId: z.string().cuid().optional().nullable(),
  workspaceId: z.string().cuid(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().cuid(),
});

export const assignTaskSchema = z.object({
  taskId: z.string().cuid(),
  userId: z.string().cuid(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
