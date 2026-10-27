import {
  CreditTransactionType,
  PlanTier as DbPlanTier,
  Prisma,
  prisma,
} from "@snipmatic/db";
import { getPlanMonthlyCredits, PLANS, type PlanTier } from "@snipmatic/utils";
import type { UnwrapWebhookEvent } from "dodopayments/resources/webhooks";
import { status } from "elysia";

import {
  getDodoClient,
  getDodoProductId,
  planTierForProduct,
} from "../../config/dodo";
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
        planTier: DbPlanTier.FREE,
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

  static async getAccount(userId: string) {
    await this.getOrCreateBilling(userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        billing: {
          include: {
            transactions: { orderBy: { createdAt: "desc" }, take: 8 },
          },
        },
      },
    });
    if (!user || !user.billing) throw status(404, "Account not found");

    const billing = user.billing;
    const subscription = billing.dodoSubscriptionId
      ? await getDodoClient().subscriptions.retrieve(billing.dodoSubscriptionId)
      : null;

    return {
      user: {
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.role,
        image: user.image,
        createdAt: user.createdAt.toISOString(),
      },
      billing: {
        balance: billing.creditsBalance,
        planTier: planTierFromDb(billing.planTier),
        hasBillingAccount: Boolean(billing.dodoCustomerId),
        subscription: subscription
          ? {
              id: subscription.subscription_id,
              planTier:
                planTierForProduct(subscription.product_id) ??
                planTierFromDb(billing.planTier),
              status: subscription.status,
              startedAt: subscription.created_at,
              nextBillingDate: subscription.next_billing_date,
              cancelAtPeriodEnd: subscription.cancel_at_next_billing_date,
              amount: subscription.recurring_pre_tax_amount,
              currency: subscription.currency,
            }
          : null,
        recentActivity: billing.transactions.map((transaction) => ({
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          createdAt: transaction.createdAt.toISOString(),
        })),
      },
    };
  }

  static async createCheckoutSession(userId: string, planTier: PlanTier) {
    const billing = await this.getOrCreateBilling(userId);
    if (billing.dodoSubscriptionId) {
      throw status(
        409,
        "Manage your current subscription in the billing portal"
      );
    }
    const productId = getDodoProductId(planTier);
    const dodo = getDodoClient();
    const webUrl = process.env.WEB_URL ?? "http://localhost:5173";
    let customerId = billing.dodoCustomerId;

    if (!customerId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw status(404, "User not found");
      }
      let customer;
      try {
        customer = await dodo.customers.create({
          email: user.email,
          name: user.name,
          metadata: { user_id: userId },
        });
        console.log(customer);
      } catch (error) {
        console.log(error);
      }

      if (!customer) {
        throw status(500, "Unable to create customer");
      }

      customerId = customer.customer_id;

      await prisma.userBilling.update({
        where: { userId },
        data: {
          dodoCustomerId: customerId,
        },
      });
    }

    let session;
    try {
      session = await dodo.checkoutSessions.create({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { customer_id: customerId },
        return_url: `${webUrl}/pricing/success`,
        cancel_url: `${webUrl}/pricing/cancel`,
        metadata: { userId, planTier },
      });
    } catch (error) {
      console.log(error);
    }

    console.log(session);
    if (!session?.checkout_url) {
      throw status(500, "Unable to create checkout session");
    }

    return { url: session.checkout_url };
  }

  static async createPortalSession(userId: string) {
    const billing = await this.getOrCreateBilling(userId);

    if (!billing.dodoCustomerId) {
      throw status(400, "No Dodo customer found");
    }

    const session = await getDodoClient().customers.customerPortal.create(
      billing.dodoCustomerId,
      {
        return_url: `${process.env.WEB_URL ?? "http://localhost:5173"}/pricing`,
      }
    );

    return { url: session.link };
  }

  static async grantCredits({
    userId,
    amount,
    type,
    description,
    billingEventId,
    metadata,
  }: {
    userId: string;
    amount: number;
    type: CreditTransactionType;
    description?: string;
    billingEventId?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    const billing = await this.getOrCreateBilling(userId);

    try {
      return await prisma.$transaction(async (tx) => {
        // The unique event key and balance change commit together.
        const transaction = await tx.creditTransaction.create({
          data: {
            userId,
            billingId: billing.id,
            amount,
            type,
            description,
            billingEventId,
            metadata,
          },
        });
        await tx.userBilling.update({
          where: { id: billing.id },
          data: {
            creditsBalance: {
              increment: amount,
            },
          },
        });

        return transaction;
      });
    } catch (error) {
      if (
        billingEventId &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const existing = await prisma.creditTransaction.findUnique({
          where: { billingEventId },
        });
        if (existing) return existing;
      }
      throw error;
    }
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

  static async handleSubscriptionEvent(event: UnwrapWebhookEvent) {
    if (
      event.type !== "subscription.active" &&
      event.type !== "subscription.renewed" &&
      event.type !== "subscription.plan_changed" &&
      event.type !== "subscription.cancelled" &&
      event.type !== "subscription.expired" &&
      event.type !== "subscription.on_hold" &&
      event.type !== "subscription.paused"
    )
      return;

    const subscription = event.data;
    const billing = await prisma.userBilling.findUnique({
      where: { dodoCustomerId: subscription.customer.customer_id },
    });
    if (!billing)
      throw new Error(
        `Unknown Dodo customer: ${subscription.customer.customer_id}`
      );

    if (
      event.type === "subscription.active" ||
      event.type === "subscription.renewed"
    ) {
      const planTier = planTierForProduct(subscription.product_id);
      if (!planTier)
        throw new Error(`Unknown Dodo product: ${subscription.product_id}`);

      if (
        billing.dodoSubscriptionId &&
        billing.dodoSubscriptionId !== subscription.subscription_id
      ) {
        throw new Error("Customer has another active subscription");
      }

      await prisma.userBilling.update({
        where: { id: billing.id },
        data: {
          dodoSubscriptionId: subscription.subscription_id,
          planTier: planTierToDb(planTier),
        },
      });

      const billingEventId =
        event.type === "subscription.active"
          ? `dodo:activation:${subscription.subscription_id}`
          : `dodo:renewal:${event.data.payment_id ?? ""}`;
      if (event.type === "subscription.renewed" && !event.data.payment_id) {
        throw new Error("Renewal webhook is missing payment_id");
      }

      await this.grantCredits({
        userId: billing.userId,
        amount: getPlanMonthlyCredits(planTier),
        type: CreditTransactionType.SUBSCRIPTION_GRANT,
        description: `${PLANS[planTier].name} subscription credits`,
        billingEventId,
        metadata: {
          planTier,
          source: event.type,
          subscriptionId: subscription.subscription_id,
        },
      });
    } else if (event.type === "subscription.plan_changed") {
      const planTier = planTierForProduct(subscription.product_id);
      if (
        planTier &&
        billing.dodoSubscriptionId === subscription.subscription_id
      ) {
        await prisma.userBilling.update({
          where: { id: billing.id },
          data: { planTier: planTierToDb(planTier) },
        });
      }
    } else if (
      event.type === "subscription.cancelled" ||
      event.type === "subscription.expired" ||
      event.type === "subscription.on_hold" ||
      event.type === "subscription.paused"
    ) {
      if (billing.dodoSubscriptionId === subscription.subscription_id) {
        await prisma.userBilling.update({
          where: { id: billing.id },
          data: {
            dodoSubscriptionId:
              event.type === "subscription.cancelled" ||
              event.type === "subscription.expired"
                ? null
                : subscription.subscription_id,
            planTier: DbPlanTier.FREE,
          },
        });
      }
    }
  }

  static async webhook(rawBody: string, headers: Headers) {
    const webhookId = headers.get("webhook-id");
    const signature = headers.get("webhook-signature");
    const timestamp = headers.get("webhook-timestamp");
    if (
      !webhookId ||
      !signature ||
      !timestamp ||
      !process.env.DODO_PAYMENTS_WEBHOOK_KEY
    ) {
      throw status(400, "Missing Dodo webhook configuration or headers");
    }

    let event: UnwrapWebhookEvent;
    try {
      event = getDodoClient().webhooks.unwrap(rawBody, {
        headers: {
          "webhook-id": webhookId,
          "webhook-signature": signature,
          "webhook-timestamp": timestamp,
        },
      });
    } catch {
      throw status(401, "Invalid Dodo webhook signature");
    }

    await this.handleSubscriptionEvent(event);
    return { received: true };
  }
}
