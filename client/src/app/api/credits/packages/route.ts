import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import DodoPayments from "dodopayments";
import { CountryCode } from "dodopayments/resources/misc.mjs";
import { creditPackageSchema } from "@/lib/validation";
import { CREDIT_PACKAGES } from "@/lib/creditMiddleware";

const dodoClient = new DodoPayments({
  bearerToken: process.env["DODO_API_KEY"],
  environment: "test_mode",
});

export interface CreditPackageOption {
  credits: number;
  price: number; // in dollars
}

const calculatePrice = (credits: number): number => {
  const packageData = CREDIT_PACKAGES.find((pkg) => credits <= pkg.credits);
  if (packageData) {
    return packageData.price;
  }
  const basePricePerCredit = 0.055; // 5.5 cents per credit for bulk
  return Math.round(credits * basePricePerCredit);
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

  // console.log({
  //   api: process.env.DODO_API_KEY,
  //   productId: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID,
  // });
  if (!process.env.DODO_API_KEY || !process.env.NEXT_PUBLIC_DODO_PRODUCT_ID) {
    console.error("Missing DODO_API_KEY in server environment");

    return NextResponse.json(
      { error: "Server misconfiguration: missing DODO_API_KEY" },
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

    const price = calculatePrice(packageData.credits);

    if (packageData.credits >= 100000) {
      return NextResponse.json(
        { error: "Please contact us for enterprise pricing for 100k+ credits" },
        { status: 400 }
      );
    }

    // console.log({
    //   credits: packageData.credits,
    //   price,
    //   userId: session.user.id,
    //   body,
    // });

    const payment = await dodoClient.payments.create({
      billing: {
        city: packageData.city,
        country: packageData.country as CountryCode,
        state: packageData.state,
        street: packageData.street,
        zipcode: packageData.zipcode as string,
      },
      customer: {
        create_new_customer: true,
        email: session.user.email!,
        name: `${session.user.name || session.user.email?.split("@")[0]}`,
      },
      product_cart: [
        {
          product_id: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID!,
          quantity: price
        },
      ],
      payment_link: true,
      billing_currency: "USD",
      return_url:
        process.env.NEXT_PUBLIC_RETURN_URL ||
        `${process.env.NEXTAUTH_URL}/credits/status`,
        metadata: {
          type: "credit_package",
          credits: packageData.credits.toString(),
          price: price.toString(),
          userId: session.user.id,
        },
    });

    console.log(payment);

    if (!payment) {
      return NextResponse.json({ error: "Payment link creation failed" });
    }

    return NextResponse.json({
      success: true,
      paymentLink: payment.payment_link,
      package: {
        credits: packageData.credits,
        price: price,
        description: `${packageData.credits.toLocaleString()} Credits`,
      },
    });
  } catch (err: any) {
    console.error("Credit package purchase error:", err?.response?.data || err);

    if (err?.statusCode === 401) {
      return NextResponse.json(
        { error: "Invalid or unauthorized DODO_API_KEY" },
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
