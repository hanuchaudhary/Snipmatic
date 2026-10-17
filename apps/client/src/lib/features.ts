import type { Icon } from "@tabler/icons-react";
import {
  IconBubbleTextFilled,
  IconCameraFilled,
  IconCropPortraitFilled,
  IconFlameFilled,
  IconSparklesFilled,
  IconWorldFilled,
} from "@tabler/icons-react";

export interface FeatureStep {
  title: string;
  description: string;
}

export interface Feature {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: Icon;
  eyebrow: string;
  heading: string;
  headingMuted: string;
  body: string[];
  steps: FeatureStep[];
  highlights: string[];
}

export const FEATURES: Feature[] = [
  {
    slug: "viral-detection",
    title: "Viral Detection",
    tagline: "Find the moments most likely to perform.",
    description:
      "Snipmatic reads your long-form video and surfaces the moments with the strongest hook, payoff and pacing.",
    icon: IconFlameFilled,
    eyebrow: "Viral Detection",
    heading: "Find the moment",
    headingMuted: "before you even press play.",
    body: [
      "Snipmatic watches your full video the way an editor would. It scores every segment on hook strength, emotional payoff, clarity and pacing, then ranks the moments most likely to stop a scroll.",
      "Instead of combing through hours of footage you get a short list of ready-to-cut highlights, each with a reason explaining why it was picked.",
    ],
    steps: [
      {
        title: "Paste a link",
        description:
          "Drop in any YouTube URL. Snipmatic pulls the transcript and audio in the background.",
      },
      {
        title: "Score the moments",
        description:
          "Each segment is analysed for hooks, punchlines and quotable lines, then ranked by potential.",
      },
      {
        title: "Review the shortlist",
        description:
          "See the top moments with confidence scores and jump straight into editing.",
      },
    ],
    highlights: [
      "Automatic hook and payoff scoring",
      "Confidence score for every moment",
      "Works with podcasts, interviews and tutorials",
      "No timeline scrubbing required",
    ],
  },
  {
    slug: "ai-editing",
    title: "AI Editing",
    tagline: "Automatically cut and structure your clips.",
    description:
      "Clips are trimmed, ordered and tightened into self-contained shorts that start on the hook.",
    icon: IconSparklesFilled,
    eyebrow: "AI Editing",
    heading: "Clips that are cut",
    headingMuted: "before you open an editor.",
    body: [
      "Once a moment is chosen, Snipmatic trims the dead air, tightens the pacing and makes sure the clip starts on the strongest line. Every export is a finished short, not a raw cut.",
      "You stay in control: adjust the in and out points, reorder segments or regenerate a clip with a single click.",
    ],
    steps: [
      {
        title: "Pick a highlight",
        description:
          "Choose any moment from the viral detection shortlist or start from scratch.",
      },
      {
        title: "Auto trim and tighten",
        description:
          "Snipmatic removes filler, balances pacing and lands the clip on a natural ending.",
      },
      {
        title: "Fine tune",
        description:
          "Nudge the cut, reorder beats or regenerate until it feels right.",
      },
    ],
    highlights: [
      "Removes silence and filler words",
      "Starts clips on the hook",
      "Consistent pacing across exports",
      "One click regeneration",
    ],
  },
  {
    slug: "smart-captions",
    title: "Smart Captions",
    tagline: "Generate accurate word-level captions.",
    description:
      "Word-level captions are burned in automatically, with styles that make every line easy to read.",
    icon: IconBubbleTextFilled,
    eyebrow: "Smart Captions",
    heading: "Captions that are",
    headingMuted: "already burned in.",
    body: [
      "Snipmatic transcribes your audio and aligns captions word by word, so text lands exactly when it is spoken. No manual timing, no drift.",
      "Choose from a library of caption styles, adjust the accent colour, or highlight key words to keep viewers locked in with the sound off.",
    ],
    steps: [
      {
        title: "Transcribe",
        description:
          "Audio is transcribed and aligned to the exact moment each word is spoken.",
      },
      {
        title: "Style your captions",
        description:
          "Pick a preset, tune the font, colour and position to match your brand.",
      },
      {
        title: "Burn in",
        description:
          "Captions are rendered directly onto the clip ready for any platform.",
      },
    ],
    highlights: [
      "Word-level timing",
      "Highlighted keywords",
      "Brand-ready caption presets",
      "Readable on every screen size",
    ],
  },
  {
    slug: "face-tracking",
    title: "Face Tracking",
    tagline: "Keep speakers and subjects in frame.",
    description:
      "Automatic subject tracking keeps the active speaker centred as they move around the frame.",
    icon: IconCameraFilled,
    eyebrow: "Face Tracking",
    heading: "The speaker stays",
    headingMuted: "in frame, always.",
    body: [
      "When you crop a wide video for a vertical format, the speaker can drift out of frame. Snipmatic tracks faces and moving subjects and keeps the active speaker centred throughout the clip.",
      "Smart cuts follow the person who is talking, so multi-person podcasts stay readable without any manual keyframing.",
    ],
    steps: [
      {
        title: "Detect subjects",
        description:
          "Faces and people are detected across the whole clip automatically.",
      },
      {
        title: "Follow the speaker",
        description:
          "The crop smoothly follows whoever is talking, with natural movement.",
      },
      {
        title: "Review and export",
        description:
          "Check the framing and export a clip that never loses the subject.",
      },
    ],
    highlights: [
      "Automatic face detection",
      "Active speaker following",
      "Smooth, natural panning",
      "Great for interviews and podcasts",
    ],
  },
  {
    slug: "auto-reframe",
    title: "Auto Reframe",
    tagline: "Turn long videos into vertical content.",
    description:
      "One click reframes landscape footage into 9:16, 1:1 or any aspect ratio you need.",
    icon: IconCropPortraitFilled,
    eyebrow: "Auto Reframe",
    heading: "Landscape in,",
    headingMuted: "vertical out.",
    body: [
      "Long-form video is shot for the big screen, but short-form lives in vertical. Auto Reframe recuts your landscape footage into 9:16, 1:1 and 4:5 without awkward crops.",
      "Combined with face tracking and captions, every export is framed for the platform it is going to, straight out of the box.",
    ],
    steps: [
      {
        title: "Choose a ratio",
        description:
          "Select the aspect ratio for Shorts, Reels, TikTok or a square feed.",
      },
      {
        title: "Smart crop",
        description:
          "Snipmatic finds the subject and frames the shot around the action.",
      },
      {
        title: "Export anywhere",
        description:
          "Download ready-to-post files sized for every destination.",
      },
    ],
    highlights: [
      "9:16, 1:1 and 4:5 output",
      "Subject-aware cropping",
      "No letterboxing or black bars",
      "Bulk export in multiple ratios",
    ],
  },
  {
    slug: "multi-platform",
    title: "Multi Platform",
    tagline: "Export for Shorts, Reels and TikTok.",
    description:
      "Every clip is exported in the formats, ratios and lengths each platform prefers.",
    icon: IconWorldFilled,
    eyebrow: "Multi Platform",
    heading: "One clip,",
    headingMuted: "every platform.",
    body: [
      "Every platform has its own preferred ratio, length and file format. Snipmatic exports your clips pre-configured for YouTube Shorts, Instagram Reels, TikTok and more, so nothing gets rejected or cropped by the uploader.",
      "Batch export a single moment into several formats at once and post everywhere from one workflow.",
    ],
    steps: [
      {
        title: "Pick your destinations",
        description: "Select the platforms you want to publish to.",
      },
      {
        title: "Auto format",
        description:
          "Clips are rendered with the right ratio, resolution and length.",
      },
      {
        title: "Download and post",
        description: "Grab every version and publish directly, no re-encoding.",
      },
    ],
    highlights: [
      "Shorts, Reels, TikTok and more",
      "Correct ratio and resolution per platform",
      "Batch export multiple sizes",
      "No re-encoding needed",
    ],
  },
];

export const getFeature = (slug?: string) =>
  FEATURES.find((feature) => feature.slug === slug);
