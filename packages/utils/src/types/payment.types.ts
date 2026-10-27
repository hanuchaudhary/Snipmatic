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

  accountResponse: z.object({
    user: z.object({
      name: z.string(),
      email: z.string(),
      emailVerified: z.boolean(),
      role: z.enum(["USER", "ADMIN"]),
      image: z.string().nullable(),
      createdAt: z.string(),
    }),
    billing: z.object({
      balance: z.number(),
      planTier: planTierSchema,
      hasBillingAccount: z.boolean(),
      subscription: z
        .object({
          id: z.string(),
          planTier: planTierSchema,
          status: z.string(),
          startedAt: z.string(),
          nextBillingDate: z.string(),
          cancelAtPeriodEnd: z.boolean(),
          amount: z.number(),
          currency: z.string(),
        })
        .nullable(),
      recentActivity: z.array(
        z.object({
          id: z.string(),
          amount: z.number(),
          type: z.string(),
          description: z.string().nullable(),
          createdAt: z.string(),
        })
      ),
    }),
  }),

  portalResponse: z.object({
    url: z.string(),
  }),
} as const;

export type PaymentModel = {
  [K in keyof typeof PaymentModel]: z.infer<(typeof PaymentModel)[K]>;
};
