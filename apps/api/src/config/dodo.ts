import type { PlanTier } from "@snipmatic/utils";
import DodoPayments from "dodopayments";

export const paidPlanTiers = ["clip", "studio"] as const;
export type PaidPlanTier = (typeof paidPlanTiers)[number];

export const getDodoClient = () => {
  const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;

  if (!bearerToken) throw new Error("Missing DODO_PAYMENTS_API_KEY");

  return new DodoPayments({
    bearerToken,
    webhookKey,
    environment:
      process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
        ? "live_mode"
        : "test_mode",
  });
};

export const getDodoProductId = (planTier: PlanTier) => {
  const productId = {
    clip: process.env.DODO_PRODUCT_CLIP,
    studio: process.env.DODO_PRODUCT_STUDIO,
    free: undefined,
  }[planTier];
  if (!productId)
    throw new Error(`Missing Dodo product ID for plan: ${planTier}`);
  return productId;
};

export const planTierForProduct = (productId: string): PaidPlanTier | null => {
  if (productId === process.env.DODO_PRODUCT_CLIP) return "clip";
  if (productId === process.env.DODO_PRODUCT_STUDIO) return "studio";
  return null;
};
