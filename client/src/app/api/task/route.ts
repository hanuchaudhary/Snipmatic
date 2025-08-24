import axios from "axios";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { creditMiddleware } from "@/lib/creditMiddleware";
import { EMAIL_SERVER_URL, MAIN_SERVER_URL } from "@/config/config";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      tasks: tasks.map((task) => ({
        taskId: task.taskId,
        youtubeUrl: task.youtubeUrl,
        title: task.title,
        status: task.status,
        progress: task.progress,
        statusMessage: task.statusMessage,
        errorMessage: task.errorMessage,
        clipURL: task.clipURL,
        clipsData: task.clipsData,
        result: task.clipsData
          ? {
              viral_moments: task.clipsData,
              s3_urls: task.clipURL ? [task.clipURL] : [],
            }
          : null,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
        clipType: task.clipType,
        thumbnailUrl: task.thumbnailUrl,
        duration: task.duration,
        multipleClips: task.multipleClips,
        subtitle: task.subtitle,
        aspectRatio: "original",
        quality: "HD",
      })),
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      url,
      startTime,
      endTime,
      aspectRatio,
      subtitles,
      clipType,
      multipleClips,
      duration,
      title,
      thumbnail,
    } = body;

    console.log("Received request to create clip:", {
      url,
      startTime,
      endTime,
      aspectRatio,
      subtitles,
      clipType,
      multipleClips,
      duration,
      title,
      thumbnail,
    });

    if (!url) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

    if (!clipType || !["AI", "MANUAL"].includes(clipType)) {
      return NextResponse.json(
        { error: "Invalid clipType. Must be 'AI' or 'MANUAL'" },
        { status: 400 }
      );
    }

    const creditCheck = await creditMiddleware(
      session.user.id,
      clipType,
      multipleClips || false,
      subtitles || false
    );

    if (!creditCheck.canProceed) {
      return NextResponse.json(
        {
          error: creditCheck.message,
          creditsRequired: creditCheck.creditsRequired,
          currentCredits: creditCheck.currentCredits,
        },
        { status: 403 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      });

      const creditsRequired = creditCheck.creditsRequired || 0;

      if (!user || user.credits < creditsRequired) {
        throw new Error("Insufficient credits");
      }

      const task = await tx.task.create({
        data: {
          userId: session.user.id,
          youtubeUrl: url,
          title: title || "Untitled Clip",
          status: "QUEUED",
          progress: 0,
          thumbnailUrl: thumbnail || "",
          statusMessage: "Task initialized",
          clipType,
          duration: duration || 0,
          multipleClips: multipleClips || false,
          subtitle: subtitles || false,
        },
      });

      const response = await axios.post(
        `${MAIN_SERVER_URL}/clip`,
        {
          url,
          startTime,
          endTime,
          aspectRatio,
          subtitles,
          clipType,
          multipleClips,
          user_id: session.user.id,
          duration,
          task_id: task.taskId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        console.error("Error from main server:", response.data);
        throw new Error("Failed to create clip on main server");
      }

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            decrement: creditsRequired,
          },
        },
      });

      await tx.creditUsage.create({
        data: {
          userId: session.user.id,
          taskId: task.taskId,
          creditsUsed: creditsRequired,
          actionType: `${clipType}_CLIP${multipleClips ? "_MULTIPLE" : ""}${
            subtitles ? "_SUBTITLE" : ""
          }`,
          description: `Credits used for ${clipType} clip${
            multipleClips ? " (multiple)" : ""
          }${subtitles ? " with subtitles" : ""}`,
        },
      });

      await axios.post(`${EMAIL_SERVER_URL}/set_task`, {
        email: session.user.email,
        task_id: task.taskId,
      });

      return task;
    });

    console.log(
      `Task created with ID: ${result.taskId} for user: ${
        session.user.id
      }, credits deducted: ${creditCheck.creditsRequired || 0}`
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
