import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all tasks with completed status and youtube URLs
    const tasks = await prisma.task.findMany({
      where: {
        status: "COMPLETED",
      },
      select: {
        youtubeUrl: true,
        title: true,
        thumbnailUrl: true,
        createdAt: true,
      },
    });

    // Count occurrences of each YouTube URL
    const urlCounts = new Map<
      string,
      {
        count: number;
        title: string;
        thumbnailUrl: string | null;
        latestDate: Date;
      }
    >();

    tasks.forEach((task) => {
      const url = task.youtubeUrl;
      if (url && !url.includes("s3.amazonaws.com") && !url.includes("cloudfront")) {
        const existing = urlCounts.get(url);
        if (existing) {
          urlCounts.set(url, {
            count: existing.count + 1,
            title: task.title || existing.title,
            thumbnailUrl: task.thumbnailUrl || existing.thumbnailUrl,
            latestDate:
              task.createdAt > existing.latestDate
                ? task.createdAt
                : existing.latestDate,
          });
        } else {
          urlCounts.set(url, {
            count: 1,
            title: task.title || "Untitled Video",
            thumbnailUrl: task.thumbnailUrl,
            latestDate: task.createdAt,
          });
        }
      }
    });

    // Convert to array and sort by count
    const sortedUrls = Array.from(urlCounts.entries())
      .map(([url, data]) => ({
        youtubeUrl: url,
        title: data.title,
        thumbnailUrl: data.thumbnailUrl,
        count: data.count,
        latestDate: data.latestDate,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Get top 5

    return NextResponse.json({
      success: true,
      leaderboard: sortedUrls,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
