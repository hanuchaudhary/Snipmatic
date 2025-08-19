import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activeTasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        status: {
          notIn: ['COMPLETED', 'FAILED']
        }
      },
      select: {
        taskId: true,
        status: true,
        progress: true,
        statusMessage: true,
        errorMessage: true,
        clipURL: true,
        clipsData: true,
        updatedAt: true,
        clipType: true,
        title: true,
        youtubeUrl: true,
        thumbnailUrl: true,
        completedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      tasks: activeTasks.map(task => ({
        taskId: task.taskId,
        status: task.status,
        progress: task.progress,
        statusMessage: task.statusMessage,
        errorMessage: task.errorMessage,
        clipURL: task.clipURL,
        clipsData: task.clipsData,
        updatedAt: task.updatedAt,
        title: task.title,
        youtubeUrl: task.youtubeUrl,
        clipType: task.clipType,
        thumbnailUrl: task.thumbnailUrl,
        completedAt: task.completedAt,
        result: task.clipsData ? {
          viral_moments: task.clipsData,
          s3_urls: task.clipURL ? [task.clipURL] : [],
          zip_s3_url: task.clipURL || ""
        } : null
      }))
    });

  } catch (error) {
    console.error("Error fetching active tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch active tasks" },
      { status: 500 }
    );
  }
}
