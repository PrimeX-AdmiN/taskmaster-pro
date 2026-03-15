import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const taskRouter = router({
  list: protectedProcedure
    .input(z.object({ workspaceId: z.string().cuid(), projectId: z.string().cuid().optional() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: { workspaceId: input.workspaceId, userId: ctx.session.user.id },
      });
      if (!member) throw new Error("Workspace not found");
      return ctx.prisma.task.findMany({
        where: {
          workspaceId: input.workspaceId,
          ...(input.projectId ? { projectId: input.projectId } : {}),
        },
        include: {
          creator: { select: { id: true, name: true, image: true } },
          assignments: { include: { user: { select: { id: true, name: true, image: true } } } },
          project: { select: { id: true, name: true, color: true } },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
        include: {
          creator: { select: { id: true, name: true, email: true, image: true } },
          assignments: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
          project: true,
          attachments: true,
          workspace: true,
        },
      });
      if (!task) throw new Error("Task not found");
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: { workspaceId: task.workspaceId, userId: ctx.session.user.id },
      });
      if (!member) throw new Error("Not authorized");
      return task;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(500),
        description: z.string().max(5000).optional(),
        status: z.enum(["todo", "in_progress", "done"]).default("todo"),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        dueDate: z.coerce.date().optional().nullable(),
        projectId: z.string().cuid().optional().nullable(),
        workspaceId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: { workspaceId: input.workspaceId, userId: ctx.session.user.id },
      });
      if (!member) throw new Error("Workspace not found");
      return ctx.prisma.task.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
        },
        include: {
          creator: { select: { id: true, name: true, image: true } },
          project: { select: { id: true, name: true, color: true } },
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        title: z.string().min(1).max(500).optional(),
        description: z.string().max(5000).optional().nullable(),
        status: z.enum(["todo", "in_progress", "done"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        dueDate: z.coerce.date().optional().nullable(),
        projectId: z.string().cuid().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const task = await ctx.prisma.task.findUnique({ where: { id } });
      if (!task) throw new Error("Task not found");
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: { workspaceId: task.workspaceId, userId: ctx.session.user.id },
      });
      if (!member) throw new Error("Not authorized");
      return ctx.prisma.task.update({
        where: { id },
        data,
        include: {
          creator: { select: { id: true, name: true, image: true } },
          assignments: { include: { user: { select: { id: true, name: true, image: true } } } },
          project: { select: { id: true, name: true, color: true } },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({ where: { id: input.id } });
      if (!task) throw new Error("Task not found");
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: { workspaceId: task.workspaceId, userId: ctx.session.user.id },
      });
      if (!member) throw new Error("Not authorized");
      await ctx.prisma.task.delete({ where: { id: input.id } });
      return { success: true };
    }),

  assign: protectedProcedure
    .input(z.object({ taskId: z.string().cuid(), userId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({ where: { id: input.taskId } });
      if (!task) throw new Error("Task not found");
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: { workspaceId: task.workspaceId, userId: ctx.session.user.id },
      });
      if (!member) throw new Error("Not authorized");
      await ctx.prisma.taskAssignment.upsert({
        where: { taskId_userId: { taskId: input.taskId, userId: input.userId } },
        create: { taskId: input.taskId, userId: input.userId },
        update: {},
      });
      return { success: true };
    }),

  unassign: protectedProcedure
    .input(z.object({ taskId: z.string().cuid(), userId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({ where: { id: input.taskId } });
      if (!task) throw new Error("Task not found");
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: { workspaceId: task.workspaceId, userId: ctx.session.user.id },
      });
      if (!member) throw new Error("Not authorized");
      await ctx.prisma.taskAssignment.deleteMany({
        where: { taskId: input.taskId, userId: input.userId },
      });
      return { success: true };
    }),
});
