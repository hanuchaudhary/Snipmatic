"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditPackage,
  PurchaseButton,
} from "@/app/(main)/credits/PurchaseButton";
import { CREDIT_PACKAGES } from "@/lib/creditMiddleware";

export const CREDIT_VALUES = [80, 160, 320, 800, 1600];

const getPriceForCredits = (
  credits: number
): {
  price: number | null;
  label: string;
  aiClips: number;
  manualClips: number;
  isComingSoon?: boolean;
} => {
  if (credits >= 100000)
    return {
      price: null,
      label: `${credits.toLocaleString()} credits`,
      aiClips: Math.floor(credits / 10),
      manualClips: Math.floor(credits / 5),
    };

  const packageData = CREDIT_PACKAGES.find((pkg) => credits <= pkg.credits);
  if (packageData) {
    // Lock pricing after $17 (320 credits package)
    if (packageData.price > 17) {
      return {
        price: null,
        label: `${credits.toLocaleString()} credits`,
        aiClips: Math.floor(credits / 10),
        manualClips: Math.floor(credits / 5),
        isComingSoon: true,
      };
    }
    
    return {
      price: packageData.price,
      label: `${credits.toLocaleString()} credits`,
      aiClips: Math.floor(credits / 10),
      manualClips: Math.floor(credits / 5),
    };
  }

  const basePricePerCredit = 0.055;
  const price = Math.round(credits * basePricePerCredit);
  return {
    price,
    label: `${credits.toLocaleString()} credits`,
    aiClips: Math.floor(credits / 10),
    manualClips: Math.floor(credits / 5),
  };
};

