"use client";

import { CreditPricingSlider } from "@/components/ui/pricing-slider";
import { Card, CardContent } from "@/components/ui/card";

const creditCosts = [
  {
    action: "AI Video Clip",
    cost: "10 credits",
    description: "AI-powered clip generation",
  },
  {
    action: "Manual Clip",
    cost: "5 credits",
    description: "Custom time-based clipping",
  },
  {
    action: "Multiple Clips Add-on",
    cost: "+5 credits",
    description: "Generate multiple clips from one video",
  },
  {
    action: "Subtitles Add-on",
    cost: "+5 credits",
    description: "Add subtitles to your clips",
  },
];

export function CreditPricingPage() {
  return (
    <div className="min-h-screen p-4 pt-24 font-jost">
      <div className="max-w-7xl mx-auto">
        <CreditPricingSlider />
        <div className="mt-16 bg-muted/30 rounded-3xl md:p-8 p-4 backdrop-blur-sm">
          <h3 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h3>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold mb-2">How do credits work?</h4>
              <p className="text-sm text-muted-foreground">
                Credits are deducted when you create clips. AI clips cost 10
                credits, manual clips cost 5 credits, with additional costs for
                extras like multiple clips or subtitles.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Do credits expire?</h4>
              <p className="text-sm text-muted-foreground">
                No! Your credits never expire. Use them whenever you want to
                create clips.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Can I buy more credits?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! You can purchase additional credits at any time. Credits
                stack so you can buy multiple packages.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards through our secure payment
                processor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
