import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { EMAIL_SERVER_URL } from "@/config/config";

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
          notIn: ["COMPLETED", "FAILED"],
        },
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
        completedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // TODO: send email status to all active task_ids
    let emailPoll = false;
    if (activeTasks.length > 0) {
      try {
        const activeEmailReq = await axios.post(`${EMAIL_SERVER_URL}/active`, {
          email: session.user.email,
          task_id: activeTasks[0].taskId,
        });

        if (activeEmailReq.status == 200) {
          emailPoll = true;
        }
      } catch (emailError) {
        emailPoll = false;
        console.warn("Failed to notify email server:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      emailStatus: emailPoll,
      tasks: activeTasks.map((task) => ({
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
        result: task.clipsData
          ? {
              viral_moments: task.clipsData,
              s3_urls: task.clipURL ? [task.clipURL] : [],
              zip_s3_url: task.clipURL || "",
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching active tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch active tasks" },
      { status: 500 }
    );
  }
}
