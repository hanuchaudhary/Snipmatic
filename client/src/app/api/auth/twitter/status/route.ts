import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ isConnected: false });
  }

  const userAcc = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "twitter",
    },
  });

  const isConnected = !!userAcc;
  return NextResponse.json({ isConnected });
}
