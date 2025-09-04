import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import Razorpay from "razorpay";
import { creditPackageSchema } from "@/lib/validation";
import { CREDIT_PACKAGES, calculatePackagePrice, Currency } from "@/lib/constants";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface CreditPackageOption {
  credits: number;
  price: number;
}

const calculatePrice = (credits: number, currency: string = "INR"): number => {
  return calculatePackagePrice(credits, currency as Currency);
};

export async function GET() {
  return NextResponse.json({
    success: true,
    packages: CREDIT_PACKAGES,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("Missing Razorpay credentials in server environment");

    return NextResponse.json(
      { error: "Server misconfiguration: missing Razorpay credentials" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { data: packageData, error } = creditPackageSchema.safeParse(body);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.errors[0].message,
      });
    }

    const currency = body.currency || "INR";
    const price = calculatePrice(packageData.credits, currency);

    if (packageData.credits >= 100000) {
      return NextResponse.json(
        { error: "Please contact us for enterprise pricing for 100k+ credits" },
        { status: 400 }
      );
    }

    const amountInSmallestUnit = Math.round(price * 100);
    const timestamp = Date.now().toString();
    const shortReceipt = `cr_${timestamp.slice(-10)}`;

    const order = await razorpay.orders.create({
      amount: amountInSmallestUnit,
      currency: currency,
      receipt: shortReceipt,
      notes: {
        type: "credit_package",
        credits: packageData.credits.toString(),
        price: price.toString(),
        currency: currency,
        userId: session.user.id,
        userEmail: session.user.email!,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order creation failed" });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      package: {
        credits: packageData.credits,
        price: price,
        description: `${packageData.credits.toLocaleString()} Credits`,
      },
    });
  } catch (err: any) {
    console.error("Credit package purchase error:", err?.response?.data || err);

    if (err?.error?.code === "BAD_REQUEST_ERROR") {
      return NextResponse.json(
        { error: "Invalid Razorpay credentials" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
