import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const projectRouter = router({
  list: protectedProcedure
    .input(z.object({ workspaceId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: { workspaceId: input.workspaceId, userId: ctx.session.user.id },
      });
      if (!member) throw new Error("Workspace not found");
      return ctx.prisma.project.findMany({
        where: { workspaceId: input.workspaceId },
        include: { _count: { select: { tasks: true } } },
        orderBy: { createdAt: "asc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        color: z.string().max(20).optional(),
        icon: z.string().max(50).optional(),
        image: z.string().url().max(500).optional(),
        workspaceId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: { workspaceId: input.workspaceId, userId: ctx.session.user.id },
      });
      if (!member) throw new Error("Workspace not found");
      return ctx.prisma.project.create({
        data: input,
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.id },
        include: {
          workspace: {
            include: {
              members: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true, image: true },
                  },
                },
              },
            },
          },
        },
      });
      if (!project) throw new Error("Project not found");
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: { workspaceId: project.workspaceId, userId: ctx.session.user.id },
      });
      if (!member) throw new Error("Not authorized");
      return { project, workspaceMembers: project.workspace.members, currentMemberRole: member.role };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        color: z.string().max(20).optional(),
        icon: z.string().max(50).optional(),
        image: z.string().url().max(500).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({ where: { id: input.id } });
      if (!project) throw new Error("Project not found");
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: { workspaceId: project.workspaceId, userId: ctx.session.user.id },
      });
      if (!member) throw new Error("Not authorized");
      return ctx.prisma.project.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          color: input.color,
          icon: input.icon,
          image: input.image ?? undefined,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({ where: { id: input.id } });
      if (!project) throw new Error("Project not found");
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: { workspaceId: project.workspaceId, userId: ctx.session.user.id },
      });
      if (!member) throw new Error("Not authorized");
      await ctx.prisma.project.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
