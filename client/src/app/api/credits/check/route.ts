import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { creditMiddleware } from "@/lib/creditMiddleware";

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

    const result = await creditMiddleware(
      session.user.id,
      clipType,
      multipleClips || false,
      subtitles || false
    );

    if (!result.canProceed) {
      return NextResponse.json(
        {
          error: result.message,
          canProceed: false,
          creditsRequired: result.creditsRequired,
          currentCredits: result.currentCredits,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      canProceed: true,
      creditsRequired: result.creditsRequired,
      currentCredits: result.currentCredits,
    });
  } catch (error) {
    console.error("Error checking credits:", error);
    return NextResponse.json(
      { error: "Failed to check credits" },
      { status: 500 }
    );
  }
}
