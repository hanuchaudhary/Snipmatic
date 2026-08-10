import { ClipModel } from "@snipmatic/utils";
import { create } from "youtube-dl-exec";

//prod have a path TODO:
const ytdlp = create("/opt/homebrew/bin/yt-dlp");

export const getVideoInfo = async (url: string) => {
  try {
    const info = await ytdlp(url, {
      cookiesFromBrowser: "chrome", // TODO need to be fixed
      dumpSingleJson: true,
      noWarnings: true,
      skipDownload: true,
    } as any);
    const data = {
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      videoLanguage: info.language || "",
      videoQuality: info.format_id, // TODO
    } as ClipModel["previewResponse"];
    console.log("Ytdl inflo:", data);
    return data;
  } catch (error) {
    console.error("Error fetching video info:", error);
    throw new Error("Failed to fetch video info");
  }
};
