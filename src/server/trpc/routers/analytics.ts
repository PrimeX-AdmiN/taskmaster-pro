import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const analyticsRouter = router({
  dashboard: protectedProcedure
    .input(z.object({ workspaceId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: { workspaceId: input.workspaceId, userId: ctx.session.user.id },
      });
      if (!member) throw new Error("Workspace not found");

      const [tasksByStatus, tasksByPriority, totalTasks, completedTasks] = await Promise.all([
        ctx.prisma.task.groupBy({
          by: ["status"],
          where: { workspaceId: input.workspaceId },
          _count: true,
        }),
        ctx.prisma.task.groupBy({
          by: ["priority"],
          where: { workspaceId: input.workspaceId },
          _count: true,
        }),
        ctx.prisma.task.count({ where: { workspaceId: input.workspaceId } }),
        ctx.prisma.task.count({
          where: { workspaceId: input.workspaceId, status: "done" },
        }),
      ]);

      return {
        tasksByStatus: Object.fromEntries(tasksByStatus.map((s) => [s.status, s._count])),
        tasksByPriority: Object.fromEntries(tasksByPriority.map((p) => [p.priority, p._count])),
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      };
    }),
});
