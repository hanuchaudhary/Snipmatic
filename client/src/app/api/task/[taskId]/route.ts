import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { EMAIL_SERVER_URL } from "../../../../../config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const task = await prisma.task.findFirst({
      where: {
        taskId,
        userId: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      task: {
        taskId: task.taskId,
        status: task.status,
        progress: task.progress,
        statusMessage: task.statusMessage,
        errorMessage: task.errorMessage,
        clipURL: task.clipURL,
        clipsData: task.clipsData,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { youtubeUrl, videoInfo, creditsToDeduct } = body;

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

    if (!creditsToDeduct || creditsToDeduct <= 0) {
      return NextResponse.json(
        { error: "Credits to deduct is required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      });

      if (!user || user.credits < creditsToDeduct) {
        throw new Error("Insufficient credits");
      }

      const task = await tx.task.create({
        data: {
          taskId,
          userId: session.user.id,
          youtubeUrl,
          title: videoInfo.title || "Untitled Clip",
          status: "QUEUED",
          progress: 0,
          thumbnailUrl: videoInfo.thumbnail || "",
          statusMessage: "Task initialized",
          clipType: videoInfo.clipType,
          duration: videoInfo.duration,
          multipleClips: videoInfo.multipleClips,
          subtitle: videoInfo.subtitle,
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            decrement: creditsToDeduct,
          },
        },
      });

      await tx.creditUsage.create({
        data: {
          userId: session.user.id,
          taskId: taskId,
          creditsUsed: creditsToDeduct,
          actionType: `${videoInfo.clipType}_CLIP${
            videoInfo.multipleClips ? "_MULTIPLE" : ""
          }${videoInfo.subtitle ? "_SUBTITLE" : ""}`,
          description: `Credits used for ${videoInfo.clipType} clip${
            videoInfo.multipleClips ? " (multiple)" : ""
          }${videoInfo.subtitle ? " with subtitles" : ""}`,
        },
      });

      return task;
    });

    try {
      await axios.post(`${EMAIL_SERVER_URL}/set_task`, {
        email: session.user.email,
        task_id: taskId,
      });
    } catch (emailError) {
      console.warn("Failed to notify email server:", emailError);
    }

    console.log(
      `Task created with ID: ${result.taskId} for user: ${session.user.id}, credits deducted: ${creditsToDeduct}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task: {
          taskId: result.taskId,
          status: result.status,
          progress: result.progress,
          statusMessage: result.statusMessage,
          thumbnailUrl: result.thumbnailUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);

    if (error instanceof Error && error.message === "Insufficient credits") {
      return NextResponse.json(
        { error: "Insufficient credits to create this task" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      status,
      progress,
      statusMessage,
      errorMessage,
      clipURL,
      clipsData,
      completedAt,
    } = body;

    // Verify the task belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: {
        taskId,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { taskId },
      data: {
        status,
        progress,
        statusMessage,
        errorMessage: errorMessage || "",
        clipURL: clipURL || "",
        completedAt: ["COMPLETED", "FAILED"].includes(status)
          ? new Date(completedAt || new Date())
          : null,
        clipsData: clipsData || null,
        ...(body.thumbnailUrl !== undefined && {
          thumbnailUrl: body.thumbnailUrl,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task: {
        taskId: updatedTask.taskId,
        status: updatedTask.status,
        progress: updatedTask.progress,
        statusMessage: updatedTask.statusMessage,
        errorMessage: updatedTask.errorMessage,
        thumbnailUrl: updatedTask.thumbnailUrl,
      },
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
