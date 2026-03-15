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
