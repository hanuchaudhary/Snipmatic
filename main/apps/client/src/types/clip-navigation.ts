import type { AspectRatioId, ClipConfiguration, ClipMode, ClipModel } from "@snipmatic/utils";

export type ClipsPageState = {
  source: "youtube" | "upload";
  url?: string;
  sourceKey?: string;
  previewUrl?: string;
  videoInfo: ClipModel["previewResponse"];
  clipRange: [number, number];
  subtitles: boolean;
  clipMode: ClipMode;
  aspectRatio: AspectRatioId;
  subtitleTemplateId?: string;
  bgMusicTemplateId?: string;
  bgMusicIntensity: number;
  videoTemplateId?: string;
  attachedClipId?: string;
};

export type ClipConfigState = Pick<
  ClipsPageState,
  | "clipMode"
  | "aspectRatio"
  | "subtitleTemplateId"
  | "bgMusicTemplateId"
  | "bgMusicIntensity"
  | "videoTemplateId"
  | "attachedClipId"
>;

export const clipConfigFromState = (
  state: Partial<ClipConfigState> | null | undefined
): ClipConfiguration => ({
  clipMode: state?.clipMode ?? "manual",
  aspectRatio: state?.aspectRatio ?? "9:16",
  subtitleTemplateId: state?.subtitleTemplateId,
  bgMusicTemplateId: state?.bgMusicTemplateId,
  bgMusicIntensity: state?.bgMusicIntensity ?? 15,
  videoTemplateId: state?.videoTemplateId,
  attachedClipId: state?.attachedClipId,
});
