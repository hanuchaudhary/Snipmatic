import { auth } from "@/auth";
import { subscriptionMiddleware } from "@/lib/subscriptionMiddleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blocked = await subscriptionMiddleware(session.user.id);
    if (blocked) {
      return NextResponse.json(
        {
          error: "Subscription limits exceeded",
          message:
            "Please upgrade your subscription to continue using this feature.",
        },
        { status: 403 }
      );
    } else {
      return NextResponse.json(
        { message: "Subscription limits are within bounds" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}
