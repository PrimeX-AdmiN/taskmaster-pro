import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { workspaceRouter } from "./routers/workspace";
import { taskRouter } from "./routers/task";
import { projectRouter } from "./routers/project";
import { analyticsRouter } from "./routers/analytics";

export const appRouter = router({
  auth: authRouter,
  workspace: workspaceRouter,
  task: taskRouter,
  project: projectRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
