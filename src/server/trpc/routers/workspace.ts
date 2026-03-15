import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { slugify } from "@/lib/utils";

export const workspaceRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.workspaceMember.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        workspace: {
          include: {
            _count: { select: { members: true, projects: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100), description: z.string().max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      const baseSlug = slugify(input.name);
      let slug = baseSlug;
      let i = 0;
      while (await ctx.prisma.workspace.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${++i}`;
      }
      const workspace = await ctx.prisma.workspace.create({
        data: {
          name: input.name,
          slug,
          description: input.description,
          members: {
            create: { userId: ctx.session.user.id, role: "owner" },
          },
        },
      });
      return workspace;
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: { workspaceId: input.id, userId: ctx.session.user.id },
        include: {
          workspace: {
            include: {
              members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
              projects: true,
            },
          },
        },
      });
      if (!member) throw new Error("Workspace not found");
      return member.workspace;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: { workspaceId: input.id, userId: ctx.session.user.id },
      });
      if (!member || member.role !== "owner") throw new Error("Not authorized");
      await ctx.prisma.workspace.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
