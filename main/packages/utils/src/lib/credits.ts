export const PLAN_TIERS = ["starter", "influencer", "studio"] as const;

export type PlanTier = (typeof PLAN_TIERS)[number];

export const PLANS = {
  starter: {
    name: "Starter",
    monthlyCredits: 100,
    price: 19,
    features: [
      "100 credits per month",
      "Up to 100 minutes of processing",
      "Basic clip generation",
      "Email support",
    ],
    highlighted: false,
  },
  influencer: {
    name: "Influencer",
    monthlyCredits: 500,
    price: 49,
    features: [
      "500 credits per month",
      "Up to 500 minutes of processing",
      "Subtitles support",
      "Template access",
      "Priority processing",
    ],
    highlighted: true,
  },
  studio: {
    name: "Studio",
    monthlyCredits: 2000,
    price: 149,
    features: [
      "2,000 credits per month",
      "Up to 2,000 minutes of processing",
      "All templates",
      "Subtitles support",
      "Priority support",
      "Team-ready workflows",
    ],
    highlighted: false,
  },
} as const satisfies Record<
  PlanTier,
  {
    name: string;
    monthlyCredits: number;
    price: number;
    features: string[];
    highlighted: boolean;
  }
>;

export const CREDIT_RATES = {
  processingPerMinute: 1,
  subtitlesPerMinute: 0.5,
  bgMusicPerMinute: 0.5,
  splitLayoutPerMinute: 1,
} as const;

export type CalculateClipCreditsInput = {
  durationSeconds: number;
  subtitles?: boolean;
  bgMusic?: boolean;
  splitLayout?: boolean;
};

export function calculateClipCredits({
  durationSeconds,
  subtitles = false,
  bgMusic = false,
  splitLayout = false,
}: CalculateClipCreditsInput) {
  const minutes = Math.ceil(Math.max(0, durationSeconds) / 60);
  let credits = minutes * CREDIT_RATES.processingPerMinute;

  if (subtitles) {
    credits += minutes * CREDIT_RATES.subtitlesPerMinute;
  }

  if (bgMusic) {
    credits += minutes * CREDIT_RATES.bgMusicPerMinute;
  }

  if (splitLayout) {
    credits += minutes * CREDIT_RATES.splitLayoutPerMinute;
  }

  return credits;
}

export function hasEnoughCredits(balance: number, required: number) {
  return balance >= required;
}

export function getPlanMonthlyCredits(planTier: PlanTier) {
  return PLANS[planTier].monthlyCredits;
}
