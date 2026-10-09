import { z } from "zod";

import { PLAN_TIERS } from "../lib/credits";

export const planTierSchema = z.enum(PLAN_TIERS);

export const PaymentModel = {
  checkoutBody: z.object({
    planTier: planTierSchema,
  }),

  checkoutResponse: z.object({
    url: z.string(),
  }),

  creditsResponse: z.object({
    balance: z.number(),
    planTier: planTierSchema,
  }),

  portalResponse: z.object({
    url: z.string(),
  }),
} as const;

export type PaymentModel = {
  [K in keyof typeof PaymentModel]: z.infer<(typeof PaymentModel)[K]>;
};
