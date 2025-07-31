import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { Payment, Subscription } from "dodopayments/resources/index.mjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type WebhookPayload = {
  type: string;
  data: Payment | Subscription;
};

const webhook = new Webhook(process.env.DODO_WEBHOOK_KEY!);

export async function POST(request: Request) {
  const headersList = await headers();
  const rawBody = await request.text();

  try {
    const webhookHeaders = {
      "webhook-id": headersList.get("webhook-id") || "",
      "webhook-signature": headersList.get("webhook-signature") || "",
      "webhook-timestamp": headersList.get("webhook-timestamp") || "",
    };

    await webhook.verify(rawBody, webhookHeaders);
    const payload = JSON.parse(rawBody) as WebhookPayload;

    if (!payload.data?.customer?.email) {
      throw new Error("Missing customer email in payload");
    }

    const userEmail = payload.data.customer.email;
    const userId = payload.data.customer.customer_id!;

    // First, find or create the user
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: {
        email: userEmail,
        name: payload.data.customer.name || null,
      },
    });

    switch (payload.data.status) {
      case "active":
        await prisma.$transaction(async (tx) => {
          await tx.subscription.upsert({
            where: { userId: user.id },
            update: {
              status: "ACTIVE",
              // 4.99 dollars in cents
              amount: 499,
              currency: payload.data.currency || "usd",
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
            create: {
              userId: user.id,
              status: "ACTIVE",
              amount: 499,
              currency: payload.data.currency || "usd",
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
          await tx.transaction.create({
            data: {
              userId: user.id,
              amount: 499,
              currency: payload.data.currency || "usd",
              status: "COMPLETED",
              paymentMethod: payload.data.metadata?.payment_method || "card",
              paymentId: payload.data.subscription_id || null,
              description: "Subscription activation",
            },
          });
        });
        console.log(`Subscription activated for user: ${userEmail}`);
        break;

      case "expired":
        await prisma.subscription.updateMany({
          where: { userId: user.id },
          data: { status: "INACTIVE" },
        });
        console.log(`Subscription expired for user: ${userEmail}`);
        break;

      case "failed":
        await prisma.transaction.create({
          data: {
            userId: user.id,
            amount: 0,
            currency: payload.data.currency || "usd",
            status: "FAILED",
            paymentMethod: payload.data.metadata?.payment_method || "card",
            paymentId: payload.data.subscription_id || null,
            description: "Payment failed",
          },
        });
        console.log(`Payment failed for user: ${userEmail}`);
        break;

      case "cancelled":
        await prisma.subscription.updateMany({
          where: { userId: user.id },
          data: {
            status: "CANCELLED",
            cancelAtPeriodEnd: true,
          },
        });
        console.log(`Subscription cancelled for user: ${userEmail}`);
        break;

      case "succeeded":
        await prisma.transaction.create({
          data: {
            userId: user.id,
            amount: 499,
            currency: payload.data.currency || "usd",
            status: "COMPLETED",
            paymentMethod: payload.data.metadata?.payment_method || "card",
            paymentId: payload.data.subscription_id || null,
            description: "Payment succeeded",
          },
        });
        console.log(`Payment succeeded for user: ${userEmail}`);
        break;

      default:
        console.log(
          `Unhandled status: ${payload.data.status} for user: ${userEmail}`
        );
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
