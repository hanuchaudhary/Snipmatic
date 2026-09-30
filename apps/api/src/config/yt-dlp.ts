import { PreviewModel } from "@snipmatic/utils";
import { create } from "youtube-dl-exec";

//prod have a path TODO:
const ytdlp = create("/opt/homebrew/bin/yt-dlp");

export const getVideoInfo = async (url: string) => {
  try {
    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      skipDownload: true,
      cookies: process.env.YTDLP_COOKIES,
    });
    const data = {
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      videoLanguage: info.language || "",
      videoQuality: info.format_id, // TODO
    } as PreviewModel["response"];
    console.log("Ytdl inflo:", data);
    return data;
  } catch (error) {
    console.error("Error fetching video info:", error);
    throw new Error("Failed to fetch video info");
  }
};

export const downloadVideo = async (url: string) => {
  try {
    const download = await ytdlp(url, {
      cookiesFromBrowser: "chrome",
      dumpSingleJson: true,
      noWarnings: true,
    } as any);
    return download
  } catch (error) {
    console.error("Error downloading video:", error);
    throw new Error("Failed to download video");
  }
};
