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
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const payment = payload.payload.payment.entity;
    const notes = payment.notes || {};

    if (!notes.userEmail || !notes.userId) {
      console.error("Missing user information in payment notes");
      return NextResponse.json(
        { error: "Missing user information" },
        { status: 400 }
      );
    }

    const userEmail = notes.userEmail;
    const userId = notes.userId;
    const credits = parseInt(notes.credits) || 0;
    const priceInDollars = parseFloat(notes.price) || 0;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error(`User not found: ${userId}`);
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    switch (payload.event) {
      case "payment.captured":
        if (credits > 0) {
          const result = await prisma.$transaction(async (txn) => {
            await txn.user.update({
              where: { id: userId },
              data: { credits: { increment: credits } },
            });

            await txn.creditPackage.create({
              data: {
                userId: userId,
                packageType: `CUSTOM_${credits}`,
                credits: credits,
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
                userId: userId,
                amount: priceInDollars,
                status: "COMPLETED",
                currency: payment.currency.toUpperCase(),
                description: `Credit package purchase - ${credits.toLocaleString()} credits`,
              },
            });

            return { success: true };
          });

          console.log("Payment captured - Transaction result:", result);
          return NextResponse.json({ received: true });
        }
        break;

      case "payment.failed":
        console.error("Payment failed:", {
          paymentId: payment.id,
          userId: userId,
          userEmail: userEmail,
          amount: priceInDollars,
          credits: credits,
          reason: payment.error_description || "Unknown error",
        });

        await prisma.transaction.create({
          data: {
            userId: userId,
            amount: priceInDollars,
            status: "FAILED",
            currency: payment.currency.toUpperCase(),
            description: `Credit package purchase failed - ${credits.toLocaleString()} credits`,
          },
        });

        await prisma.creditPackage.create({
          data: {
            userId: userId,
            packageType: `CUSTOM_${credits}`,
            credits: 0,
            amount: Math.round(priceInDollars * 100),
            currency: payment.currency.toUpperCase(),
            status: "FAILED",
            paymentMethod: payment.method || "card",
            paymentId: payment.id,
            description: `Failed credit package purchase - ${credits.toLocaleString()} credits`,
          },
        });

        return NextResponse.json({ received: true });

      default:
        console.log("Unhandled webhook event:", payload.event);
        return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
