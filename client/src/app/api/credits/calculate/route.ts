import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { calculateCreditsRequired, getCreditCosts } from "@/lib/creditMiddleware";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clipType, multipleClips, subtitles } = body;

    if (!clipType || !["AI", "MANUAL"].includes(clipType)) {
      return NextResponse.json(
        { error: "Invalid clipType. Must be 'AI' or 'MANUAL'" },
        { status: 400 }
      );
    }

    const creditRequirement = calculateCreditsRequired(
      clipType,
      multipleClips || false,
      subtitles || false
    );

    const costs = getCreditCosts();

    return NextResponse.json({
      success: true,
      creditRequirement,
      costs,
    });
  } catch (error) {
    console.error("Error calculating credits:", error);
    return NextResponse.json(
      { error: "Failed to calculate credits" },
      { status: 500 }
    );
  }
}
