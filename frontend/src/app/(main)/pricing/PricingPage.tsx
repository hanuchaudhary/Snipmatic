import React from "react";
import { PricingCard } from "./PricingCard";
import { PricingComparison } from "./PriceComparison";
import { FAQSection } from "./FAQs";

export function PricingPage() {
  return (
    <div className="min-h-screen p-4 pt-24 font-jost">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-normal font-instrumental">
            Choose Your Plan
          </h1>
          <p className="text-xl dark:text-neutral-200 font-jost">
            Start free, upgrade when you need more power
          </p>
        </div>

        <div className="rounded-3xl flex flex-col justify-between border-2 dark:border-neutral-700 p-1 mb-12 bg-primary-foreground">
          <div className="flex flex-col gap-4 md:flex-row">
            <PricingCard
              title="Free"
              price="$0 / mo"
              description="Perfect for trying out Snipmatic"
              buttonVariant="outline"
              features={[
                "5 clips per month",
                "720p HD quality",
                "Up to 5-minute videos",
                "1GB storage",
                "MP4 downloads only",
                "Snipmatic watermark",
                "Standard processing queue",
                "Basic trim & cut tools",
                "Community support",
              ]}
            />

            <PricingCard
              title="Pro"
              price="$5 / mo"
              description="For creators who need unlimited power"
              buttonVariant="default"
              highlight
              features={[
                "Unlimited clips",
                "Up to 4K Ultra HD quality",
                "Up to 60-minute videos",
                "100GB storage",
                "Multiple formats (MP4, MOV, AVI, WebM)",
                "No watermark",
                "Priority processing (2x faster)",
                "Advanced filters & effects",
                "Batch processing (up to 10 simultaneous)",
                "Full API access",
                "Priority email support",
                "Custom templates",
                "Advanced analytics",
              ]}
            />
          </div>
        </div>

        <PricingComparison />
        <FAQSection />
      </div>
    </div>
  );
}
