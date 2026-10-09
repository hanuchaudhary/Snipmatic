import { SUBTITLE_STYLES } from "../constants/subtitle.constants";

export const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9", width: 16, height: 9 },
  { id: "9:16", label: "9:16", width: 9, height: 16 },
  { id: "1:1", label: "1:1", width: 1, height: 1 },
  { id: "4:5", label: "4:5", width: 4, height: 5 },
] as const;

export type AspectRatioId = (typeof ASPECT_RATIOS)[number]["id"];

export const CLIP_MODES = ["MANUAL", "AI"] as const;

export type ClipMode = (typeof CLIP_MODES)[number];

export type ClipConfiguration = {
  clipMode: ClipMode;
  aspectRatio: AspectRatioId;
  subtitleStyleKey?: string;
};

export const DEFAULT_CLIP_CONFIGURATION: ClipConfiguration = {
  clipMode: "AI",
  aspectRatio: "9:16",
};

export const getAspectRatio = (id: AspectRatioId) => {
  return ASPECT_RATIOS.find((ratio) => ratio.id === id) ?? ASPECT_RATIOS[0];
};

export const getTemplateById = (id: string | undefined) => {
  if (!id) {
    return undefined;
  }

  return [...SUBTITLE_STYLES].find((template) => template.name === id);
};
