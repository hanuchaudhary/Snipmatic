import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserCredits } from "@/lib/creditMiddleware";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credits = await getUserCredits(session.user.id);

    return NextResponse.json({
      success: true,
      credits,
    });
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
