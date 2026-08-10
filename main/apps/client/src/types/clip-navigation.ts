import type { ClipModel } from "@snipmatic/utils";

export type ClipsPageState = {
  url: string;
  videoInfo: ClipModel["previewResponse"];
  clipRange: [number, number];
  subtitles: boolean;
};
