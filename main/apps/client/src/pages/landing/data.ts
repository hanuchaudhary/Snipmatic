import { ZapIcon, TrophyIcon, BarChart3Icon } from "lucide-react";

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export const FEATURES = [
  {
    icon: ZapIcon,
    title: "Instant quizzes",
    description:
      "Spin up a live quiz in seconds. Share a code, watch players join, start. No friction, pure focus.",
    accent: "#2979FF",
  },
  {
    icon: TrophyIcon,
    title: "Real-time competition",
    description:
      "Leaderboards update live as answers come in. Every second counts. Feel the pressure.",
    accent: "#FF6D00",
  },
  {
    icon: BarChart3Icon,
    title: "Deep analytics",
    description:
      "See where every player struggled. Identify knowledge gaps. Improve with each session.",
    accent: "#00E676",
  },
];

export const STATS = [
  { value: "10K+", label: "Active players" },
  { value: "50K+", label: "Quizzes created" },
  { value: "2M+", label: "Questions answered" },
  { value: "99.9%", label: "Uptime" },
];

export const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For solo explorers and students.",
    features: ["5 quizzes/month", "Up to 20 players", "Basic analytics", "Community support"],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For educators and power users.",
    features: [
      "Unlimited quizzes",
      "Up to 200 players",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "per month",
    description: "For organizations and large groups.",
    features: [
      "Everything in Pro",
      "Unlimited players",
      "SSO & admin tools",
      "Dedicated support",
      "API access",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];
