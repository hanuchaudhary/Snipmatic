export const PLAN_TIERS = ["influencer", "studio"] as const;

export type PlanTier = (typeof PLAN_TIERS)[number];

export const PLANS = {
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
    highlighted: false,
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
    highlighted: true,
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
} as const;

export type CalculateClipCreditsInput = {
  durationSeconds: number;
  subtitles?: boolean;
};

export function calculateClipCredits({
  durationSeconds,
  subtitles = false,
}: CalculateClipCreditsInput) {
  const minutes = Math.ceil(Math.max(0, durationSeconds) / 60);
  let credits = minutes * CREDIT_RATES.processingPerMinute;

  if (subtitles) {
    credits += minutes * CREDIT_RATES.subtitlesPerMinute;
  }

  return credits;
}

export function hasEnoughCredits(balance: number, required: number) {
  return balance >= required;
}

export function getPlanMonthlyCredits(planTier: PlanTier) {
  return PLANS[planTier].monthlyCredits;
}
