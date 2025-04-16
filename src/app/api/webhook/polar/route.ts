import { env } from "@/env";
import { Webhooks } from "@polar-sh/nextjs";
import { handlePolarOrderPaid } from "@/utils/polarFunctions";
export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET,
  onOrderPaid: handlePolarOrderPaid,
});