export const CreditPricingSlider: React.FC = () => {
  const [sliderIndex, setSliderIndex] = useState(2);

  const credits = CREDIT_VALUES[sliderIndex];
  const { price, label, aiClips, manualClips, isComingSoon } = getPriceForCredits(credits);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderIndex(Number(e.target.value));
  };

  const packageData: CreditPackage = {
    id: `CUSTOM_${credits}`,
    name: `${credits.toLocaleString()} Credits`,
    credits,
    price: price || 0,
    description: `Custom package with ${credits.toLocaleString()} credits`,
  };

  const pricePerCredit = price ? ((price / credits) * 100).toFixed(1) : null;

  return (
    <section className="md:max-w-4xl mx-auto md:p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-instrumental text-foreground">
            Choose Your <span className="text-orange-400">Credit Package</span>
          </h2>
          <p className="text-muted-foreground">
            Pay only for what you use. No monthly subscriptions.
          </p>
        </div>

        <motion.div
          className="flex flex-col lg:flex-row gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
              },
            },
          }}
        >
          <motion.div
            className="flex-1 border p-2 rounded-[32px] relative"
            variants={{
              hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
              visible: { opacity: 1, y: 0, filter: "blur(0px)" },
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="rounded-3xl h-full w-full border border-border bg-card p-8">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                Calculate your credits
              </h3>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`credits-${credits}`}
                  initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  exit={{ opacity: 0, filter: "blur(8px)", y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {label}
                  </div>
                  <div className="text-sm text-muted-foreground mb-8">
                    {pricePerCredit && `${pricePerCredit}¢ per credit`}
                  </div>
                </motion.div>
              </AnimatePresence>

              <input
                type="range"
                min={0}
                max={CREDIT_VALUES.length - 1}
                step={1}
                value={sliderIndex}
                onChange={handleSliderChange}
                className="w-full appearance-none h-3 rounded bg-muted mb-8"
                style={{
                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${
                    (sliderIndex / (CREDIT_VALUES.length - 1)) * 100
                  }%, #e5e7eb ${
                    (sliderIndex / (CREDIT_VALUES.length - 1)) * 100
                  }%, #e5e7eb 100%)`,
                }}
              />

              <style>{`
              input[type='range']::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 28px;
                height: 28px;
                background: #ffffff;
                border: 2px solid #f97316;
                border-radius: 50%;
                cursor: pointer;
                margin-top: -1px;
                box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
                position: relative;
              }
              input[type='range']::-moz-range-thumb {
                width: 26px;
                height: 26px;
                background: #ffffff;
                border: 2px solid #f97316;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
              }
            `}</style>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`usage-${credits}`}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.08,
                        delayChildren: 0.1,
                      },
                    },
                    hidden: {
                      transition: {
                        staggerChildren: 0.05,
                        staggerDirection: -1,
                      },
                    },
                  }}
                  className="space-y-3 mb-6"
                >
                  <motion.div
                    className="flex justify-between items-center text-sm"
                    variants={{
                      hidden: { opacity: 0, filter: "blur(6px)", x: 20 },
                      visible: { opacity: 1, filter: "blur(0px)", x: 0 },
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <span className="text-muted-foreground">
                      AI Video Clips (10 credits each):
                    </span>
                    <span className="font-semibold text-orange-400">
                      {aiClips} clips
                    </span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between items-center text-sm"
                    variants={{
                      hidden: { opacity: 0, filter: "blur(6px)", x: 20 },
                      visible: { opacity: 1, filter: "blur(0px)", x: 0 },
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <span className="text-muted-foreground">
                      Manual Clips (5 credits each):
                    </span>
                    <span className="font-semibold text-orange-400">
                      {manualClips} clips
                    </span>
                  </motion.div>
                  <motion.div
                    className="text-xs text-muted-foreground mt-2"
                    variants={{
                      hidden: { opacity: 0, filter: "blur(6px)", x: 20 },
                      visible: { opacity: 1, filter: "blur(0px)", x: 0 },
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    + Additional costs: Multiple clips (+5), Subtitles (+5)
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-sm text-muted-foreground">
                <span>Need bulk pricing?</span>
                <a
                  href="mailto:support@snipmatic.com?subject=Enterprise%20pricing"
                  className="text-foreground font-medium flex items-center hover:text-orange-400 transition-colors hover:underline"
                >
                  Contact us
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex-1 border p-2 rounded-[32px] relative"
            variants={{
              hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
              visible: { opacity: 1, y: 0, filter: "blur(0px)" },
            }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            <div className="flex-1 rounded-3xl border border-border bg-card p-8 bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                Your package
              </h3>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`price-${price}-${credits}`}
                  initial={{ opacity: 0, filter: "blur(8px)", scale: 0.95 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, filter: "blur(8px)", scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="mb-6"
                >
                  <h4 className="text-3xl font-bold text-foreground mb-2">
                    {isComingSoon ? "Will Be Available Soon" : price === null ? "Contact us" : `$${price}`}
                  </h4>
                  {price !== null && !isComingSoon && (
                    <div className="text-sm text-muted-foreground">
                      One-time payment
                    </div>
                  )}
                  {isComingSoon && (
                    <div className="text-sm text-orange-400 font-medium">
                      Coming soon
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`features-${credits}`}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.15,
                      },
                    },
                    hidden: {
                      transition: {
                        staggerChildren: 0.05,
                        staggerDirection: -1,
                      },
                    },
                  }}
                  className="space-y-4 mb-8"
                >
                  <motion.div
                    className="flex items-center gap-1"
                    variants={{
                      hidden: { opacity: 0, filter: "blur(6px)", y: 10 },
                      visible: { opacity: 1, filter: "blur(0px)", y: 0 },
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <div className="text-orange-400 font-semibold">*</div>
                    <span className="text-sm">
                      {credits.toLocaleString()} credits included
                    </span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-1"
                    variants={{
                      hidden: { opacity: 0, filter: "blur(6px)", y: 10 },
                      visible: { opacity: 1, filter: "blur(0px)", y: 0 },
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <div className="text-orange-400 font-semibold">*</div>
                    <span className="text-sm">No expiration date</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-1"
                    variants={{
                      hidden: { opacity: 0, filter: "blur(6px)", y: 10 },
                      visible: { opacity: 1, filter: "blur(0px)", y: 0 },
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <div className="text-orange-400 font-semibold">*</div>
                    <span className="text-sm">All features included</span>
                  </motion.div>
                  {/* <motion.div
                    className="flex items-center gap-1"
                    variants={{
                      hidden: { opacity: 0, filter: "blur(6px)", y: 10 },
                      visible: { opacity: 1, filter: "blur(0px)", y: 0 },
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <div className="text-orange-400 font-semibold">*</div>
                    <span className="text-sm">Priority processing</span>
                  </motion.div> */}
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.p
                  key={`description-${
                    credits <= 100
                      ? "small"
                      : credits <= 1000
                      ? "medium"
                      : "large"
                  }`}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.2, ease: "easeOut", delay: 0.2 }}
                  className="text-sm text-muted-foreground leading-relaxed mb-8"
                >
                  {isComingSoon
                    ? "This package will be available soon. Stay tuned for updates on larger credit packages with better value."
                    : price === null
                    ? "Need custom pricing for large volumes? Contact us for enterprise solutions and volume discounts."
                    : credits <= 100
                    ? "Perfect for trying out Snipmatic. Create AI-powered clips and manual clips with no recurring fees."
                    : credits <= 1000
                    ? "Great for regular content creators. Enough credits for consistent clip creation without monthly commitments."
                    : "Ideal for professional creators and teams. Bulk pricing with maximum value per credit."}
                </motion.p>
              </AnimatePresence>

              {isComingSoon ? (
                <motion.button
                  className="w-full px-6 py-3 rounded-lg font-semibold text-sm bg-gray-400 text-gray-600 cursor-not-allowed"
                  disabled={true}
                >
                  Coming Soon
                </motion.button>
              ) : price === null ? (
                <motion.button
                  className="w-full px-6 py-3 rounded-lg font-semibold text-sm bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => window.location.href = "mailto:support@snipmatic.com?subject=Enterprise%20pricing"}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  Contact Sales
                </motion.button>
              ) : (
                <PurchaseButton
                  package={packageData}
                  className="w-full px-6 py-3 rounded-lg font-semibold text-sm transition-colors bg-orange-500 cursor-pointer hover:bg-orange-600 text-white"
                >
                  Purchase Credits
                </PurchaseButton>
              )}
            </div>
          </motion.div>
        </motion.div>
      </section>
  );
};
