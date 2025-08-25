import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { Payment } from "dodopayments/resources/index.mjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addCredits } from "@/lib/creditMiddleware";

type CreditWebhookPayload = {
  type: string;
  data: Payment;
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
    const payload = JSON.parse(rawBody) as CreditWebhookPayload;

    if (!payload.data?.customer?.email) {
      throw new Error("Missing customer email in payload");
    }

    console.log(`Payload`, payload);

    const userEmail = payload.data.customer.email;
    const metadata = payload.data.metadata || {};

    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: {
        email: userEmail,
        name: payload.data.customer.name || null,
      },
    });

    console.log(`Processing webhook for user: ${userEmail}`);

    const quantity = payload.data.product_cart?.[0]?.quantity || 0;
    const unitPrice = 1; // $1 fixed in Dodo dashboard
    const totalPrice = quantity * unitPrice;

    console.log(
      `Total price for ${userEmail}: $${totalPrice}, Quantity: ${quantity}`
    );

    switch (payload.data.status) {
      case "succeeded":
        const credits = parseInt(metadata.credits as string) || 0;

        if (credits > 0) {
          const creditResult = await addCredits(
            user.id,
            credits,
            `Credit package purchase - ${credits.toLocaleString()} credits`
          );

          console.log("Credit result:", creditResult);

          if (creditResult.success) {
            await prisma.creditPackage.create({
              data: {
                userId: user.id,
                packageType: `CUSTOM_${credits}`,
                credits: credits,
                amount: Math.round(totalPrice * 100), // cents
                currency: payload.data.currency || "usd",
                status: "COMPLETED",
                paymentMethod: (metadata.payment_method as string) || "card",
                paymentId: payload.data.payment_id || null,
                description: `${credits.toLocaleString()} credits package`,
              },
            });

            await prisma.transaction.create({
              data: {
                userId: user.id,
                amount: totalPrice,
                status: "COMPLETED",
                currency: payload.data.currency || "usd",
                description: `Credit package purchase - ${credits.toLocaleString()} credits`,
              },
            });

            console.log(
              `${credits} credits added for ${userEmail}. New balance: ${creditResult.newBalance}`
            );
          } else {
            console.error(
              `Failed to add credits for ${userEmail}: ${creditResult.message}`
            );
          }
        }
        break;

      case "failed":
        await prisma.creditPackage.create({
          data: {
            userId: user.id,
            packageType: `CUSTOM_${parseInt(metadata.credits as string) || 0}`,
            credits: parseInt(metadata.credits as string) || 0,
            amount: Math.round(totalPrice * 100),
            currency: payload.data.currency || "usd",
            status: "FAILED",
            paymentMethod: (metadata.payment_method as string) || "card",
            paymentId: payload.data.payment_id || null,
            description: "Credit package purchase failed",
          },
        });

        await prisma.transaction.create({
          data: {
            userId: user.id,
            amount: totalPrice,
            status: "FAILED",
            currency: payload.data.currency || "usd",
            description: `Credit package purchase failed - ${metadata.credits} credits`,
          },
        });

        console.log(`Credit package purchase failed for ${userEmail}`);
        break;

      default:
        console.log(
          `Unhandled status: ${payload.data.status} for ${userEmail}`
        );
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Credit webhook processing error:", error);
    return NextResponse.json(
      { error: "Credit webhook processing failed" },
      { status: 400 }
    );
  }
}
