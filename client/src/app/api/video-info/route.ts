import ytdl from "ytdl-core";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    // Validate if it's a valid YouTube URL
    if (!ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Get video info using ytdl-core
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;

    // Parse duration from seconds to total seconds
    const duration = parseInt(videoDetails.lengthSeconds);

    // Get the best quality thumbnail
    const thumbnails = videoDetails.thumbnails;
    const thumbnail = thumbnails && thumbnails.length > 0 
      ? thumbnails[thumbnails.length - 1].url // Get highest quality thumbnail
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
    console.error("Error fetching video info:", error);
    
    // Handle specific ytdl errors
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