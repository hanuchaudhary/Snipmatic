export const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9", width: 16, height: 9 },
  { id: "9:16", label: "9:16", width: 9, height: 16 },
  { id: "1:1", label: "1:1", width: 1, height: 1 },
  { id: "4:5", label: "4:5", width: 4, height: 5 },
] as const;

export type AspectRatioId = (typeof ASPECT_RATIOS)[number]["id"];

export const CLIP_MODES = ["manual", "ai"] as const;

export type ClipMode = (typeof CLIP_MODES)[number];

export const TEMPLATE_MEDIA_TYPES = ["subtitle", "audio", "video"] as const;

export type TemplateMediaType = (typeof TEMPLATE_MEDIA_TYPES)[number];

export type ClipTemplate = {
  id: string;
  name: string;
  mediaType: TemplateMediaType;
  previewUrl: string;
  description?: string;
};

export const BGM_RECOMMENDED_INTENSITY = 100;

export const SUBTITLE_TEMPLATES: ClipTemplate[] = [
  {
    id: "subtitle-bold",
    name: "Bold",
    mediaType: "subtitle",
    previewUrl: "/subtitle/subtitle1.png",
    description: "High-contrast bold captions",
  },
  {
    id: "subtitle-minimal",
    name: "Minimal",
    mediaType: "subtitle",
    previewUrl: "/subtitle/subtitle1.png",
    description: "Clean lower-third style",
  },
  {
    id: "subtitle-boxed",
    name: "Boxed",
    mediaType: "subtitle",
    previewUrl: "/subtitle/subtitle1.png",
    description: "Rounded background box",
  },
  {
    id: "subtitle-karaoke",
    name: "Karaoke",
    mediaType: "subtitle",
    previewUrl: "/subtitle/subtitle1.png",
    description: "Word-by-word highlight",
  },
];

export const BGM_TEMPLATES: ClipTemplate[] = [
  {
    id: "bgm-lofi",
    name: "Lo-Fi Beats",
    mediaType: "audio",
    previewUrl: "/audio/mock.mp3",
    description: "Soft background groove",
  },
  {
    id: "bgm-upbeat",
    name: "Upbeat Pop",
    mediaType: "audio",
    previewUrl: "/audio/mock.mp3",
    description: "Energetic short-form vibe",
  },
  {
    id: "bgm-cinematic",
    name: "Cinematic",
    mediaType: "audio",
    previewUrl: "/audio/mock.mp3",
    description: "Light dramatic underscore",
  },
  {
    id: "bgm-ambient",
    name: "Ambient",
    mediaType: "audio",
    previewUrl: "/audio/mock.mp3",
    description: "Calm atmospheric bed",
  },
];

export const VIDEO_LAYOUT_TEMPLATES: ClipTemplate[] = [
  {
    id: "video-attach-top",
    name: "Clip on Top",
    mediaType: "video",
    previewUrl: "/placeholder.png",
    description: "Main video on top half",
  },
  {
    id: "video-attach-bottom",
    name: "Clip on Bottom",
    mediaType: "video",
    previewUrl: "/placeholder.png",
    description: "Main video on bottom half",
  },
];

export type AttachClip = {
  id: string;
  name: string;
  previewUrl: string;
};

export const MOCK_ATTACH_CLIPS: AttachClip[] = [
  {
    id: "attach-minecraft",
    name: "Minecraft",
    previewUrl: "/placeholder.png",
  },
  {
    id: "attach-subway",
    name: "Subway Surfers",
    previewUrl: "/placeholder.png",
  },
  {
    id: "attach-gta",
    name: "GTA V",
    previewUrl: "/placeholder.png",
  },
  {
    id: "attach-satisfying",
    name: "Satisfying",
    previewUrl: "/placeholder.png",
  },
];

export type ClipConfiguration = {
  clipMode: ClipMode;
  aspectRatio: AspectRatioId;
  subtitleTemplateId?: string;
  bgMusicTemplateId?: string;
  bgMusicIntensity: number;
  videoTemplateId?: string;
  attachedClipId?: string;
};

export const DEFAULT_CLIP_CONFIGURATION: ClipConfiguration = {
  clipMode: "manual",
  aspectRatio: "9:16",
  bgMusicIntensity: BGM_RECOMMENDED_INTENSITY,
};

export const getAspectRatio = (id: AspectRatioId) => {
  return ASPECT_RATIOS.find((ratio) => ratio.id === id) ?? ASPECT_RATIOS[1];
};

export const getTemplateById = (id: string | undefined) => {
  if (!id) {
    return undefined;
  }

  return [...SUBTITLE_TEMPLATES, ...BGM_TEMPLATES, ...VIDEO_LAYOUT_TEMPLATES].find(
    (template) => template.id === id
  );
};

export const getAttachClipById = (id: string | undefined) => {
  if (!id) {
    return undefined;
  }

  return MOCK_ATTACH_CLIPS.find((clip) => clip.id === id);
};
