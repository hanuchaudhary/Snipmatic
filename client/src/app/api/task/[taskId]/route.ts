import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redisClient } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const subscriber = redisClient.duplicate();
    // await subscriber.connect();
    const encoder = new TextEncoder();

    const { taskId } = await params;

    const customReadable = new ReadableStream({
      start(controller) {
        subscriber.subscribe(`status:${taskId}`, (message) => {
          console.log(`Received update for task ${taskId}:`, message);
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
        });
      },
    });

    return new Response(customReadable, {
      headers: {
        Connection: "keep-alive",
        "Content-Encoding": "none",
        "Cache-Control": "no-cache, no-transform",
        "Content-Type": "text/event-stream; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error fetching video job:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
