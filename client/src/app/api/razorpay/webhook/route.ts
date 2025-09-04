import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  try {
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (signature !== generatedSignature) {
      console.error("Invalid Razorpay signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    const payment = payload?.payload?.payment?.entity;
    const notes = payment?.notes || {};

    switch (event) {
      case "payment.captured": {
        if (!notes.userEmail || !notes.userId) {
          console.error("Missing user information in payment notes");
          return NextResponse.json({ received: true });
        }

        const userId = notes.userId;
        const credits = parseInt(notes.credits) || 0;
        const priceInDollars = parseFloat(notes.price) || 0;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          console.error(`User not found: ${userId}`);
          return NextResponse.json({ received: true });
        }

        if (credits > 0) {
          await prisma.$transaction(async (txn) => {
            await txn.user.update({
              where: { id: userId },
              data: { credits: { increment: credits } },
            });

            await txn.creditPackage.create({
              data: {
                userId,
                packageType: `CUSTOM_${credits}`,
                credits,
                amount: Math.round(priceInDollars * 100),
                currency: payment.currency.toUpperCase(),
                status: "COMPLETED",
                paymentMethod: payment.method || "card",
                paymentId: payment.id,
                description: `${credits.toLocaleString()} credits package`,
              },
            });

            await txn.transaction.create({
              data: {
                userId,
                amount: priceInDollars,
                status: "COMPLETED",
                currency: payment.currency.toUpperCase(),
                description: `Credit package purchase - ${credits.toLocaleString()} credits`,
              },
            });
          });

          console.log("Payment captured and credits added:", {
            userId,
            credits,
          });
        }

        break;
      }

      case "payment.failed": {
        console.error("Payment failed:", {
          paymentId: payment?.id,
          userId: notes.userId,
          userEmail: notes.userEmail,
          amount: notes.price,
          credits: notes.credits,
          reason: payment?.error_description || "Unknown error",
        });

        if (notes.userId) {
          await prisma.transaction.create({
            data: {
              userId: notes.userId,
              amount: parseFloat(notes.price) || 0,
              status: "FAILED",
              currency: payment?.currency?.toUpperCase() || "INR",
              description: `Credit package purchase failed - ${
                notes.credits || 0
              } credits`,
            },
          });
        }

        break;
      }

      default: {
        console.log("Unhandled webhook event:", event);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook processing error:", error);
    return NextResponse.json({ received: true });
  }
}
