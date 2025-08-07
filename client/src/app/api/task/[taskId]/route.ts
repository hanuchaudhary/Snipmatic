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
    const { youtubeUrl, videoInfo } = body;

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

    // first entry in the database
    const task = await prisma.task.create({
      data: {
        taskId,
        userId: session.user.id,
        youtubeUrl,
        title: videoInfo.title || "Untitled Clip",
        status: "QUEUED",
        progress: 0,
        thumbnailUrl: videoInfo.thumbnail || "",
        statusMessage: "Task initialized",
        clipType: videoInfo.clipType || "FULL_VIDEO",
        duration: videoInfo.duration || 0,
        multipleClips: videoInfo.multipleClips || false,
        subtitle: videoInfo.subtitle || false,
      },
    });

    // notify the email server about the new task
    await axios.post(`${EMAIL_SERVER_URL}/set_task`, {
      email: session.user.email,
      task_id: taskId,
    });

    console.log(
      `Task created with ID: ${task.taskId} for user: ${session.user.id}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task: {
          taskId: task.taskId,
          status: task.status,
          progress: task.progress,
          statusMessage: task.statusMessage,
          thumbnailUrl: task.thumbnailUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
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
