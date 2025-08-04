import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    return NextResponse.json({
      success: true,
      tasks: tasks.map(task => ({
        taskId: task.taskId,
        youtubeUrl: task.youtubeUrl,
        title: task.title,
        status: task.status,
        progress: task.progress,
        statusMessage: task.statusMessage,
        errorMessage: task.errorMessage,
        clipURL: task.clipURL,
        clipsData: task.clipsData,
        result: task.clipsData ? {
          viral_moments: task.clipsData,
          s3_urls: task.clipURL ? [task.clipURL] : []
        } : null,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
        clipType: task.clipType,
        duration: task.duration,
        multipleClips: task.multipleClips,
        subtitle: task.subtitle,
        aspectRatio: 'original', // Default value since it might not be in DB
        quality: 'HD', // Default value since it might not be in DB
      }))
    });

  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
