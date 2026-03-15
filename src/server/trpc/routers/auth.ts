import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const authRouter = router({
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing) throw new Error("Email already registered");
      const hashed = await bcrypt.hash(input.password, 12);
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          password: hashed,
        },
      });
      return { id: user.id, email: user.email, name: user.name };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { id: true, email: true, name: true, image: true },
    });
    return user;
  }),
});
