export * from "./subtitle.constants";

export const TEMPLATE_MEDIA_TYPES = ["subtitle", "audio", "video"] as const;

export type TemplateMediaType = (typeof TEMPLATE_MEDIA_TYPES)[number];

export type ClipTemplate = {
  name: string;
  key: string;
  mediaType: TemplateMediaType;
  previewUrl: string;
};
