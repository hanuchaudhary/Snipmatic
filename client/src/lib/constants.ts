export const CREDIT_PACKAGES = [
  { credits: 100, price: 5 },
  { credits: 200, price: 9 },
  { credits: 420, price: 17 },
  { credits: 1250, price: 40 },
  { credits: 2000, price: 75 },
] as const;

export const CREDIT_VALUES = CREDIT_PACKAGES.map((pkg) => pkg.credits);

export const PRICING_CONFIG = {
  USD_TO_INR_RATE: 85,
  BASE_PRICE_PER_CREDIT: 0.055,
  MIN_CREDITS: 100,
} as const;

export const CREDIT_COSTS = {
  AI_CLIP: 10,
  MANUAL_CLIP: 5,
  MULTIPLE_CLIPS_ADDON: 5,
  SUBTITLES_ADDON: 5,
} as const;

export type Currency = "INR" | "USD";

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  popular?: boolean;
}

export const calculatePackagePrice = (
  credits: number,
  currency: Currency = "USD"
): number => {
  const packageData = CREDIT_PACKAGES.find((pkg) => credits <= pkg.credits);
  let priceInUSD: number;

  if (packageData) {
    priceInUSD = packageData.price;
  } else {
    priceInUSD =
      Math.round(credits * PRICING_CONFIG.BASE_PRICE_PER_CREDIT * 100) / 100;
  }

  return currency === "INR"
    ? Math.round(priceInUSD * PRICING_CONFIG.USD_TO_INR_RATE)
    : priceInUSD;
};

export const getPriceForCredits = (
  credits: number
): {
  price: number | null;
  label: string;
  aiClips: number;
  manualClips: number;
  isComingSoon?: boolean;
} => {
  if (credits >= 100000) {
    return {
      price: null,
      label: `${credits.toLocaleString()} credits`,
      aiClips: Math.floor(credits / CREDIT_COSTS.AI_CLIP),
      manualClips: Math.floor(credits / CREDIT_COSTS.MANUAL_CLIP),
    };
  }

  const packageData = CREDIT_PACKAGES.find((pkg) => credits <= pkg.credits);
  if (packageData) {
    if (packageData.price > 17) {
      return {
        price: null,
        label: `${credits.toLocaleString()} credits`,
        aiClips: Math.floor(credits / CREDIT_COSTS.AI_CLIP),
        manualClips: Math.floor(credits / CREDIT_COSTS.MANUAL_CLIP),
        isComingSoon: true,
      };
    }

    return {
      price: packageData.price,
      label: `${credits.toLocaleString()} credits`,
      aiClips: Math.floor(credits / CREDIT_COSTS.AI_CLIP),
      manualClips: Math.floor(credits / CREDIT_COSTS.MANUAL_CLIP),
    };
  }

  const basePricePerCredit = PRICING_CONFIG.BASE_PRICE_PER_CREDIT;
  const price = Math.round(credits * basePricePerCredit);
  return {
    price,
    label: `${credits.toLocaleString()} credits`,
    aiClips: Math.floor(credits / CREDIT_COSTS.AI_CLIP),
    manualClips: Math.floor(credits / CREDIT_COSTS.MANUAL_CLIP),
  };
};
