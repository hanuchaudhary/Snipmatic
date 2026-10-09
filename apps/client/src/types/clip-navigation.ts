import type {
  AspectRatioId,
  ClipConfiguration,
  ClipMode,
  PreviewModel,
} from "@snipmatic/utils";

export type ClipsPageState = {
  source: "youtube" | "upload";
  url?: string;
  sourceKey?: string;
  previewUrl?: string;
  videoInfo: PreviewModel["response"];
  clipRange: [number, number];
  subtitles: boolean;
  clipMode: ClipMode;
  aspectRatio: AspectRatioId;
  subtitleTemplateId?: string;
};

export type ClipConfigState = Pick<
  ClipsPageState,
  "clipMode" | "aspectRatio" | "subtitleTemplateId"
>;

export const clipConfigFromState = (
  state: Partial<ClipConfigState> | null | undefined
): ClipConfiguration => ({
  clipMode: state?.clipMode ?? "AI",
  aspectRatio: state?.aspectRatio ?? "9:16",
  subtitleStyleKey: state?.subtitleTemplateId,
});
