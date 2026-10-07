export const PLAN_TIERS = ["free", "clip", "studio"] as const;

export type PlanTier = (typeof PLAN_TIERS)[number];

export const PLANS = {
  clip: {
    name: "Clip",
    monthlyCredits: 200,
    price: 9,
    features: [
      "200 credits per month",
      "Up to 500 minutes of processing",
      "Subtitles support",
      "Template access",
      "Priority processing",
    ],
    highlighted: false,
  },
  studio: {
    name: "Studio",
    monthlyCredits: 500,
    price: 19,
    features: [
      "500 credits per month",
      "Up to 500 minutes of processing",
      "All templates",
      "Subtitles support",
      "Priority support",
      "Team-ready workflows",
    ],
    highlighted: true,
  },
  free: {
    name: "Free",
    monthlyCredits: 0,
    price: 0,
    features: [],
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
