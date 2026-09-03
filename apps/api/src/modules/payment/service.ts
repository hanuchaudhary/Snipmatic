import {
  CreditTransactionType,
  PlanTier as DbPlanTier,
  Prisma,
  prisma,
} from "@snipmatic/db";
import { getPlanMonthlyCredits, PLANS, type PlanTier } from "@snipmatic/utils";
import { WEB_URL } from "@snipmatic/utils";
import { status } from "elysia";
import type Stripe from "stripe";

import {
  getStripePriceId,
  getStripeWebhookSecret,
  stripe,
} from "../../config/stripe";
import { planTierFromDb, planTierToDb } from "./utils";

export abstract class PaymentService {
  static async getOrCreateBilling(userId: string) {
    const existing = await prisma.userBilling.findUnique({
      where: { userId },
    });

    if (existing) {
      return existing;
    }

    return prisma.userBilling.create({
      data: {
        userId,
        planTier: DbPlanTier.STARTER,
        creditsBalance: 0,
      },
    });
  }

  static async getCredits(userId: string) {
    const billing = await this.getOrCreateBilling(userId);

    return {
      balance: billing.creditsBalance,
      planTier: planTierFromDb(billing.planTier),
    };
  }

  static async createCheckoutSession(userId: string, planTier: PlanTier) {
    const billing = await this.getOrCreateBilling(userId);
    const priceId = getStripePriceId(planTier);

    let customerId = billing.stripeCustomerId;

    if (!customerId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw status(404, "User not found");
      }

      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId,
        },
      });

      customerId = customer.id;

      await prisma.userBilling.update({
        where: { userId },
        data: {
          stripeCustomerId: customerId,
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${WEB_URL}/pricing/success`,
      cancel_url: `${WEB_URL}/pricing/cancel`,
      client_reference_id: userId,
      metadata: {
        userId,
        planTier,
      },
      subscription_data: {
        metadata: {
          userId,
          planTier,
        },
      },
    });

    if (!session.url) {
      throw status(500, "Unable to create checkout session");
    }

    return { url: session.url };
  }

  static async createPortalSession(userId: string) {
    const billing = await this.getOrCreateBilling(userId);

    if (!billing.stripeCustomerId) {
      throw status(400, "No Stripe customer found");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: billing.stripeCustomerId,
      return_url: `${WEB_URL}/pricing`,
    });

    return { url: session.url };
  }

  static async grantCredits({
    userId,
    amount,
    type,
    description,
    stripeInvoiceId,
    metadata,
  }: {
    userId: string;
    amount: number;
    type: CreditTransactionType;
    description?: string;
    stripeInvoiceId?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    if (stripeInvoiceId) {
      const existing = await prisma.creditTransaction.findUnique({
        where: { stripeInvoiceId },
      });

      if (existing) {
        return existing;
      }
    }

    const billing = await this.getOrCreateBilling(userId);

    return prisma.$transaction(async (tx) => {
      const updatedBilling = await tx.userBilling.update({
        where: { id: billing.id },
        data: {
          creditsBalance: {
            increment: amount,
          },
        },
      });

      return tx.creditTransaction.create({
        data: {
          userId,
          billingId: updatedBilling.id,
          amount,
          type,
          description,
          stripeInvoiceId,
          metadata,
        },
      });
    });
  }

  static async deductCredits({
    userId,
    amount,
    jobId,
    metadata,
  }: {
    userId: string;
    amount: number;
    jobId?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    const billing = await this.getOrCreateBilling(userId);

    if (billing.creditsBalance < amount) {
      throw status(402, "Insufficient credits");
    }

    return prisma.$transaction(async (tx) => {
      const updatedBilling = await tx.userBilling.update({
        where: { id: billing.id },
        data: {
          creditsBalance: {
            decrement: amount,
          },
        },
      });

      return tx.creditTransaction.create({
        data: {
          userId,
          billingId: updatedBilling.id,
          amount: -amount,
          type: CreditTransactionType.USAGE,
          description: "Clip processing usage",
          jobId,
          metadata,
        },
      });
    });
  }

  static async handleCheckoutCompleted(session: {
    client_reference_id: string | null;
    customer: string | null;
    subscription: string | null;
    metadata: Record<string, string> | null;
  }) {
    const userId = session.client_reference_id ?? session.metadata?.userId;
    const planTier = session.metadata?.planTier as PlanTier | undefined;

    if (!userId || !planTier) {
      return;
    }

    await this.getOrCreateBilling(userId);

    await prisma.userBilling.update({
      where: { userId },
      data: {
        stripeCustomerId: session.customer ?? undefined,
        stripeSubscriptionId: session.subscription ?? undefined,
        planTier: planTierToDb(planTier),
      },
    });

    await this.grantCredits({
      userId,
      amount: getPlanMonthlyCredits(planTier),
      type: CreditTransactionType.SUBSCRIPTION_GRANT,
      description: `${PLANS[planTier].name} subscription credits`,
      metadata: {
        planTier,
        source: "checkout.session.completed",
      },
    });
  }

  static async handleInvoicePaid(invoice: Stripe.Invoice) {
    if (invoice.billing_reason === "subscription_create") {
      return;
    }

    const customerId =
      typeof invoice.customer === "string"
        ? invoice.customer
        : invoice.customer?.id;

    if (!customerId) {
      return;
    }

    const billing = await prisma.userBilling.findFirst({
      where: {
        stripeCustomerId: customerId,
      },
    });

    if (!billing) {
      return;
    }

    const planTier = planTierFromDb(billing.planTier);

    await this.grantCredits({
      userId: billing.userId,
      amount: getPlanMonthlyCredits(planTier),
      type: CreditTransactionType.SUBSCRIPTION_GRANT,
      description: `${PLANS[planTier].name} renewal credits`,
      stripeInvoiceId: invoice.id,
      metadata: {
        planTier,
        source: "invoice.paid",
      },
    });
  }

  static async handleSubscriptionDeleted(subscription: {
    id: string;
    customer: string | null;
  }) {
    if (!subscription.customer) {
      return;
    }

    const billing = await prisma.userBilling.findFirst({
      where: {
        stripeCustomerId:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer,
      },
    });

    if (!billing) {
      return;
    }

    await prisma.userBilling.update({
      where: { id: billing.id },
      data: {
        stripeSubscriptionId: null,
        planTier: DbPlanTier.STARTER,
      },
    });
  }

  static async webhook(rawBody: string, signature: string | null) {
    if (!signature) {
      throw status(400, "Missing Stripe signature");
    }

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret()
    );

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutCompleted(
          event.data.object as {
            client_reference_id: string | null;
            customer: string | null;
            subscription: string | null;
            metadata: Record<string, string> | null;
          }
        );
        break;
      case "invoice.paid":
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(
          event.data.object as {
            id: string;
            customer: string | null;
          }
        );
        break;
    }

    return { received: true };
  }
}
