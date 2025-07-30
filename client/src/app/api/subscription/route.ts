import { auth } from "@/auth";
import { subscriptionSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";

const dodoClient = new DodoPayments({
  bearerToken: process.env["DODO_API_KEY"],
});

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { data: subscriptionData, error } =
      subscriptionSchema.safeParse(body);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.errors[0].message,
      });
    }

    const response = await fetch(
      `https://test.dodopayments.com/subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DODO_API_KEY}`,
        },
        body: JSON.stringify({
          billing: {
            city: subscriptionData.city,
            country: subscriptionData.country,
            state: subscriptionData.state,
            street: subscriptionData.street,
            zipcode: parseInt(subscriptionData.zipcode),
          },
          customer: {
            email: session.user.email || undefined,
            name: `${session.user.name || session.user.email?.split("@")[0]}`,
          },
          payment_link: true,
          product_id: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID,
          quantity: 1,
          return_url:
            process.env.NEXT_PUBLIC_RETURN_URL ||
            `${process.env.NEXTAUTH_URL}/subscription/success`,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { error: "Payment link creation failed", details: errorData },
        { status: response.status }
      );
    }

    const paymentData = await response.json();
    return NextResponse.json({ paymentLink: paymentData.payment_link });
  } catch (err) {
    console.error("Payment error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
