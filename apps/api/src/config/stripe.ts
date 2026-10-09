import Stripe from "stripe";

import type { PlanTier } from "@snipmatic/utils";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

const priceIds: Record<PlanTier, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  influencer: process.env.STRIPE_PRICE_INFLUENCER,
  studio: process.env.STRIPE_PRICE_STUDIO,
};

export const getStripePriceId = (planTier: PlanTier) => {
  const priceId = priceIds[planTier];

  if (!priceId) {
    throw new Error(`Missing Stripe price ID for plan: ${planTier}`);
  }

  return priceId;
};

export const getStripeWebhookSecret = () => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }

  return secret;
};
