import ytdl from "@distube/ytdl-core";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  const cookiesPath = path.join(process.cwd(), "src", "app", "api", "video-info", "cookies.json");
  const agent = ytdl.createAgent(
    JSON.parse(await fs.readFile(cookiesPath, "utf-8"))
  );
  
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    const validate = ytdl.validateURL(url);

    if (!validate) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    const info = await ytdl.getBasicInfo(url,{agent});
    const videoDetails = info.videoDetails;
    const duration = parseInt(videoDetails.lengthSeconds);

    const thumbnails = videoDetails.thumbnails;
    const thumbnail =
      thumbnails && thumbnails.length > 0
        ? thumbnails[thumbnails.length - 1].url
        : undefined;

    const responseData = {
      url: url,
      duration: duration,
      title: videoDetails.title,
      thumbnail: thumbnail,
      message: "Video info fetched successfully",
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.log(`Failed to generate videoInfo: ${error}`);

    if (error instanceof Error) {
      if (error.message.includes("Video unavailable")) {
        return NextResponse.json(
          { error: "Video is unavailable or private" },
          { status: 404 }
        );
      }
      if (error.message.includes("429")) {
        return NextResponse.json(
          { error: "Rate limited. Please try again later." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch video information" },
      { status: 500 }
    );
  }
}
