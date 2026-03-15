import { serve } from "inngest/next";
import { inngest } from "../../../../inngest/client";
import { sendNotification } from "../../../../inngest/functions/notifications";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendNotification],
});
