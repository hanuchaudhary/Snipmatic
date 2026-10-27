import type { Icon } from "@tabler/icons-react";
import {
  IconBubbleTextFilled,
  IconCropPortraitFilled,
  IconFlameFilled,
  IconSparklesFilled,
  IconWorldFilled,
} from "@tabler/icons-react";

export interface Feature {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: Icon;
}

export const FEATURES: Feature[] = [
  {
    slug: "viral-detection",
    title: "Find highlights",
    tagline: "Find the moments people will want to replay.",
    description:
      "Snipmatic reads the full transcript, scores the strongest hooks and ideas, and surfaces complete moments that stand on their own.",
    icon: IconFlameFilled,
  },
  {
    slug: "ai-editing",
    title: "Create short clips",
    tagline: "Shape a clean story, not a random excerpt.",
    description:
      "AI builds each edit around natural sentence boundaries, keeping the hook, context, and payoff together in one watchable clip.",
    icon: IconSparklesFilled,
  },
  {
    slug: "smart-captions",
    title: "Add captions",
    tagline: "Make every word easy to follow.",
    description:
      "Choose a caption style and Snipmatic times every word to the speaker, ready for viewers who watch with the sound off.",
    icon: IconBubbleTextFilled,
  },
  {
    slug: "auto-reframe",
    title: "Choose your format",
    tagline: "Keep the speaker in frame on every screen.",
    description:
      "Smart tracking follows the active speaker while reframing your footage for vertical, square, and landscape placements.",
    icon: IconCropPortraitFilled,
  },
  {
    slug: "multi-platform",
    title: "Publish everywhere",
    tagline: "Send every clip to every channel from one place.",
    description:
      "Review once, tailor the post, and publish to YouTube, Instagram, TikTok, Facebook, and LinkedIn without repeating the upload work.",
    icon: IconWorldFilled,
  },
];

export const getFeature = (slug?: string) =>
  FEATURES.find((feature) => feature.slug === slug);
