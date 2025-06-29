import { Check } from "lucide-react";
import React from "react";

export function PricingSection() {
  const plans = [
    {
      title: "Starter",
      price: "Free Forever",
      description:
        "Great for exploring the platform with limited monthly credits.",
      credits: "10 credits/month",
      features: [
        "Use credits to create up to 3 reels/month",
        "720p export resolution",
        "Basic editing tools",
        "Manual video uploads",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline",
    },
    {
      title: "Creator",
      price: "$20/month",
      description:
        "Designed for regular creators needing more credits and better tools.",
      credits: "100 credits/month",
      features: [
        "Create unlimited reels (based on credit usage)",
        "1080p HD exports",
        "Advanced AI-powered editing",
        "Automatic caption generation",
        "Direct upload to Instagram & YouTube",
        "Priority processing",
      ],
      buttonText: "Subscribe Now",
      buttonVariant: "primary",
    },
    {
      title: "Agency",
      price: "Custom Pricing",
      description:
        "For teams or agencies with high-volume and advanced needs.",
      credits: "Custom credits/month",
      features: [
        "Everything in Creator plan",
        "4K Ultra HD exports",
        "API access for automation",
        "White-label branding support",
        "Team-based project management",
        "Dedicated account support",
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
    },
  ];

  return (
    <section className="border-b">
      <div className="border-b">
        <div className="md:h-20 h-14 grid grid-cols-10 w-full">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`border-b ${i < 9 ? "border-r" : ""}`}
            ></div>
          ))}
        </div>
        <div className="py-10">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-2">
            Flexible Credit-Based Plans
          </h2>
          <p className="text-muted-foreground md:text-lg text-center max-w-2xl mx-auto">
            Purchase a plan that fits your production volume. Use credits for rendering, AI editing, and more.
          </p>
        </div>
        <div className="md:h-20 h-14 grid grid-cols-10 w-full">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`border-t ${i < 9 ? "border-r" : ""}`}
            ></div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              index === plans.length - 1 ? "" : "border-r"
            } py-14 px-6`}
          >
            <div>
              <h3 className="text-xl font-bold">{plan.title}</h3>
              <p className="text-muted-foreground mt-2 mb-1">
                {plan.description}
              </p>
              <p className="text-primary font-semibold mb-6">
                {plan.price} – {plan.credits}
              </p>
            </div>
            <div>
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center mb-2">
                  <Check className="w-5 h-5 text-emerald-500 mr-2" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
