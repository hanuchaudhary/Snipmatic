import type { ClipModel } from "@snipmatic/utils";

export type ClipsPageState = {
  source: "youtube" | "upload";
  url?: string;
  sourceKey?: string;
  previewUrl?: string;
  videoInfo: ClipModel["previewResponse"];
  clipRange: [number, number];
  subtitles: boolean;
};
