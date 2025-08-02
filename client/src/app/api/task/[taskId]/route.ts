import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { taskQueue } from "@/lib/redis";
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
    const { youtubeUrl, title } = body;

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

    const [task] = await Promise.all([
      // new task in the database
      prisma.task.create({
        data: {
          taskId,
          userId: session.user.id,
          youtubeUrl,
          title: title || "Untitled Clip",
          status: "PENDING",
          progress: 0,
          statusMessage: "Task initialized",
        },
      }),

      // add job to the task queue
      taskQueue.add("task-status", {
        taskId,
        userId: session.user.id,
      }),

      // notify the email server about the new task
      axios.post(`${EMAIL_SERVER_URL}/set_task`, {
        email: session.user.email,
        task_id: taskId,
      }),
    ]);

    console.log(`Task created with ID: ${task.taskId} for user: ${session.user.id}`);

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task: {
          taskId: task.taskId,
          status: task.status,
          progress: task.progress,
          statusMessage: task.statusMessage,
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
