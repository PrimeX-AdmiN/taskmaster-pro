import { inngest } from "../client";

export const sendNotification = inngest.createFunction(
  { id: "send-notification" },
  { event: "notification/send" },
  async ({ event, step }) => {
    const { userId, type, title, message, link } = event.data;
    const { prisma } = await import("@/lib/db");
    await prisma.notification.create({
      data: { userId, type, title, message, link },
    });
    return { ok: true };
  }
);
