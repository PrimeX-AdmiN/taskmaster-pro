import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
});

export const createContext = async () => {
  const session = await getServerSession(authOptions);
  return { session, prisma: (await import("@/lib/db")).prisma };
};

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: { ...ctx, session: { ...ctx.session, user: ctx.session.user } },
  });
});

export const protectedProcedure = t.procedure.use(enforceAuth);
